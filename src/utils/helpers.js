import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const cleanPhone = (phone) => {
  return phone.toString().trim();
};

export const cleanLicenseKey = (key) => {
  return key.toString().trim().toUpperCase();
};