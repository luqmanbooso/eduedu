const express = require('express');
const router = express.Router();
const scoreEssay = require('../utils/scoreEssay');

router.post('/submit', async (req, res) => {
  const { essayText } = req.body;
  const score = await scoreEssay(essayText);
  res.json({ score });
});

module.exports = router;