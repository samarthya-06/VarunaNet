import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to automatically include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

import { offlineService } from './offline';

export const reportService = {
    // Create a new report
    createReport: async (data) => {
        try {
            const isFormData = data instanceof FormData;
            const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

            const response = await api.post('/reports', data, config);
            return response.data;
        } catch (error) {
            if (!error.response) { // Network Error
                console.warn('Network error, saving to offline queue');
                await offlineService.saveReport(data);
                return { status: 'queued', message: 'Report saved offline. Will sync when online.' };
            }
            throw error;
        }
    },

    // Get reports with optional bbox (minLon,minLat,maxLon,maxLat)
    getReports: async (bbox) => {
        const params = {};
        if (bbox) {
            params.bbox = bbox;
        }
        const response = await api.get('/reports', { params });
        return response.data;
    },

    // Get authenticated user's own reports
    getMyReports: async () => {
        const response = await api.get('/reports/my');
        return response.data;
    },

    // Get pending reports for moderation
    getPendingReports: async () => {
        const response = await api.get('/reports/pending');
        return response.data;
    },

    // Get single report by ID
    getReportById: async (id) => {
        const response = await api.get(`/reports/${id}`);
        return response.data;
    },

    // Verify or dismiss a report
    verifyReport: async (id, status) => {
        const response = await api.post(`/reports/${id}/verify`, { status });
        return response.data;
    },

    // Get hotspots
    getHotspots: async (since) => {
        const params = {};
        if (since) params.since = since;
        const response = await api.get('/hotspots', { params });
        return response.data;
    }
};

export const analyticsService = {
    // Get keyword trends and analytics
    getKeywordTrends: async (since) => {
        const params = {};
        if (since) params.since = since;
        const response = await api.get('/analytics/keywords', { params });
        return response.data;
    }
};

export default api;

