// In-memory storage for pending student registrations
// TODO: For production, use Redis or a database table for persistence

const pendingRegistrations = new Map();

// Cleanup expired registrations every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of pendingRegistrations.entries()) {
    if (data.expiresAt < now) {
      pendingRegistrations.delete(email);
      console.log(`Cleaned up expired registration for: ${email}`);
    }
  }
}, 15 * 60 * 1000);

/**
 * Store pending registration data
 * @param {string} email - Student email
 * @param {object} registrationData - All registration data
 * @param {string} otpHash - Hashed OTP
 * @param {Date} expiresAt - OTP expiration time
 */
export const storePendingRegistration = (email, registrationData, otpHash, expiresAt) => {
  pendingRegistrations.set(email, {
    ...registrationData,
    otpHash,
    expiresAt: expiresAt.getTime(),
    createdAt: Date.now(),
  });
  console.log(`Stored pending registration for: ${email}`);
};

/**
 * Get pending registration data
 * @param {string} email - Student email
 * @returns {object|null} Registration data or null if not found/expired
 */
export const getPendingRegistration = (email) => {
  const data = pendingRegistrations.get(email);
  if (!data) return null;
  
  // Check if expired
  if (data.expiresAt < Date.now()) {
    pendingRegistrations.delete(email);
    return null;
  }
  
  return data;
};

/**
 * Remove pending registration after successful verification
 * @param {string} email - Student email
 */
export const removePendingRegistration = (email) => {
  const deleted = pendingRegistrations.delete(email);
    if (deleted) {
    console.log(`Removed pending registration for: ${email}`);
  }
  return deleted;
};

/**
 * Update OTP for existing pending registration
 * @param {string} email - Student email
 * @param {string} otpHash - New hashed OTP
 * @param {Date} expiresAt - New expiration time
 * @returns {boolean} Success status
 */
export const updatePendingOTP = (email, otpHash, expiresAt) => {
  const data = pendingRegistrations.get(email);
  if (!data) return false;
  
  data.otpHash = otpHash;
  data.expiresAt = expiresAt.getTime();
  console.log(`Updated OTP for pending registration: ${email}`);
  return true;
};
