const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 587,
  auth: {
    user: 'b275c0573c598e',
    pass: '702997061b6b54'
  }
});

module.exports = async (to, subject, html) => {
  await transporter.sendMail({
    from: '"Study Group" <no-reply@studygroup.com>',
    to,
    subject,
    html
  });
};
