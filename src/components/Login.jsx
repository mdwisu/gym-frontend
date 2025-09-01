import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { showError } = useNotification();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(credentials.username, credentials.password);
      // Navigation will happen automatically due to auth state change
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      <div className="w-full max-w-md p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <span className="text-3xl">🏋️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Gym Manager</h1>
          <p className="text-primary-100">Member Management System</p>
        </div>

        {/* Login Form */}
        <div className="card backdrop-blur-sm bg-white/10 border-white/20 animate-slide-up">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="form-label text-white">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="form-input bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="form-label text-white">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="form-input bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30"
                  placeholder="Enter password"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <span className="mr-2">🚀</span> Login
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-primary-200 text-sm">
          <p>Default: admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;