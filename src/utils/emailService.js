


const axios = require('axios');
const FormData = require('form-data');
const sendEmail = async ({ to, subject, html, otp }) => {
  try {
    const formData = new FormData();
    formData.append('from', process.env.MAILGUN_FROM_EMAIL);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', html);
    formData.append('text', `Your OTP is: ${otp}`); // fallback plain text

    const response = await axios.post(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      formData,
      {
        auth: {
          username: 'api',
          password: process.env.MAILGUN_API_KEY
        },
        headers: formData.getHeaders()
      }
    );
    return response.data;
  } catch (err) {
    console.error('Mailgun sendEmail error:', err.response?.data || err.message);
    throw err;
  }
};
module.exports = { sendEmail };