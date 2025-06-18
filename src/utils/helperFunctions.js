//generate OTP
async function generateOTP(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}
// Generate a end user ID
async function generateEndUserId() {
  // Random 6 chars (A-Z, 0-9)
  const randomPart = [...Array(4)].map(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }).join('');

  const timestampPart = Math.floor(Date.now());

  // Combine and slice if too long (make fixed length 16)
  let id = `RX${randomPart}${timestampPart}`;
  if (id.length > 12) id = id.substring(0, 16);
  return id;
}

module.exports = { generateEndUserId,generateOTP };