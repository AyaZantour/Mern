// const nodemailer = require('nodemailer');

// // // Create transporter
// // const createTransporter = () => {
// //   return nodemailer.createTransport({
// //     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
// //     port: process.env.EMAIL_PORT || 587,
// //     secure: process.env.EMAIL_SECURE === 'true',
// //     auth: {
// //       user: process.env.EMAIL_USER,
// //       pass: process.env.EMAIL_PASSWORD
// //     }
// //   });
// // };

// const createTransporter = () => {
//   return nodemailer.createTransport({
//     service: 'gmail',  // Use service instead of host/port
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD  // Make sure this matches .env
//     },
//     tls: {
//       rejectUnauthorized: false  // Sometimes needed for development
//     }
//   });
// };

// // Send test invitation email
// const sendTestEmail = async (to, candidateName, testLink) => {
//   console.log(' Attempting to send email to:', to);
  
//   // Skip email sending if no credentials configured (for testing)
//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
//     console.log(' Email credentials not configured, skipping email send');
//     console.log('Test link would be:', testLink);
//     return true; // Return true to not break the flow
//   }

//   try {
//     const transporter = createTransporter();
    
//     const mailOptions = {
//       from: `"Tech Recruiter" <${process.env.EMAIL_USER}>`,
//       to: to,
//       subject: 'Invitation à un test technique',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2563eb;">Bonjour ${candidateName},</h2>
//           <p>Vous avez été invité(e) à passer un test technique.</p>
//           <p>Cliquez sur le lien ci-dessous pour accéder au test :</p>
//           <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
//             <a href="${testLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">
//               ${testLink}
//             </a>
//           </div>
//           <p><strong>Important :</strong></p>
//           <ul>
//             <li>Ce lien est unique et personnel</li>
//             <li>Ne partagez pas ce lien avec d'autres personnes</li>
//             <li>Le test a une durée limitée</li>
//             <li>Assurez-vous d'avoir une connexion Internet stable</li>
//           </ul>
//           <p>Bonne chance !</p>
//           <p>L'équipe de recrutement</p>
//         </div>
//       `
//     };

//     console.log(' Sending email...');
//     const info = await transporter.sendMail(mailOptions);
//     console.log(' Email sent:', info.messageId);
//     return true;
    
//   } catch (error) {
//     console.error('❌ Error sending email:', error);
//     // Return false but don't crash the whole process
//     return false;
//   }
// };

// // Send test results email
// const sendResultsEmail = async (to, candidateName, score, totalQuestions, percentage) => {
//   // Similar implementation for results email
//   console.log(' Results email would be sent to:', to);
//   return true; // For testing
// };

// module.exports = {
//   sendTestEmail,
//   sendResultsEmail
// };




const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Existing sendTestEmail function...
const sendTestEmail = async (to, candidateName, testLink) => {
  console.log('📧 Attempting to send email to:', to);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️ Email credentials not configured, skipping email send');
    console.log('Test link would be:', testLink);
    return true;
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

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// ✅ NEW: Send results email to candidate
const sendResultsEmail = async (to, candidateName, testTitle, score, totalQuestions, percentage, passed) => {
  console.log('📧 Sending results email to:', to);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️ Email credentials not configured, skipping email send');
    return false;
  }

  try {
    const transporter = createTransporter();
    
    // Determine pass/fail (you can adjust threshold)
    const passThreshold = 60; // 60% to pass
    const didPass = percentage >= passThreshold;
    
    // Choose colors and messages based on result
    const resultColor = didPass ? '#10b981' : '#ef4444';
    const resultEmoji = didPass ? '🎉' : '📚';
    const resultTitle = didPass ? 'Félicitations !' : 'Résultats de votre test';
    const resultMessage = didPass 
      ? 'Vous avez réussi le test technique !' 
      : 'Merci d\'avoir passé le test technique.';
    
    const mailOptions = {
      from: `"Tech Recruiter" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: didPass 
        ? `✅ Félicitations - Résultats de votre test: ${testTitle}`
        : `📊 Résultats de votre test: ${testTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: ${resultColor}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <div style="font-size: 48px; margin-bottom: 10px;">${resultEmoji}</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${resultTitle}</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px; background-color: #f9fafb;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Bonjour <strong>${candidateName}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
              ${resultMessage}
            </p>
            
            <!-- Score Card -->
            <div style="background-color: #ffffff; border: 2px solid ${resultColor}; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #111827; margin: 0 0 10px 0; font-size: 18px;">Votre Score</h2>
              <div style="font-size: 48px; font-weight: bold; color: ${resultColor}; margin: 20px 0;">
                ${percentage}%
              </div>
              <p style="color: #6b7280; font-size: 16px; margin: 0;">
                ${score} sur ${totalQuestions} questions correctes
              </p>
            </div>
            
            <!-- Test Details -->
            <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 16px;">Détails du test</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Test :</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 500; text-align: right; font-size: 14px;">${testTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Questions totales :</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 500; text-align: right; font-size: 14px;">${totalQuestions}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Réponses correctes :</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 500; text-align: right; font-size: 14px;">${score}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Taux de réussite :</td>
                  <td style="padding: 8px 0; font-weight: 500; text-align: right; font-size: 14px; color: ${resultColor};">${percentage}%</td>
                </tr>
              </table>
            </div>
            
            <!-- Next Steps -->
            ${didPass ? `
              <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <p style="color: #065f46; margin: 0; font-size: 14px;">
                  <strong>Prochaines étapes :</strong><br>
                  Notre équipe de recrutement examinera vos résultats et vous contactera prochainement pour discuter des opportunités disponibles.
                </p>
              </div>
            ` : `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>Suggestions :</strong><br>
                  Nous vous encourageons à continuer à développer vos compétences. N'hésitez pas à postuler à nouveau lorsque vous vous sentirez prêt(e).
                </p>
              </div>
            `}
            
            <!-- Footer Message -->
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Merci d'avoir pris le temps de passer ce test. Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Cordialement,<br>
              <strong>L'équipe de recrutement</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #e5e7eb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </p>
          </div>
        </div>
      `
    };

    console.log('📤 Sending results email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Results email sent:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('❌ Error sending results email:', error);
    return false;
  }
};

module.exports = {
  sendTestEmail,
  sendResultsEmail
};