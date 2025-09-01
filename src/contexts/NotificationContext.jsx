import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccess = (message) => addNotification(message, 'success');
  const showError = (message) => addNotification(message, 'error');

  const showNotification = (message, type = 'success') => {
    addNotification(message, type);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification ${notification.type} animate-slide-up`}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="flex items-center cursor-pointer">
              <span className="mr-3 text-lg">
                {notification.type === 'error' ? '❌' : '✅'}
              </span>
              <span>{notification.message}</span>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};