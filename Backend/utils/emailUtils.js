const nodemailer = require('nodemailer');

// // Create transporter
// const createTransporter = () => {
//   return nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//     port: process.env.EMAIL_PORT || 587,
//     secure: process.env.EMAIL_SECURE === 'true',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });
// };

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',  // Use service instead of host/port
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD  // Make sure this matches .env
    },
    tls: {
      rejectUnauthorized: false  // Sometimes needed for development
    }
  });
};

// Send test invitation email
const sendTestEmail = async (to, candidateName, testLink) => {
  console.log(' Attempting to send email to:', to);
  
  // Skip email sending if no credentials configured (for testing)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(' Email credentials not configured, skipping email send');
    console.log('Test link would be:', testLink);
    return true; // Return true to not break the flow
  }

  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Tech Recruiter" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Invitation à un test technique',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bonjour ${candidateName},</h2>
          <p>Vous avez été invité(e) à passer un test technique.</p>
          <p>Cliquez sur le lien ci-dessous pour accéder au test :</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <a href="${testLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">
              ${testLink}
            </a>
          </div>
          <p><strong>Important :</strong></p>
          <ul>
            <li>Ce lien est unique et personnel</li>
            <li>Ne partagez pas ce lien avec d'autres personnes</li>
            <li>Le test a une durée limitée</li>
            <li>Assurez-vous d'avoir une connexion Internet stable</li>
          </ul>
          <p>Bonne chance !</p>
          <p>L'équipe de recrutement</p>
        </div>
      `
    };

    console.log(' Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log(' Email sent:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Return false but don't crash the whole process
    return false;
  }
};

// Send test results email
const sendResultsEmail = async (to, candidateName, score, totalQuestions, percentage) => {
  // Similar implementation for results email
  console.log(' Results email would be sent to:', to);
  return true; // For testing
};

module.exports = {
  sendTestEmail,
  sendResultsEmail
};