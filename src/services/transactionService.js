import api from './api';

export const transactionService = {
  // Get all transactions with pagination
  getTransactions: async (page = 1, limit = 50, memberId = null) => {
    try {
      const params = { page, limit };
      if (memberId) params.memberId = memberId;
      
      const response = await api.get('/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await api.post('/transactions', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/payment-methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }
};

export const reportService = {
  // Get monthly report
  getMonthlyReport: async (year, month) => {
    try {
      const response = await api.get('/reports/monthly', {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      throw error;
    }
  },

  // Get revenue report
  getRevenueReport: async (startDate, endDate, period = 'daily') => {
    try {
      const response = await api.get('/reports/revenue', {
        params: { startDate, endDate, period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      throw error;
    }
  },

  // Get package performance report
  getPackageReport: async (startDate = null, endDate = null, limit = 10) => {
    try {
      const params = { limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/reports/packages', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching package report:', error);
      throw error;
    }
  }
};