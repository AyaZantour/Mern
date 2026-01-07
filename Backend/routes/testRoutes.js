const express = require('express');
const router = express.Router();
const {
  createTest,
  getTests,
  getTest,
  updateTest,
  deleteTest
} = require('../controllers/testController');

router.route('/')
  .post(createTest)
  .get(getTests);

router.route('/:id')
  .get(getTest)
  .put(updateTest)
  .delete(deleteTest);

  // In testRoutes.js, add:
router.get('/list', async (req, res) => {
  try {
    const tests = await Test.find({}, '_id title').limit(5);
    res.json({
      success: true,
      tests: tests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;