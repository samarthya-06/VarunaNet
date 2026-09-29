/**
 * Zod validation schemas and middleware
 * Input validation for all public routes
 */
const { z, ZodError } = require('zod');

// ============ Auth Schemas ============
const registerBodySchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1).max(100).optional(),
    role: z.enum(['citizen', 'analyst', 'admin']).optional()
});

const loginBodySchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

const updateProfileBodySchema = z.object({
    name: z.string().min(1).max(100).optional(),
    avatar_url: z.string().url().optional()
});

// ============ Report Schemas ============
const createReportBodySchema = z.object({
    type: z.string().min(1, 'Hazard type is required'),
    description: z.string().max(1000).optional(),
    lat: z.union([z.number(), z.string()]).transform(v => parseFloat(String(v))).refine(v => !isNaN(v) && v >= -90 && v <= 90, 'Invalid latitude'),
    lon: z.union([z.number(), z.string()]).transform(v => parseFloat(String(v))).refine(v => !isNaN(v) && v >= -180 && v <= 180, 'Invalid longitude'),
    user_id: z.number().int().positive().optional()
});

const getReportsQuerySchema = z.object({
    bbox: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$/, 'Invalid bbox format').optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
}).passthrough();

const verifyReportBodySchema = z.object({
    status: z.enum(['verified', 'dismissed'])
});

const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
});

// ============ Query Param Schemas ============
const sinceQuerySchema = z.object({
    since: z.string().datetime().optional()
}).passthrough();

// ============ Helper function to format Zod errors ============
const formatZodError = (error) => {
    if (error instanceof ZodError) {
        return error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
        }));
    }
    return [{ field: 'unknown', message: 'Validation failed' }];
};

// ============ Validation Middleware Factories ============

/**
 * Validate request body
 */
const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body || {});
    if (!result.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: formatZodError(result.error)
        });
    }
    req.body = result.data; // Use parsed/transformed data
    next();
};

/**
 * Validate request query params
 */
const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query || {});
    if (!result.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: formatZodError(result.error)
        });
    }
    req.query = result.data; // Use parsed/transformed data
    next();
};

/**
 * Validate request params
 */
const validateParams = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.params || {});
    if (!result.success) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: formatZodError(result.error)
        });
    }
    req.params = result.data; // Use parsed/transformed data
    next();
};

module.exports = {
    validateBody,
    validateQuery,
    validateParams,
    schemas: {
        registerBody: registerBodySchema,
        loginBody: loginBodySchema,
        updateProfileBody: updateProfileBodySchema,
        createReportBody: createReportBodySchema,
        getReportsQuery: getReportsQuerySchema,
        verifyReportBody: verifyReportBodySchema,
        idParam: idParamSchema,
        sinceQuery: sinceQuerySchema
    }
};
