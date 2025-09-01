import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { useNotification } from '../contexts/NotificationContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    expiringSoon: 0,
  });
  const [expiringSoonMembers, setExpiringSoonMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats and members
      const [statsData, membersData] = await Promise.all([
        memberService.getDashboardStats(),
        memberService.getAllMembers()
      ]);

      setStats(statsData);
      
      // Filter expiring soon members
      const expiring = membersData.filter(member => member.status === 'expiring_soon');
      setExpiringSoonMembers(expiring);
      
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`stat-card bg-gradient-to-r ${color}`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white">{loading ? '...' : value}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your gym members</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon="👥"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          icon="✅"
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringSoon}
          icon="⚠️"
          color="from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Expired"
          value={stats.expiredMembers}
          icon="❌"
          color="from-red-500 to-red-600"
        />
      </div>

      {/* Expiring Soon List */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">⏰</span> Members Expiring Soon
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : expiringSoonMembers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No members expiring soon
            </div>
          ) : (
            <div className="space-y-4">
              {expiringSoonMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center p-4 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">
                      {member.membershipType} - Expires: {formatDate(member.endDate)}
                    </div>
                  </div>
                  <span className="status-expiring_soon">Expiring Soon</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;