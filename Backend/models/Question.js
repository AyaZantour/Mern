// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, required: true, enum: ['qcm_radio','qcm_checkbox','code','libre'] },
  difficulty: { type: String, required: true, enum: ['facile','moyenne','difficile'] },
  jobTitle: { type: String, required: true },
  category: { type: String, required: true },
  options: { type: [String], default: [] },
  correctOptions: { type: [String], default: [] },
  starterCode: { type: String, default: '' },
  language: { type: String, default: '' },
  time: { type: Number, required: true, default: 1 }, // default to 1 minute if missing
  addedBy: { type: String, default: 'AI' },
  validated: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);
