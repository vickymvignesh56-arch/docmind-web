import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_EXTENSIONS } from './constants';

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  // Backend rule: uppercase, lowercase, digit, special character from @$!%*#?&
  const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!strongPasswordRegex.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*#?&)';
  }
  return null;
};

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 100) return 'Name cannot exceed 100 characters';
  return null;
};

export const validateFile = (file) => {
  if (!file) return 'Please select a file to upload';

  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    return `Unsupported file format: ${ext}. Only PDF and DOCX files are supported.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File size exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
  }

  return null;
};
