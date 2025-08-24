const emailTemplate = otp => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OTP Verification Email</title>
    <style>
      body { margin:0; padding:0; background:#000000; font-family: Arial, Helvetica, sans-serif; }
      .container { width:100%; max-width:600px; margin:0 auto; background:#0b0b0b; border-radius:12px; overflow:hidden; }
      .header { padding:24px; text-align:center; border-bottom:1px solid #1f1f1f; }
      .header span { color:#fff; font-size:20px; font-weight:bold; }
      .content { padding:32px 28px; text-align:center; color:#cfcfcf; }
      .content h1 { color:#ffffff; font-size:24px; margin-bottom:16px; }
      .otp-box { display:inline-block; padding:16px 32px; background:#111; border:1px solid #2a2a2a; border-radius:8px; font-size:28px; font-weight:bold; color:#ffffff; letter-spacing:4px; margin:20px 0; }
      .footer { padding:20px; text-align:center; font-size:12px; color:#9aa0a6; border-top:1px solid #1f1f1f; background:#0a0a0a; }
      @media screen and (max-width:600px) {
        .content { padding:24px 16px; }
        .otp-box { font-size:24px; padding:14px 24px; }
      }
    </style>
  </head>
  <body>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <div class="container">
            <div class="content">
              <h1>Email Verification</h1>
              <p>Use the OTP below to verify your email address. This code will expire in <strong> 5 minutes</strong>.</p>
              <div class="otp-box">${otp}</div>
              <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              © 2025 AUTHORAIZATION. All rights reserved. <br/>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};

module.exports = { emailTemplate };
