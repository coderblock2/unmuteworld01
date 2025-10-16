const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Pre-flight check for required environment variables
  const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      const errorMessage = `Missing required environment variable for email: ${varName}. Please check your .env file.`;
      console.error(errorMessage);
      throw new Error('Email service is not configured. Please check server logs.');
    }
  }

  // 1. Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      // Google App Passwords are often displayed with spaces. This removes them.
      pass: process.env.EMAIL_PASS.replace(/\s/g, ''),
    },
    connectionTimeout: 10000, // 10 seconds
  });

  // 2. Define the email options
  const mailOptions = {
    from: process.env.EMAIL_FROM, // sender address
    to: options.email,            // list of receivers
    subject: options.subject,     // Subject line
    html: options.html,           // html body
  };

  // 3. Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email with nodemailer: ', error);
    
    let friendlyMessage = 'An unexpected error occurred with the email service. Please check the server logs for the full error details.';

    // Check for authentication errors, which are the most common issue.
    if (error.code === 'EAUTH' || (error.responseCode && error.responseCode === 535)) {
        friendlyMessage = 'Email authentication failed. Please check your EMAIL_USER and EMAIL_PASS in the .env file. If using Gmail, ensure you are using a 16-character App Password.';
    // Check for connection/network errors.
    } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
        friendlyMessage = 'Connection to email server failed. Please check your network connection and EMAIL_HOST/EMAIL_PORT settings.';
    }
    
    // Throw a NEW error with the guaranteed friendly message.
    // This ensures the calling function always gets a standard error with a clear message.
    throw new Error(friendlyMessage);
  }
};

module.exports = sendEmail;
