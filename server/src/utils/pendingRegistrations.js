

const pendingRegistrations = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [email, data] of pendingRegistrations.entries()) {
    if (data.expiresAt < now) {
      pendingRegistrations.delete(email);
    }
  }
}, 15 * 60 * 1000);

/**
 * @param {string} email 
 * @param {object} registrationData 
 * @param {string} otpHash 
 * @param {Date} expiresAt 
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
 * @param {string} email 
 * @returns {object|null} 
 */
export const getPendingRegistration = (email) => {
  const data = pendingRegistrations.get(email);
  if (!data) return null;
  
  if (data.expiresAt < Date.now()) {
    pendingRegistrations.delete(email);
    return null;
  }
  
  return data;
};

/**
 * @param {string} email 
 */
export const removePendingRegistration = (email) => {
  const deleted = pendingRegistrations.delete(email);
    if (deleted) {
    console.log(`Removed pending registration for: ${email}`);
  }
  return deleted;
};

/**
 * @param {string} email 
 * @param {string} otpHash 
 * @param {Date} expiresAt 
 * @returns {boolean} 
 */
export const updatePendingOTP = (email, otpHash, expiresAt) => {
  const data = pendingRegistrations.get(email);
  if (!data) return false;
  
  data.otpHash = otpHash;
  data.expiresAt = expiresAt.getTime();
  console.log(`Updated OTP for pending registration: ${email}`);
  return true;
};
