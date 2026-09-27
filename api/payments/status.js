/**
 * GET /api/payments/status?id=<paymentId>
 * The page polls this every 5 seconds while the customer approves on their phone.
 */
const { getDb } = require('../_lib/admin');
const { sendJson } = require('../_lib/http');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });
  if (req.method !== 'GET') return sendJson(res, 405, { status: 'error', error: 'Method not allowed' });

  try {
    const url = new URL(req.url, 'https://placeholder.local');
    const id = url.searchParams.get('id');
    if (!id) return sendJson(res, 400, { status: 'error', error: 'id is required' });

    const db = getDb();
    const snap = await db.collection('payments').doc(String(id)).get();
    if (!snap.exists) return sendJson(res, 404, { status: 'unknown' });

    const payment = snap.data();
    let newBalance = null;
    let plan = payment.plan_id || null;

    if (payment.user_id && payment.status === 'completed') {
      const userSnap = await db.collection('users').doc(String(payment.user_id)).get();
      if (userSnap.exists) {
        const user = userSnap.data() || {};
        newBalance = Number(user.points || 0);
        plan = user.plan || plan;
      }
    }

    return sendJson(res, 200, {
      status: payment.status,
      points: payment.points_purchased || 0,
      newBalance: newBalance,
      plan: plan
    });
  } catch (err) {
    console.error('status check failed:', err);
    return sendJson(res, 500, { status: 'error', error: 'status check failed' });
  }
};
