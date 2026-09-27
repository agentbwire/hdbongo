/**
 * Mongike mobile money collection.
 * POST https://mongike.com/api/v1/payments/mobile-money/tanzania
 */
const MONGIKE_INITIATE_URL = 'https://mongike.com/api/v1/payments/mobile-money/tanzania';

async function initiateMobileMoneyPayment(payload) {
  const key = process.env.MONGIKE_API_KEY;
  if (!key) throw new Error('MONGIKE_API_KEY is not set');

  const response = await fetch(MONGIKE_INITIATE_URL, {
    method: 'POST',
    headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

  return { ok: response.ok, status: response.status, data };
}

module.exports = { initiateMobileMoneyPayment, MONGIKE_INITIATE_URL };
