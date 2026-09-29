const request = require('supertest');
const app = require('../app');
const Report = require('../models/report.model');

// Mock the Report model
jest.mock('../models/report.model');

describe('POST /api/reports', () => {
    it('should create a report and return 201', async () => {
        // 1. Setup Mock
        const mockReport = {
            id: 1,
            hazard_type: 'debris',
            description: 'Test description',
            latitude: 51.505,
            longitude: -0.09,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        Report.create.mockResolvedValue(mockReport);

        // 2. Execute Request
        const res = await request(app)
            .post('/api/reports')
            .send({
                type: 'debris',
                description: 'Test description',
                lat: 51.505,
                lon: -0.09
            });

        // 3. Verify Response
        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toEqual(mockReport);

        // 4. Verify Model Call
        expect(Report.create).toHaveBeenCalledWith(expect.objectContaining({
            hazard_type: 'debris',
            latitude: 51.505,
            longitude: -0.09
        }));
    });

    it('should return 400 if fields are missing', async () => {
        const res = await request(app)
            .post('/api/reports')
            .send({
                type: 'debris'
                // missing lat, lon
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toBe('error');
    });
});
