const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const upload = require('../middleware/upload.middleware');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { validateBody, validateQuery, validateParams, schemas } = require('../validators');

// GET /api/reports/my - get authenticated user's own reports (must be before /:id)
router.get('/my', authenticate, reportController.getMyReports);

// GET /api/reports/pending - for moderation queue
router.get('/pending', reportController.getPendingReports);

// GET /api/reports (with optional ?bbox=minLon,minLat,maxLon,maxLat&page=1&limit=20)
router.get('/', validateQuery(schemas.getReportsQuery), reportController.getReports);

// GET /api/reports/:id
router.get('/:id', validateParams(schemas.idParam), reportController.getReportById);

// POST /api/reports - with file upload, validation, and optional auth to link reports to users
router.post('/', optionalAuth, upload.single('image'), validateBody(schemas.createReportBody), reportController.createReport);

// POST /api/reports/:id/verify
router.post('/:id/verify', validateParams(schemas.idParam), validateBody(schemas.verifyReportBody), reportController.verifyReport);

module.exports = router;
