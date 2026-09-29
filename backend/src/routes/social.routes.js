const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');

router.get('/', socialController.getFeed);

module.exports = router;
