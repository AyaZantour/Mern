// controllers/testController.js
const Test = require('../models/Test');
const mongoose = require('mongoose');

const createTest = async (req, res) => {
  try {
    const { title, description = '', jobTitle = '', category = '', questions = [], duration } = req.body;

    // Validate questions array: convert string IDs to ObjectId where possible
    const qIds = questions.map(q => {
      // If q is an object with _id, take it
      if (typeof q === 'object' && q !== null && q._id) return q._id;
      // else assume string id
      return String(q);
    });

    // Basic validation: ensure elements look like strings (ObjectId string)
    // We do not try to create missing questions here - frontend should call /questions to create them.
    const test = await Test.create({
      title,
      description,
      jobTitle,
      category,
      questions: qIds,
      duration: typeof duration === 'number' ? duration : parseFloat(duration) || 1
    });

    return res.status(201).json({ success: true, data: test });
  } catch (err) {
    console.error('Error in createTest:', err);
    // return error details in development-friendly way
    return res.status(500).json({ success: false, error: 'Erreur lors de la création du test.', details: err.message });
  }
};

const updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('questions');
    if (!test) return res.status(404).json({ success: false, error: 'Test non trouvé' });
    return res.json({ success: true, data: test });
  } catch (err) {
    console.error('Error in updateTest:', err);
    return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du test.', details: err.message });
  }
};

const getTests = async (req, res) => {
  try {
    const tests = await Test.find().populate('questions');
    return res.json({ success: true, count: tests.length, data: tests });
  } catch (err) {
    console.error('Error in getTests:', err);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des tests.' });
  }
};

const getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('questions');
    if (!test) return res.status(404).json({ success: false, error: 'Test non trouvé' });
    return res.json({ success: true, data: test });
  } catch (err) {
    console.error('Error in getTest:', err);
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération du test.' });
  }
};

const deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ success: false, error: 'Test non trouvé' });
    return res.json({ success: true, data: {} });
  } catch (err) {
    console.error('Error in deleteTest:', err);
    return res.status(500).json({ success: false, error: 'Erreur lors de la suppression du test.' });
  }
};

module.exports = {
  createTest,
  updateTest,
  getTests,
  getTest,
  deleteTest
};
