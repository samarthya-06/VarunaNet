const express = require('express');
const router = express.Router();
const hotspotController = require('../controllers/hotspot.controller');
const { validateQuery, schemas } = require('../validators');

// GET /api/hotspots?since=ISO_DATE
router.get('/', validateQuery(schemas.sinceQuery), hotspotController.getHotspots);

module.exports = router;
