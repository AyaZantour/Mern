// const CandidateTest = require('../models/CandidateTest');
// const Test = require('../models/Test');
// const crypto = require('crypto');

// // @desc    Create candidate test
// // @route   POST /api/candidate-tests
// // @access  Public
// const createCandidateTest = async (req, res) => {
//   try {
//     const { testId, candidateName, candidateEmail, expiresInHours = 24 } = req.body;

//     const test = await Test.findById(testId).populate('questions');
//     if (!test) {
//       return res.status(404).json({
//         success: false,
//         error: 'Test non trouvé'
//       });
//     }

//     const uniqueLink = crypto.randomBytes(16).toString('hex');
//     const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

//     const candidateTest = await CandidateTest.create({
//       test: testId,
//       candidateName,
//       candidateEmail,
//       questions: test.questions.map(q => ({
//         question: q._id
//       })),
//       totalQuestions: test.questions.length,
//       expiresAt,
//       uniqueLink
//     });

//     res.status(201).json({
//       success: true,
//       data: candidateTest
//     });
//   } catch (error) {
//     console.error('  Error in createCandidateTest:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Erreur lors de la création du test candidat.'
//     });
//   }
// };

// // @desc    Get candidate test by unique link
// // @route   GET /api/candidate-tests/link/:uniqueLink
// // @access  Public
// const getCandidateTestByLink = async (req, res) => {
//   try {
//     const candidateTest = await CandidateTest.findOne({
//       uniqueLink: req.params.uniqueLink
//     }).populate('questions.question');

//     if (!candidateTest) {
//       return res.status(404).json({
//         success: false,
//         error: 'Test candidat non trouvé'
//       });
//     }

//     // Check if test has expired
//     if (new Date() > candidateTest.expiresAt) {
//       candidateTest.status = 'expired';
//       await candidateTest.save();
//     }

//     res.json({
//       success: true,
//       data: candidateTest
//     });
//   } catch (error) {
//     console.error('  Error in getCandidateTestByLink:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Erreur lors de la récupération du test candidat.'
//     });
//   }
// };

// // @desc    Submit candidate test answers
// // @route   PUT /api/candidate-tests/:id/submit
// // @access  Public
// const submitCandidateTest = async (req, res) => {
//   try {
//     const { answers } = req.body;
//     const candidateTest = await CandidateTest.findById(req.params.id).populate('questions.question');

//     if (!candidateTest) {
//       return res.status(404).json({
//         success: false,
//         error: 'Test candidat non trouvé'
//       });
//     }

//     if (candidateTest.status === 'completed') {
//       return res.status(400).json({
//         success: false,
//         error: 'Test déjà complété'
//       });
//     }

//     // Calculate score
//     let score = 0;
//     candidateTest.questions.forEach((item, index) => {
//       const userAnswer = answers[index];
//       const correctOptions = item.question.correctOptions;
      
//       if (userAnswer && correctOptions.includes(userAnswer)) {
//         item.isCorrect = true;
//         score++;
//       }
//       item.answer = userAnswer || '';
//     });

//     candidateTest.score = score;
//     candidateTest.status = 'completed';
//     candidateTest.completedAt = new Date();

//     await candidateTest.save();

//     res.json({
//       success: true,
//       data: candidateTest
//     });
//   } catch (error) {
//     console.error('  Error in submitCandidateTest:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Erreur lors de la soumission du test.'
//     });
//   }
// };

// // @desc    Get all candidate tests
// // @route   GET /api/candidate-tests
// // @access  Public
// const getCandidateTests = async (req, res) => {
//   try {
//     const candidateTests = await CandidateTest.find().populate('test');
//     res.json({
//       success: true,
//       count: candidateTests.length,
//       data: candidateTests
//     });
//   } catch (error) {
//     console.error('  Error in getCandidateTests:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Erreur lors de la récupération des tests candidats.'
//     });
//   }
// };

// module.exports = {
//   createCandidateTest,
//   getCandidateTestByLink,
//   submitCandidateTest,
//   getCandidateTests
// };



const { sendResultsEmail } = require('../utils/emailUtils');


const CandidateTest = require('../models/CandidateTest');
const Test = require('../models/Test');

