import { adminAppUrl } from "../constants";
import nodemailer from "nodemailer";

export const sendPasswordResetMail = async (
  email: string,
  resetToken: string
) => {
  const resetLink = `${adminAppUrl}/confirm-reset?token=${resetToken}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Replace with your SMTP host
    port: 587, // Common port for SMTP
    secure: false, // Set to true if using a secure connection (port 465)
    auth: {
      user: process.env.SMTP_EMAIL, // Your email
      pass: process.env.SMTP_PASSWORD, // Your email password or app-specific password
    },
  });

  // Email options
  const mailOptions = {
    from: `"Admin Mecca" ${process.env.SMTP_EMAIL}`, // Sender address
    to: email, // Receiver address
    subject: "Reset your admin password", // Subject line
    text: `Click the link to reset your password: ${resetLink} \n The Link is valid for 1 hour`, // Plain text body
  };

  // Send email
  await transporter.sendMail(mailOptions);
};
