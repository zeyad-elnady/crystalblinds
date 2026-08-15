/**
 * Validation utilities for customer forms
 */

/**
 * Validates whether a phone number is a valid Egyptian mobile number.
 * Accepts:
 * - 010xxxxxxxx, 011xxxxxxxx, 012xxxxxxxx, 015xxxxxxxx (11 digits)
 * - +2010xxxxxxxx, +2011xxxxxxxx, +2012xxxxxxxx, +2015xxxxxxxx
 * - 002010xxxxxxxx, 2010xxxxxxxx
 */
export function isValidEgyptianPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.trim().replace(/[\s\-\(\)\.]+/g, '');
  const egRegex = /^(?:\+?20|0020)?0?1[0125]\d{8}$/;
  return egRegex.test(cleaned);
}

/**
 * Sanitizes phone input to keep only valid phone digits and leading +
 */
export function sanitizePhoneInput(input: string): string {
  if (!input) return '';
  return input.replace(/[^\d+]/g, '');
}
