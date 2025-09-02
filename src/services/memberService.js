import api from './api';

export const memberService = {
  async getAllMembers(page = 1, limit = 10, search = '', status = '') {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const response = await api.get(`/members?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch members');
    }
  },

  async createMember(memberData) {
    try {
      const response = await api.post('/members', memberData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create member');
    }
  },

  async updateMember(id, memberData) {
    try {
      const response = await api.put(`/members/${id}`, memberData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update member');
    }
  },

  async deleteMember(id) {
    try {
      const response = await api.delete(`/members/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete member');
    }
  },

  async getDashboardStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch dashboard stats');
    }
  },

  async getPackages() {
    try {
      const response = await api.get('/packages');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch packages');
    }
  },

  async createPackage(packageData) {
    try {
      const response = await api.post('/packages', packageData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create package');
    }
  },

  async updatePackage(id, packageData) {
    try {
      const response = await api.put(`/packages/${id}`, packageData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update package');
    }
  },

  async deletePackage(id) {
    try {
      const response = await api.delete(`/packages/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete package');
    }
  },

  async searchMembers(searchTerm, searchType = 'name') {
    try {
      const searchData = {};
      if (searchType === 'name') {
        searchData.name = searchTerm;
      } else if (searchType === 'phone') {
        searchData.phone = searchTerm;
      } else if (searchType === 'memberNumber') {
        searchData.memberNumber = searchTerm;
      }

      const response = await api.post('/members/search', searchData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search members');
    }
  },

  async checkinMember(memberNumber, name, phone) {
    try {
      const checkinData = {};
      if (memberNumber) checkinData.memberNumber = memberNumber;
      if (name) checkinData.name = name;
      if (phone) checkinData.phone = phone;

      const response = await api.post('/checkin', checkinData);
      return response.data;
    } catch (error) {
      // Return error data for handling duplicates
      if (error.response?.status === 300) {
        throw {
          isDuplicate: true,
          data: error.response.data
        };
      }
      throw new Error(error.response?.data?.error || 'Check-in failed');
    }
  },

  async getPaymentMethods() {
    try {
      const response = await api.get('/payment-methods');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch payment methods');
    }
  },

  async createMemberWithTransaction(memberData, packageId, paymentMethodId, amount) {
    try {
      // First create member
      const memberResponse = await api.post('/members', memberData);
      const memberId = memberResponse.data.id;

      // Then create transaction
      const transactionData = {
        memberId,
        packageId,
        paymentMethodId,
        amount,
        notes: `Initial membership - ${memberData.membership_type}`
      };

      const transactionResponse = await api.post('/transactions', transactionData);
      
      return {
        member: memberResponse.data,
        transaction: transactionResponse.data
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create member with transaction');
    }
  },
};