/**
 * POST /api/payments/webhook?provider=mongike
 *
 * Mongike calls this once a payment reaches COMPLETED. The package is switched on
 * here — never from the browser — and the call is idempotent, so a repeated
 * notification cannot credit twice.
 *
 * Always answers HTTP 200, otherwise Mongike keeps retrying.
 */
const { getDb, FieldValue } = require('../_lib/admin');
const { getPackage, expiryFor } = require('../_lib/packages');
const { sendJson, readBody } = require('../_lib/http');

const ORDER_PREFIX = 'HDC';

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });

  try {
    // 1. Prove the caller knows our key.
    const expected = process.env.MONGIKE_API_KEY;
    const provided = req.headers['x-api-key'];
    if (!expected || provided !== expected) {
      console.warn('Webhook rejected: x-api-key mismatch');
      return sendJson(res, 401, { ok: false });
    }

    const body = readBody(req);
    const orderId = String(body.order_id || '');
    const paymentStatus = String(body.payment_status || body.status || '').toUpperCase();

    // 2. Anything that is not COMPLETED is acknowledged and ignored.
    if (paymentStatus !== 'COMPLETED') {
      return sendJson(res, 200, { ok: true, ignored: paymentStatus || 'unknown' });
    }
    if (!orderId) return sendJson(res, 200, { ok: true, ignored: 'missing order_id' });

    // 3. order_id is HDC-<payment document id>.
    const paymentId = orderId.indexOf(ORDER_PREFIX + '-') === 0 ? orderId.slice(ORDER_PREFIX.length + 1) : orderId;

    const db = getDb();
    const paymentRef = db.collection('payments').doc(paymentId);
    const snap = await paymentRef.get();
    if (!snap.exists) {
      console.warn('Webhook for an unknown payment:', paymentId);
      return sendJson(res, 200, { ok: true, ignored: 'unknown payment' });
    }

    const payment = snap.data();

    // 4. Idempotency: already handled.
    if (payment.status === 'completed') {
      return sendJson(res, 200, { ok: true, alreadyProcessed: true });
    }

    await paymentRef.set({
      status: 'completed',
      verified_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
      gateway_response: body,
      reference: body.reference || null
    }, { merge: true });

    // 5. Switch the package on for the account (server-only write).
    if (payment.user_id) {
      const pkg = getPackage(payment.plan_id);
      if (pkg) {
        const userRef = db.collection('users').doc(String(payment.user_id));
        const userSnap = await userRef.get();
        const existing = userSnap.exists ? (userSnap.data() || {}) : {};
        const receipts = Array.isArray(existing.payments) ? existing.payments.slice(-49) : [];
        receipts.push({
          id: paymentId,
          order_id: orderId,
          plan: pkg.id,
          plan_name: pkg.name,
          amount: payment.amount,
          currency: payment.currency || 'TZS',
          points: payment.points_purchased || 0,
          method: payment.payment_method || null,
          reference: body.reference || null,
          status: 'completed',
          at: new Date().toISOString()
        });

        const update = {
          plan: pkg.id,
          planExpiresAt: expiryFor(pkg, existing.planExpiresAt),
          payments: receipts,
          updatedAt: FieldValue.serverTimestamp()
        };
        if (payment.points_purchased) update.points = FieldValue.increment(Number(payment.points_purchased));
        await userRef.set(update, { merge: true });
      } else {
        console.warn('Payment has no known package:', payment.plan_id);
      }
    }

    return sendJson(res, 200, { ok: true });
  } catch (err) {
    // Still 200: a retry storm helps nobody, and the record can be repaired by hand.
    console.error('webhook failed:', err);
    return sendJson(res, 200, { ok: true, error: 'handled' });
  }
};
