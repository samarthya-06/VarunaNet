const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');
const logger = require('../config/logger');

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = config.jwtExpiresIn;

/**
 * Register a new user
 */
exports.register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Create user (password hashed via hooks)
        const user = await User.create({
            email,
            password,
            name: name || email.split('@')[0],
            role: role || 'citizen'
        });

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: user.toJSON(),
                token
            }
        });

    } catch (error) {
        logger.error({ err: error }, 'Registration error');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }

        // Check for hardcoded admin credentials first
        if (config.adminPassword && email === config.adminEmail && password === config.adminPassword) {
            const token = jwt.sign(
                { id: 0, email: config.adminEmail, role: 'admin' },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return res.status(200).json({
                status: 'success',
                message: 'Admin login successful',
                data: {
                    user: {
                        id: 0,
                        email: config.adminEmail,
                        name: 'Administrator',
                        role: 'admin'
                    },
                    token
                }
            });
        }

        // Find regular user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }


        // Check password
        const isValid = await user.validPassword(password);
        if (!isValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                token
            }
        });

    } catch (error) {
        logger.error({ err: error }, 'Login error');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
    try {
        // Handle admin user (id=0) - return hardcoded admin profile
        if (req.user.id === 0) {
            return res.status(200).json({
                status: 'success',
                data: {
                    id: 0,
                    email: config.adminEmail,
                    name: 'Administrator',
                    role: 'admin'
                }
            });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: user.toJSON()
        });
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id }, 'Profile error');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar_url } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        if (name) user.name = name;
        if (avatar_url) user.avatar_url = avatar_url;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Profile updated',
            data: user.toJSON()
        });
    } catch (error) {
        logger.error({ err: error, userId: req.user?.id }, 'Update profile error');
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};