const createCandidateTest = async (req, res) => {
  try {
    const { testId, candidateName, candidateEmail } = req.body;

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    const crypto = require('crypto');
    const uniqueLink = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const candidateTest = await CandidateTest.create({
      test: testId,
      candidateName,
      candidateEmail,
      questions: test.questions.map(q => ({
        question: q._id
      })),
      totalQuestions: test.questions.length,
      expiresAt,
      uniqueLink,
      status: 'sent',
      score: 0
    });

    res.status(201).json({
      success: true,
      data: candidateTest
    });
  } catch (error) {
    console.error('Error creating candidate test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};






// //   1. Create Candidate Test (already done in sendTestController)
// const createCandidateTest = async (req, res) => {
//   try {
//     const { testId, candidateName, candidateEmail } = req.body;
    
//     // This is similar to sendTestToCandidate but without email sending
//     const test = await Test.findById(testId);
//     if (!test) {
//       return res.status(404).json({
//         success: false,
//         error: 'Test not found'
//       });
//     }

//     const crypto = require('crypto');
//     const uniqueLink = crypto.randomBytes(16).toString('hex');
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

//     const candidateTest = await CandidateTest.create({
//       test: testId,
//       candidateName,
//       candidateEmail,
//       totalQuestions: test.questions?.length || 0,
//       expiresAt,
//       uniqueLink,
//       status: 'sent',
//       score: 0
//     });

//     res.status(201).json({
//       success: true,
//       data: candidateTest
//     });
//   } catch (error) {
//     console.error('Error creating candidate test:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

//   2. Get Candidate Test by Unique Link (FOR CANDIDATE TO TAKE TEST)
// const getCandidateTestByLink = async (req, res) => {
//   try {
//     const { uniqueLink } = req.params;
    
//     const candidateTest = await CandidateTest.findOne({ uniqueLink })
//       .populate('test')
//       // .populate('questions.question');
//       .populate({
//         path: 'questions.question',
//         model: 'Question'
//       });
    
//     if (!candidateTest) {
//       return res.status(404).json({
//         success: false,
//         error: 'Test non trouvé'
//       });
//     }

//     // Check if expired
//     if (new Date() > new Date(candidateTest.expiresAt)) {
//       await CandidateTest.findByIdAndUpdate(candidateTest._id, { status: 'expired' });
//       return res.status(410).json({
//         success: false,
//         error: 'Ce test a expiré'
//       });
//     }

//     // Check if already completed
//     if (candidateTest.status === 'completed') {
//       return res.status(403).json({
//         success: false,
//         error: 'Ce test a déjà été complété'
//       });
//     }

//     // Update status to in-progress if first access
//     if (candidateTest.status === 'sent') {
//       candidateTest.status = 'in-progress';
//       candidateTest.startedAt = new Date();
//       await candidateTest.save();
//     }

//     res.json({
//       success: true,
//       data: candidateTest
//     });
//   } catch (error) {
//     console.error('Error fetching candidate test:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };


// ========================================
// BACKEND FIX: candidateTestController.js
// getCandidateTestByLink function
// ========================================

const getCandidateTestByLink = async (req, res) => {
  try {
    const { uniqueLink } = req.params;
    
    console.log('  Looking for test with link:', uniqueLink);
    
    //   CRITICAL: Populate questions with full question data
    const candidateTest = await CandidateTest.findOne({ uniqueLink })
      .populate('test')
      .populate({
        path: 'questions.question',
        model: 'Question'
      });
    
    if (!candidateTest) {
      return res.status(404).json({
        success: false,
        error: 'Test non trouvé'
      });
    }

    console.log('  Test found:', candidateTest._id);
    console.log('  Questions:', candidateTest.questions.length);
    
    //   DEBUG: Check if questions have options
    if (candidateTest.questions.length > 0) {
      const firstQuestion = candidateTest.questions[0].question;
      console.log('  First question check:', {
        type: firstQuestion.type,
        hasOptions: !!firstQuestion.options,
        optionsCount: firstQuestion.options?.length,
        text: firstQuestion.text.substring(0, 50)
      });
    }

    // Check if expired
    if (new Date() > new Date(candidateTest.expiresAt)) {
      await CandidateTest.findByIdAndUpdate(candidateTest._id, { status: 'expired' });
      return res.status(410).json({
        success: false,
        error: 'Ce test a expiré'
      });
    }

    // Check if already completed
    if (candidateTest.status === 'completed') {
      return res.status(403).json({
        success: false,
        error: 'Ce test a déjà été complété'
      });
    }

    // Update status to in-progress if first access
    if (candidateTest.status === 'sent') {
      candidateTest.status = 'in-progress';
      candidateTest.startedAt = new Date();
      await candidateTest.save();
      console.log('  Test started');
    }

    res.json({
      success: true,
      data: candidateTest
    });
  } catch (error) {
    console.error('  Error fetching candidate test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


//   FIXED: Proper answer handling for all question types
const submitCandidateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    console.log('  Submitting test:', id);
    console.log('  Answers received:', answers);

    const candidateTest = await CandidateTest.findById(id)
      .populate({
        path: 'questions.question',
        model: 'Question'
      })
      .populate('test');

    if (!candidateTest) {
      return res.status(404).json({
        success: false,
        error: 'Test non trouvé'
      });
    }

    if (candidateTest.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Ce test a déjà été soumis'
      });
    }

    let score = 0;
    
    candidateTest.questions.forEach((item, index) => {
      const question = item.question;
      const questionId = question._id.toString();
      
      //   FIXED: Handle both index-based and ID-based answers
      const userAnswer = answers[questionId] || answers[index] || null;
      
      // Store the answer
      item.answer = JSON.stringify(userAnswer); // Store as string for consistency
      
      // Auto-grade QCM questions
      if (question.type === 'qcm_radio') {
        const isCorrect = userAnswer !== null && 
                         Array.isArray(question.correctOptions) && 
                         userAnswer === question.correctOptions[0];
        item.isCorrect = isCorrect;
        if (isCorrect) score++;
      } 
      else if (question.type === 'qcm_checkbox') {
        if (Array.isArray(userAnswer) && Array.isArray(question.correctOptions)) {
          const sortedUser = [...userAnswer].sort();
          const sortedCorrect = [...question.correctOptions].sort();
          const isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
          item.isCorrect = isCorrect;
          if (isCorrect) score++;
        } else {
          item.isCorrect = false;
        }
      }
      // For libre/code questions, leave for manual evaluation
      else if (question.type === 'libre' || question.type === 'code') {
        item.isCorrect = null;
      }
    });

    candidateTest.score = score;
    candidateTest.status = 'completed';
    candidateTest.completedAt = new Date();

    await candidateTest.save();

    const updatedTest = await CandidateTest.findById(id)
      .populate('questions.question')
      .populate('test');

    console.log('  Test submitted successfully');
    console.log(`  Score: ${score}/${candidateTest.totalQuestions}`);

    res.json({
      success: true,
      data: {
        score,
        totalQuestions: candidateTest.totalQuestions,
        percentage: Math.round((score / candidateTest.totalQuestions) * 100),
        candidateTest: updatedTest
      }
    });

  } catch (error) {
    console.error('  Error submitting test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



//   4. Get All Candidate Tests (for admin)
//   4. Get All Candidate Tests (for admin)
const getCandidateTests = async (req, res) => {
  try {
    const candidateTests = await CandidateTest.find()
      .populate('test')
      .populate({
        path: 'questions.question',
        model: 'Question'
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: candidateTests
    });
  } catch (error) {
    console.error('Error fetching candidate tests:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



//version 3 at 15:51: 


const evaluateCandidateTest = async (req, res) => {
  try {
    console.log('  Evaluation request received for:', req.params.id);
    
    const { id } = req.params;
    const { questions, score, evaluatedBy, evaluationDate } = req.body;

    const candidateTest = await CandidateTest.findById(id);
    
    if (!candidateTest) {
      return res.status(404).json({
        success: false,
        error: 'Test candidat non trouvé'
      });
    }

    // Handle questions safely
    const updatedQuestions = questions.map(q => {
      const baseQuestion = {
        question: q.question,
        answer: q.answer || '',
        isCorrect: q.isCorrect || false
      };
      
      // Add evaluation fields if they exist
      if (q.evaluatedByHuman !== undefined) {
        baseQuestion.evaluatedByHuman = q.evaluatedByHuman;
      }
      if (q.evaluatorComment !== undefined) {
        baseQuestion.evaluatorComment = q.evaluatorComment || '';
      }
      
      return baseQuestion;
    });

    // Update document
    const updateData = {
      questions: updatedQuestions,
      score: score || 0,
      evaluatedByHuman: true,
      evaluatedBy: evaluatedBy || 'recruiter',
      evaluationDate: evaluationDate || new Date(),
      status: 'evaluated'
    };

    // Use findByIdAndUpdate instead of save() for better compatibility
    const updatedTest = await CandidateTest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('  Evaluation saved successfully');
    
    res.json({
      success: true,
      data: updatedTest
    });
  } catch (error) {
    console.error('  Error evaluating test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// ✅ NEW: Send results email to candidate
const sendResultsEmailToCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📧 Sending results email for test:', id);
    
    const candidateTest = await CandidateTest.findById(id)
      .populate('test')
      .populate({
        path: 'questions.question',
        model: 'Question'
      });
    
    if (!candidateTest) {
      return res.status(404).json({
        success: false,
        error: 'Test non trouvé'
      });
    }

    if (candidateTest.status !== 'completed' && candidateTest.status !== 'evaluated') {
      return res.status(400).json({
        success: false,
        error: 'Le test n\'est pas encore complété'
      });
    }

    const percentage = candidateTest.totalQuestions > 0 
      ? Math.round((candidateTest.score / candidateTest.totalQuestions) * 100)
      : 0;

    const emailSent = await sendResultsEmail(
      candidateTest.candidateEmail,
      candidateTest.candidateName,
      candidateTest.test?.title || 'Test Technique',
      candidateTest.score,
      candidateTest.totalQuestions,
      percentage,
      percentage >= 60
    );

    if (emailSent) {
      console.log('✅ Results email sent successfully');
      res.json({
        success: true,
        message: 'Email de résultats envoyé avec succès'
      });
    } else {
      console.log('⚠️ Failed to send results email');
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email'
      });
    }

  } catch (error) {
    console.error('❌ Error sending results email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createCandidateTest,
  getCandidateTestByLink,
  submitCandidateTest,
  getCandidateTests,
  evaluateCandidateTest,
  sendResultsEmailToCandidate
};