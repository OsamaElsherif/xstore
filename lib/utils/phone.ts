/**
 * Formats a stored local Egyptian phone number to E.164 for WhatsApp.
 *
 * Input examples that all produce "+201012345678":
 *   "01012345678"   ← local with leading zero
 *   "1012345678"    ← local without leading zero
 *   "+201012345678" ← already E.164
 *   "201012345678"  ← country code without +
 */
export function toE164Egypt(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '')
  // Strip country code if already present
  if (digits.startsWith('20') && digits.length > 10) {
    digits = digits.slice(2)
  }
  // Strip leading zero (Egyptian local format)
  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  return `+20${digits}`
}
/**
 * Formats for display inside the PhoneInput component.
 * Returns only the local digits without leading zero or country code.
 *
 * Input "+201012345678" → "1012345678"
 * Input "01012345678"   → "1012345678"
 */
export function toLocalDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('20') && digits.length > 10) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits
}
/**
 * Validates an Egyptian mobile number.
 * Must be 10 digits starting with 1 (after stripping country code/zero).
 */
export function isValidEgyptianPhone(phone: string): boolean {
  const local = toLocalDigits(phone)
  return /^1[0-9]{9}$/.test(local)
}