/**
 * Centralized configuration with environment validation
 * Fails fast if required variables are missing
 */
require('dotenv').config();

const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please check your .env file or environment configuration.');
    process.exit(1);
}

module.exports = {
    port: parseInt(process.env.PORT, 10) || 3000,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // CORS configuration
    corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
        : ['http://localhost:5173', 'http://localhost:3000'],

    // Rate limiting (higher limits for development)
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 500,
        authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 50
    },

    // Sentry (optional)
    sentryDsn: process.env.SENTRY_DSN || null,

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    nodeEnv: process.env.NODE_ENV || 'development',

    // Optional admin credentials; login is disabled unless configured
    adminEmail: process.env.ADMIN_EMAIL || 'admin@varunanet.local',
    adminPassword: process.env.ADMIN_PASSWORD
};
