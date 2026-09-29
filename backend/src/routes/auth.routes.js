const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateBody, schemas } = require('../validators');
const { generateToken } = require('../config/passport');

// Public routes - with validation
router.post('/register', validateBody(schemas.registerBody), authController.register);
router.post('/login', validateBody(schemas.loginBody), authController.login);

// ═══════════════════════════════════════════════════════════════
// GOOGLE OAUTH ROUTES
// ═══════════════════════════════════════════════════════════════

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?error=oauth_failed`
    }),
    (req, res) => {
        // Generate JWT token for the authenticated user
        const token = generateToken(req.user);

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
);

// ═══════════════════════════════════════════════════════════════
// PROTECTED ROUTES
// ═══════════════════════════════════════════════════════════════

router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validateBody(schemas.updateProfileBody), authController.updateProfile);

module.exports = router;
