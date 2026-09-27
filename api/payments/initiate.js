/**
 * POST /api/payments/initiate
 *
 * Starts a mobile money collection: validates the number, looks the price up on the
 * server, records the attempt as `pending`, then asks Mongike to push the PIN prompt
 * to the customer's phone. The package is switched on later, by the verified
 * webhook — never from the browser.
 */
const { getDb, FieldValue } = require('../_lib/admin');
const { getPackage } = require('../_lib/packages');
const { normalizeTanzanianPhone } = require('../_lib/phone');
const { initiateMobileMoneyPayment } = require('../_lib/mongike');
const { sendJson, readBody } = require('../_lib/http');

const ORDER_PREFIX = 'HDC';

function siteUrl(req) {
  if (process.env.SITE_URL) return String(process.env.SITE_URL).replace(/\/+$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return proto + '://' + host;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'POST') return sendJson(res, 405, { success: false, error: 'Method not allowed' });

  try {
    const body = readBody(req);
    const userId = body.userId ? String(body.userId) : '';
    const pkg = getPackage(body.packageId);

    if (!pkg) return sendJson(res, 400, { success: false, error: 'Kifurushi hakijulikani' });
    if (!userId) return sendJson(res, 400, { success: false, error: 'Ingia kwenye akaunti yako kwanza' });

    const phone = normalizeTanzanianPhone(body.phoneNumber);
    if (!phone) return sendJson(res, 400, { success: false, error: 'Nambari ya simu si sahihi. Mfano: 0741234567' });

    const db = getDb();
    const paymentRef = db.collection('payments').doc();
    const paymentId = paymentRef.id;
    const orderId = ORDER_PREFIX + '-' + paymentId;
    const webhookUrl = siteUrl(req) + '/api/payments/webhook?provider=mongike';

    await paymentRef.set({
      user_id: userId,
      buyer_phone: phone,
      buyer_name: body.buyerName ? String(body.buyerName) : null,
      buyer_email: body.buyerEmail ? String(body.buyerEmail) : null,
      amount: pkg.amount,
      currency: 'TZS',
      points_purchased: pkg.points,
      plan_id: pkg.id,
      plan_days: pkg.days,
      payment_method: body.paymentMethod ? String(body.paymentMethod) : 'mobile_money',
      phone_number: phone,
      order_id: orderId,
      transaction_ref: null,
      gateway_response: null,
      status: 'pending',
      verified_at: null,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    });

    const result = await initiateMobileMoneyPayment({
      order_id: orderId,
      amount: pkg.amount,
      buyer_phone: phone,
      fee_payer: 'MERCHANT',
      buyer_name: body.buyerName ? String(body.buyerName) : undefined,
      buyer_email: body.buyerEmail ? String(body.buyerEmail) : undefined,
      webhook_url: webhookUrl,
      metadata: { app: 'hdbongo', payment_id: paymentId, plan_id: pkg.id, user_id: userId }
    });

    if (!result.ok) {
      await paymentRef.set({
        status: 'failed',
        gateway_response: result.data || null,
        updated_at: FieldValue.serverTimestamp()
      }, { merge: true });
      const message = (result.data && (result.data.message || result.data.error)) || 'Malipo hayakuanzishwa. Jaribu tena.';
      console.error('Mongike rejected the request:', result.status, message);
      return sendJson(res, 502, { success: false, error: message });
    }

    const payload = (result.data && result.data.data) || {};
    await paymentRef.set({
      transaction_ref: payload.id || payload.gateway_ref || null,
      gateway_response: result.data,
      updated_at: FieldValue.serverTimestamp()
    }, { merge: true });

    return sendJson(res, 201, {
      success: true,
      paymentId: paymentId,
      orderId: orderId,
      message: 'Payment initiated',
      instructions: 'Angalia simu yako na uthibitishe malipo kwa PIN yako.'
    });
  } catch (err) {
    console.error('initiate failed:', err);
    return sendJson(res, 500, { success: false, error: 'Hitilafu ya mfumo. Jaribu tena.' });
  }
};
