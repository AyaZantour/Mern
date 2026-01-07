const express = require('express');
const router = express.Router();
const {
  createCandidateTest,
  getCandidateTestByLink,
  submitCandidateTest,
  getCandidateTests,
  evaluateCandidateTest
} = require('../controllers/candidateTestController');
// i have to wait to build tests to be able to use these
router.route('/')
  .post(createCandidateTest)
  .get(getCandidateTests);

router.route('/link/:uniqueLink')
  .get(getCandidateTestByLink);

router.route('/:id/submit')
  .put(submitCandidateTest);

  router.route('/:id/evaluate')
  .put(evaluateCandidateTest);

module.exports = router;