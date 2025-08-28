const nodemailer = require('nodemailer');
// const {emailTemplate} = require("./emailTemplate")

const sendEmail = async ({ email, subject, templete, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    // secure: process.env.SMTP_SECURE,
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.USER_PASS,
    },
  });

  const mailOptions = {
    from: process.env.USER_MAIL,
    to: email,
    subject: subject,
    html: templete,
    text: message || '',
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
