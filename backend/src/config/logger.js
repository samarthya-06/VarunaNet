/**
 * Pino logger configuration
 * Provides structured logging with context
 */
const pino = require('pino');
const config = require('./index');

const logger = pino({
    level: config.logLevel,
    transport: config.nodeEnv === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname'
        }
    } : undefined,
    base: {
        env: config.nodeEnv
    }
});

module.exports = logger;
