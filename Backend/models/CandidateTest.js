const mongoose = require('mongoose');

const candidateTestSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true
  },
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answer: {
      type: String,
      default: ''
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['sent', 'in-progress', 'completed', 'expired', 'evaluated'],
    default: 'sent'
  },
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true
  },
  uniqueLink: {
    type: String,
    unique: true
  },
evaluatedByHuman: {
    type: Boolean,
    default: false
  },
  evaluatedBy: {
    type: String // Could be recruiter name or ID
  },
  evaluationDate: {
    type: Date
  },
  evaluatorComment: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CandidateTest', candidateTestSchema);