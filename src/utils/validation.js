// Sri Lanka Phone Number
// Formats: 07XXXXXXXX or +947XXXXXXXX or 0094XXXXXXXXX
export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\s/g, '');
  const patterns = [
    /^07[0-9]{8}$/,           // 07XXXXXXXX
    /^\+947[0-9]{8}$/,        // +947XXXXXXXX
    /^00947[0-9]{8}$/         // 00947XXXXXXXX
  ];
  return patterns.some(p => p.test(cleaned));
};

// Sri Lanka NIC
// Old format: 9 digits + V or X  e.g. 123456789V
// New format: 12 digits           e.g. 200012345678
export const validateNIC = (nic) => {
  const oldNIC = /^[0-9]{9}[VXvx]$/;
  const newNIC = /^[0-9]{12}$/;
  return oldNIC.test(nic) || newNIC.test(nic);
};

// Email — standard format
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Password — min 8 chars, at least one number
export const validatePassword = (password) => {
  return password.length >= 8 && /[0-9]/.test(password);
};

// Name — at least 2 chars, no numbers
export const validateName = (name) => {
  return name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
};

// Get specific error messages
export const getPhoneError = (phone) => {
  if (!phone) return 'Phone number is required';
  if (!validatePhone(phone)) return 'Enter a valid Sri Lanka number (e.g. 0771234567)';
  return '';
};

export const getNICError = (nic) => {
  if (!nic) return 'NIC is required';
  if (!validateNIC(nic)) return 'Enter valid NIC (e.g. 123456789V or 200012345678)';
  return '';
};

export const getEmailError = (email) => {
  if (!email) return 'Email is required';
  if (!validateEmail(email)) return 'Enter a valid email address';
  return '';
};

export const getPasswordError = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return '';
};

export const getNameError = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name must contain only letters';
  return '';
};