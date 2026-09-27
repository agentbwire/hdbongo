/**
 * Tanzania mobile numbers -> 255XXXXXXXXX (international format, no + sign).
 */
function normalizeTanzanianPhone(input) {
  let digits = String(input == null ? '' : input).replace(/[^0-9+]/g, '');
  if (digits.charAt(0) === '+') digits = digits.slice(1);
  if (digits.indexOf('255') === 0) digits = digits.slice(3).replace(/^0+/, '');
  else if (digits.charAt(0) === '0') digits = digits.slice(1);
  else if (digits.length > 9) digits = digits.slice(-9);
  digits = digits.replace(/^0+/, '');
  if (!/^[67][0-9]{8}$/.test(digits)) return null;
  return '255' + digits;
}

module.exports = { normalizeTanzanianPhone };
