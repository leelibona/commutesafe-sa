// Simple form checks. Each returns an error message, or '' when the value is fine.

export const validateEmail = (v) => {
  if (!v?.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Enter a valid email address';
  return '';
};

export const validatePassword = (v) => {
  if (!v) return 'Password is required';
  if (v.length < 6) return 'Password must be at least 6 characters';
  return '';
};

export const validateName = (v) => {
  if (!v?.trim()) return 'Please enter your name';
  if (v.trim().length < 2) return 'Name is too short';
  return '';
};

/**
 * South African number plates come in many provincial formats
 * (CA 123-456, CA 123 456, ND 12345, GP: ABC 123 GP, personalised, etc.),
 * so we only check for a sensible length and characters.
 */
export const normalisePlate = (v = '') => v.toUpperCase().replace(/\s+/g, ' ').trim();

export const validatePlate = (v, { required = false } = {}) => {
  const p = normalisePlate(v);
  if (!p) return required ? 'Enter a registration number' : '';
  if (!/^[A-Z0-9 -]{4,12}$/.test(p)) return 'Use letters, numbers, spaces or dashes (4–12 characters)';
  if (!/[0-9]/.test(p)) return 'A registration usually contains numbers';
  return '';
};