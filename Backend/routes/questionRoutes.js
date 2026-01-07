const express = require('express');
const router = express.Router();
const {
  generateQuestions,
  refreshQuestion,
  getQuestions,
  createQuestion 
} = require('../controllers/questionController');

router.post('/create', createQuestion);


//   POST /api/questions/generate
router.post('/generate', generateQuestions);

//   POST /api/questions/refresh
router.post('/refresh', refreshQuestion);

//  GET /api/questions
router.get('/', getQuestions);

module.exports = router;