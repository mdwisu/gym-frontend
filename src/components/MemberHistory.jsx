import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { useNotification } from '../contexts/NotificationContext';

const MemberHistory = ({ member, onClose }) => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    if (member?.id) {
      loadMemberHistory();
    }
  }, [member]);

  const loadMemberHistory = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMemberHistory(member.id);
      setHistoryData(data);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'future': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMembershipTypeColor = (type) => {
    switch (type) {
      case 'loyal': return 'bg-purple-100 text-purple-800';
      case 'returning': return 'bg-blue-100 text-blue-800';
      case 'second_time': return 'bg-yellow-100 text-yellow-800';
      case 'new': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!historyData) {
    return null;
  }

  const { summary, periods, analytics } = historyData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Membership History</h2>
            <p className="text-gray-600">{member.name} (#{member.id})</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Total Memberships</h3>
            <p className="text-2xl font-bold text-blue-900">{summary.totalPeriods}</p>
            <p className="text-xs text-blue-600">times as member</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Total Days</h3>
            <p className="text-2xl font-bold text-green-900">{summary.totalDaysAsMember}</p>
            <p className="text-xs text-green-600">days as member</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Loyalty Score</h3>
            <p className="text-2xl font-bold text-purple-900">{summary.loyaltyScore}</p>
            <p className="text-xs text-purple-600">out of 100</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-800">Total Spent</h3>
            <p className="text-lg font-bold text-orange-900">{formatCurrency(summary.totalSpent)}</p>
            <p className="text-xs text-orange-600">lifetime value</p>
          </div>
        </div>

        {/* Member Type Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMembershipTypeColor(summary.membershipType)}`}>
            {summary.membershipType === 'loyal' && '👑 Loyal Customer'}
            {summary.membershipType === 'returning' && '🔄 Returning Member'}
            {summary.membershipType === 'second_time' && '✨ Second Time'}
            {summary.membershipType === 'new' && '🌟 New Member'}
          </span>
          <span className="ml-3 text-gray-600">
            Member since {formatDate(summary.memberSince)}
          </span>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Timeline</h3>
          
          {periods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No membership periods found
            </div>
          ) : (
            <div className="space-y-4">
              {periods.map((period, index) => (
                <div key={period.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(period.status)}`}>
                          {period.status}
                        </span>
                        <h4 className="font-medium text-gray-900">{period.packageName}</h4>
                        <span className="text-sm text-gray-500">
                          ({period.duration} {period.duration === 1 ? 'month' : 'months'})
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📅 {formatDate(period.startDate)} - {formatDate(period.endDate)}</p>
                        {period.transaction && (
                          <p>💰 {formatCurrency(period.transaction.amount)} via {period.transaction.paymentMethod.name}</p>
                        )}
                        <p>🗓️ Purchased: {formatDate(period.createdAt)}</p>
                      </div>
                    </div>
                    
                    {/* Period indicator */}
                    <div className="mt-2 sm:mt-0 flex items-center">
                      <span className="text-xs text-gray-500">#{periods.length - index}</span>
                    </div>
                  </div>
                  
                  {/* Gap indicator */}
                  {index < periods.length - 1 && analytics.gaps.find(gap => gap.afterPeriod === periods.length - index - 1) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center text-orange-600">
                        <span className="text-sm">⚠️ Gap: {analytics.gaps.find(gap => gap.afterPeriod === periods.length - index - 1)?.days} days inactive</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Summary */}
        {analytics.gaps.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Gap Analysis</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total gaps: </span>
                <span className="font-medium">{analytics.gaps.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Average gap: </span>
                <span className="font-medium">{analytics.averageGapDays} days</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberHistory;