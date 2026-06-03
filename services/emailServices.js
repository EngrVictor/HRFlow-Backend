import nodemailer from "nodemailer";

// send email function that takes destination email address,subject and body text
const sendEmail = async (to, subject, text) => {
  try {
    // 1. Build the digital mail carrier transporter using your environment credentials
    const transporter = nodemailer.createTransport({
      service: "gmail", // Utilizing Gmail server settings
      auth: {
        user: process.env.EMAIL_USER, // Your project's gmail account from the .env file
        pass: process.env.EMAIL_PASS, // The custom generated Google App Password
      },
    });

    // 2. Wrap the package up with clear "From", "To", "Subject", and "Body" definitions
    const mailOptions = {
      from: "HRFlow Africa Notification " + process.env.EMAIL_USER,
      to: to, // destination email address
      subject: subject,
      text: text,
    };
    // tells the transporter to deliver the email across the web
    const info = await transporter.sendMail(mailOptions);

    console.log("Email successfully sent:", info.messageId);

    return true;
  } catch (error) {
    console.error("Email failed to send:", error.message);
    return false;
  }
};

export default sendEmail;
