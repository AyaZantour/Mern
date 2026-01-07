const express = require('express');
const router = express.Router();
const { sendTestToCandidate } = require('../controllers/sendTestController');

// GET test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Send test endpoint is working!',
    timestamp: new Date().toISOString()
  });
});



// POST main endpoint
router.post('/', sendTestToCandidate);

module.exports = router;