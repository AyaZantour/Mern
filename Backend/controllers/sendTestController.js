const CandidateTest = require('../models/CandidateTest');
const Test = require('../models/Test');
const { sendTestEmail } = require('../utils/emailUtils');

const sendTestToCandidate = async (req, res) => {
  console.log('📨 Send test request received');
  
  try {
    const { testId, candidateName, candidateEmail, expiresInHours = 24 } = req.body;

    // Basic validation
    if (!testId || !candidateName || !candidateEmail) {
      return res.status(400).json({
        success: false,
        error: 'testId, candidateName, and candidateEmail are required'
      });
    }

    //   FIXED: Populate questions to get full question objects
    const test = await Test.findById(testId).populate('questions');
    
    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Check if test has questions
    if (!test.questions || test.questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Test has no questions. Please add questions to the test first.'
      });
    }

    console.log('📝 Test found:', test.title);
    console.log('📊 Questions count:', test.questions.length);

    // Generate unique link
    const crypto = require('crypto');
    const uniqueLink = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    
    // test.questions is already an array of populated Question objects
    const candidateTest = await CandidateTest.create({
      test: testId,
      candidateName,
      candidateEmail,
      questions: test.questions.map(question => ({
        question: question._id  // Just use the _id directly
      })),
      totalQuestions: test.questions.length,
      expiresAt,
      uniqueLink,
      status: 'sent',
      score: 0
    });

    console.log('  Candidate test created:', candidateTest._id);

    // Create test link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5127';
    const testLink = `${frontendUrl}/test/${uniqueLink}`;

    // Send Email to Candidate
    console.log('  Attempting to send email to candidate...');
    let emailSent = false;
    
    try {
      emailSent = await sendTestEmail(candidateEmail, candidateName, testLink);
      if (emailSent) {
        console.log('  Email sent successfully');
      } else {
        console.log('  Email sending failed, but test was created');
      }
    } catch (emailError) {
      console.error('  Email error:', emailError.message);
      // Continue anyway - email is not critical
    }

    // Return success
    res.json({
      success: true,
      data: {
        candidateTest,
        testLink,
        emailSent: emailSent,
        emailMessage: emailSent ? 
          'Test envoyé par email avec succès' : 
          'Test créé mais email non envoyé - copiez le lien manuellement'
      },
      message: 'Test créé avec succès'
    });

  } catch (error) {
    console.error('  Error in sendTestToCandidate:', error);
    
    // Detailed error response
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  sendTestToCandidate
};