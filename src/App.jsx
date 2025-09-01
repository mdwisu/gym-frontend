import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import CheckIn from './components/CheckIn';
import MemberCard from './components/MemberCard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="bg-gray-50 min-h-screen">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="members" element={<Members />} />
                <Route path="checkin" element={<CheckIn />} />
                <Route path="member-card" element={<MemberCard />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;