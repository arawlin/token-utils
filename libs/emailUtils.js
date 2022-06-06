const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  secure: true,
  auth: {
    user: process.env.EMAIL_NAME,
    pass: process.env.EMAIL_PASS,
  },
})

const send = async (subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_NAME,
      to: process.env.EMAIL_TO,
      subject,
      text,
    })

    console.log(info.messageId)
  } catch (e) {
    console.error(e)
  }
}

module.exports = {
  send,
}
