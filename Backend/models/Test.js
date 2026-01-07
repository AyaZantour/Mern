// // models/Test.js
// const mongoose = require('mongoose');

// const testSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, default: '' },
//   jobTitle: { type: String, default: '' },
//   category: { type: String, default: '' },
//   // store ObjectId refs to questions
//   questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
//   duration: { type: Number, default: 1 }, // default so backend won't throw if missing
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Test', testSchema);


// models/Test.js
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  category: { type: String, default: '' },
  questions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question' 
  }],
  duration: { 
    type: Number, 
    required: true,
    default: 60 // Default 60 minutes if not specified
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Test', testSchema);