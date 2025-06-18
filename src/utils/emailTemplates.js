// otpEmailTemplatei
const juice = require('juice');
function otpEmailTemplate(otp, email = '') {


  const rawhtml = `<!DOCTYPE html>

<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
  <style>
    @media only screen and (max-width: 620px) {
      .container {
        width: 100% !important;
        padding: 1rem !important;
      }

      .otp-code {
        font-size: 24px !important;
        padding: 12px 24px !important;
        letter-spacing: 8px !important;
      }

      .header img {
        height: 40px !important;
      }
    }
  </style>
</head>

<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background: #F5F5FF;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F5F5FF;">
    <tr>
      <td align="center">
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width: 620px; width: 100%; background: #ffffff; border-radius: 16px; padding: 40px; margin: 50px auto; box-shadow: 0 4px 20px rgba(123, 97, 255, 0.1);">
          <tr>
            <td align="center" class="header" style="text-align: center; padding-bottom: 20px;">
              <img src="https://cdn.sanity.io/images/erxyk65j/production/5e23990073e3bbc0066b83855e5d734223ef5081-1494x440.png"
                alt="Logo" style="height: 60px; object-fit: contain;">
              <div style="height: 4px; width: 60px; background: #7B61FF; margin: 20px auto 0; border-radius: 2px;"></div>
            </td>
          </tr>

          <tr>
            <td style="background: #F9F9FF; border-radius: 12px; padding: 24px; text-align: center;">
              <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Dear ${email || 'Valued User'},</p>
              <p style="font-size: 16px; color: #333; margin: 0 0 16px;">Your One-Time Password (OTP) for secure login
                is:</p>

              <div class="otp-code"
                style="display: inline-block; font-size: 40px; font-weight: 700; color: #fff; letter-spacing: 12px; background: #7B61FF; padding: 16px 40px; border-radius: 12px; margin: 24px 0;">
                ${otp}
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 16px;">
                This OTP is valid for <strong>2 minutes</strong>. Please do not share it with anyone.
              </p>
              <p
  style="background: #E6E1FF; color: #7B61FF; font-size: 13px; font-weight: 500; padding: 8px 16px; border-radius: 8px; display: inline-block; margin-top: 16px;">
  Didn’t request this? <a href="mailto:getinfo@designersx.in?subject=Support Request&body=Hello, I need help with...">Contact our support team immediately.</a>
</p>
 
            </td>
          </tr>

          <tr>
            <td class="footer"
              style="text-align: center; font-size: 12px; color: #999999; margin-top: 40px; padding-top: 24px;">
              <p style="margin: 0;">
                © 2025 <a href="https://rexpt.in"
                  style="color: #7B61FF; text-decoration: none; font-weight: 500;">Rexpt.in</a>. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>

</html>`
  return juice(rawhtml)
}

module.exports = {
  otpEmailTemplate,
};
// sendScriptTemplate
function escapeHTML(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function sendScriptTemplate(script) {
  const escapedScript = escapeHTML(script);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Script Template - Rexpt.in</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f9f9f9;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 700px;
      margin: 40px auto;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.05);
      padding: 30px;
      position: relative;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #7B61FF;
      font-size: 24px;
      margin-bottom: 8px;
    }
    .header p {
      color: #888;
      font-size: 14px;
    }
    pre {
      background-color: #f0f0ff;
      padding: 20px;
      overflow-x: auto;
      border-left: 5px solid #7B61FF;
      border-radius: 6px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      white-space: pre-wrap;
      word-wrap: break-word;
      color: #222;
      position: relative;
    }
    .copy-btn {
      position: absolute;
      top: 30px;
      right: 30px;
      background: #7B61FF;
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #aaa;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Rexpt.in</h1>
      <p>Your Script is Ready to Use</p>
    </div>

  

    <pre><code id="script">
Dear developer,

We hope you're doing well!

Please find the script below that needs to be added to the Head section of your website's code. Once it's in place, the AI Receptionist will be live and ready to assist your visitors.

${escapedScript}

If you need any further assistance or have questions, feel free to reach out.

Thank You!
Rexpt Team
    </code></pre>

    <div class="footer">
      &copy; 2025 Rexpt.in — All rights reserved.
    </div>
  </div>

  <script>
    function copyScript() {
      const codeElement = document.getElementById("script");
      const textToCopy = codeElement.innerText || codeElement.textContent;

      navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Script copied to clipboard!");
      }).catch(err => {
        alert("Failed to copy script. Please copy manually.");
        console.error(err);
      });
    }
  </script>
</body>
</html>
`;
}
module.exports = {
  otpEmailTemplate,
  sendScriptTemplate
};