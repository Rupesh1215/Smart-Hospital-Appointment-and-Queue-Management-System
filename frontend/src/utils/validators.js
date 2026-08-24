/**
 * Validate email format
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number (basic: 10+ digits)
 */
export function isValidPhone(phone) {
  return /^\+?[\d\s-]{10,}$/.test(phone);
}

/**
 * Check if a string is non-empty after trimming
 */
export function isRequired(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate minimum length
 */
export function hasMinLength(value, min) {
  return typeof value === 'string' && value.length >= min;
}

/**
 * Validate password strength
 */
export function isStrongPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
}

/**
 * Validate date is not in the past
 */
export function isNotPastDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}
