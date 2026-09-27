/**
 * Prices live here (server side) so a package amount can never be edited in the browser.
 */
const PACKAGES = {
  weekly: { id: 'weekly', name: 'Wiki', amount: 2000, days: 7, points: 0 },
  monthly: { id: 'monthly', name: 'Mwezi', amount: 5000, days: 30, points: 0 }
};

function getPackage(id) {
  const key = String(id || '').toLowerCase();
  return Object.prototype.hasOwnProperty.call(PACKAGES, key) ? PACKAGES[key] : null;
}

/** ISO string, so both the server and the browser can compare it easily. */
function expiryFor(pkg, fromIso) {
  const now = Date.now();
  const from = fromIso ? Date.parse(fromIso) : 0;
  const base = from && from > now ? from : now;
  return new Date(base + pkg.days * 86400000).toISOString();
}

module.exports = { PACKAGES, getPackage, expiryFor };
