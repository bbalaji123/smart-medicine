import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Medications from './pages/Medications/Medications';
import Reminders from './pages/Reminders/Reminders';
import Analytics from './pages/Analytics/Analytics';
import Profile from './pages/Profile/Profile';
import CaregiverDashboard from './pages/Caregiver/CaregiverDashboard';
import HealthJournal from './pages/HealthJournal/HealthJournal';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/medications" element={
              <ProtectedRoute>
                <Layout>
                  <Medications />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reminders" element={
              <ProtectedRoute>
                <Layout>
                  <Reminders />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/health-journal" element={
              <ProtectedRoute>
                <Layout>
                  <HealthJournal />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/caregiver" element={
              <ProtectedRoute>
                <Layout>
                  <CaregiverDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;