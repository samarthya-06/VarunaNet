import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Report from './pages/Report';
import Dashboard from './pages/Dashboard';
import Feed from './pages/Feed';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import AdminPanel from './pages/AdminPanel';

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Protected routes - require authentication */}
                    <Route element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route path="/map" element={<Home />} />
                        <Route path="/report" element={<Report />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/feed" element={<Feed />} />
                    </Route>

                    {/* Admin route - requires admin role */}
                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminPanel />
                        </ProtectedRoute>
                    } />
                </Routes>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
