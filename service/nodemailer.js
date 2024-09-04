const nodemailer = require('nodemailer');

const sendVerifyEmail = async (userEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'westernnine1@gmail.com', // Replace with your Gmail address
        pass: 'hbah azaa onnn odjn', // Replace with your Gmail password or app password
      },
    });

    const mailOptions = {
      from: 'Western19',
      to: userEmail,
      subject: 'Email Verification OTP',
      text: `Your OTP code is ${otp}. Please enter this code to verify your email address.`,
      html: `<p>Your OTP code is <strong>${otp}</strong>. Please enter this code to verify your email address.</p>`,
    };
 
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Sending email failed:', error);
  }
};

module.exports = sendVerifyEmail;
