import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl mr-3">🏋️</span>
                <h1 className="text-xl font-bold text-gray-900">Gym Manager</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NavLink
                to="/dashboard"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive('/dashboard')
                    ? 'text-primary-600 bg-primary-50 border border-primary-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">📊</span> Dashboard
              </NavLink>
              
              <NavLink
                to="/members"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive('/members')
                    ? 'text-primary-600 bg-primary-50 border border-primary-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">👥</span> Members
              </NavLink>

              <NavLink
                to="/checkin"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive('/checkin')
                    ? 'text-primary-600 bg-primary-50 border border-primary-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">🔍</span> Check-In
              </NavLink>

              <NavLink
                to="/member-card"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive('/member-card')
                    ? 'text-primary-600 bg-primary-50 border border-primary-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">🆔</span> ID Card
              </NavLink>
              
              <button
                onClick={handleLogout}
                className="btn-danger btn-sm"
              >
                <span className="mr-2">🚪</span> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;