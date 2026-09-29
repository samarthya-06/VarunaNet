const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { validateQuery, schemas } = require('../validators');

// GET /api/analytics/keywords?since=ISO_DATE
router.get('/keywords', validateQuery(schemas.sinceQuery), analyticsController.getKeywordTrends);

module.exports = router;
