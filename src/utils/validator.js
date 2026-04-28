const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  return passwordRegex.test(password);
};

const validatePhoneNumber = (phone) => {
  return validator.isMobilePhone(phone, 'any');
};

const validateUsername = (username) => {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const validateFieldsRegistration = (email, password, confirmPassword) => {
  const errors = {};

  if (!email || !validateEmail(email)) {
    errors.email = 'Invalid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

const validateFieldsProfile = (firstName, lastName, dateOfBirth, gender, phoneNumber) => {
  const errors = {};

  if (!firstName || firstName.trim() === '') {
    errors.firstName = 'First name is required';
  }

  if (!lastName || lastName.trim() === '') {
    errors.lastName = 'Last name is required';
  }

  if (!dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    if (age < 13) {
      errors.dateOfBirth = 'You must be at least 13 years old';
    }
  }

  if (!gender) {
    errors.gender = 'Gender is required';
  }

  if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
    errors.phoneNumber = 'Invalid phone number';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

// Validate registration with enhanced fields (name, phone, fcmToken)
const validateEnhancedRegistration = (name, email, phone, password, confirmPassword) => {
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!email || !validateEmail(email)) {
    errors.email = 'Invalid email address';
  }

  if (!phone || !validatePhoneNumber(phone)) {
    errors.phone = 'Invalid phone number';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateUsername,
  validateFieldsRegistration,
  validateFieldsProfile,
  validateEnhancedRegistration,
};
