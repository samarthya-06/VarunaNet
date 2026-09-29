/**
 * Passport.js configuration for Google OAuth
 */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Only configure if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('🔐 Google OAuth: Configuring strategy...');
    console.log('   Client ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
    console.log('   Callback URL:', process.env.GOOGLE_CALLBACK_URL);

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
        scope: ['profile', 'email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('🔐 Google OAuth: Callback received');
                console.log('   Profile ID:', profile.id);
                console.log('   Profile Email:', profile.emails?.[0]?.value);
                console.log('   Profile Name:', profile.displayName);

                // Check if user exists with this Google ID
                let user = await User.findOne({ where: { googleId: profile.id } });
                console.log('   Existing user by googleId:', !!user);

                if (!user) {
                    // Check if user exists with same email
                    user = await User.findOne({ where: { email: profile.emails[0].value } });
                    console.log('   Existing user by email:', !!user);

                    if (user) {
                        // Link Google account to existing user
                        console.log('   Linking Google account to existing user...');
                        user.googleId = profile.id;
                        await user.save();
                        console.log('   ✅ Google account linked successfully');
                    } else {
                        // Create new user
                        console.log('   Creating new user...');
                        user = await User.create({
                            email: profile.emails[0].value,
                            name: profile.displayName,
                            googleId: profile.id,
                            password: null // No password for OAuth users
                        });
                        console.log('   ✅ New user created with ID:', user.id);
                    }
                } else {
                    console.log('   ✅ User found by googleId, ID:', user.id);
                }

                return done(null, user);
            } catch (error) {
                console.error('❌ Google OAuth Error:', error.message);
                console.error('   Stack:', error.stack);
                return done(error, null);
            }
        }));

    console.log('✅ Google OAuth: Strategy configured successfully');
} else {
    console.warn('⚠️  Google OAuth not configured: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Generate JWT token for user
const generateToken = (user) => {
    console.log('🎫 Generating JWT for user:', user.id, user.email);
    const token = jwt.sign(
        { id: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );
    console.log('   Token generated, length:', token.length);
    return token;
};

module.exports = { passport, generateToken };
