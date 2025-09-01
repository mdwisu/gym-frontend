import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { useNotification } from '../contexts/NotificationContext';
import MemberModal from './MemberModal';
import RenewMembershipModal from './RenewMembershipModal';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewMember, setRenewMember] = useState(null);
  
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadMembers();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getAllMembers(currentPage, itemsPerPage, searchTerm, statusFilter);
      setMembers(data.members || []);
      setPagination(data.pagination || null);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowModal(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      await memberService.deleteMember(id);
      showSuccess('Member deleted successfully!');
      loadMembers();
    } catch (error) {
      showError(error.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMember(null);
  };

  const handleMemberSaved = () => {
    loadMembers();
    handleModalClose();
    showSuccess(editingMember ? 'Member updated successfully!' : 'Member added successfully!');
  };

  const handleRenewMembership = (member) => {
    setRenewMember(member);
    setShowRenewModal(true);
  };

  const handleRenewModalClose = () => {
    setShowRenewModal(false);
    setRenewMember(null);
  };

  const handleRenewalSuccess = (result) => {
    showSuccess(`Membership renewed successfully! Extended until ${new Date(result.renewalDetails.newEndDate).toLocaleDateString('id-ID')}`);
    loadMembers(); // Refresh member data
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getStatusText = (status) => {
    const statusMap = {
      active: 'Active',
      expiring_soon: 'Expiring Soon',
      expired: 'Expired'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'expiring_soon': return 'status-expiring_soon';
      case 'expired': return 'status-expired';
      default: return 'status-badge';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Members</h2>
          <p className="text-gray-600">Manage your gym members</p>
        </div>
        <button onClick={handleAddMember} className="btn-primary btn-lg">
          <span className="mr-2">➕</span> Add New Member
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by ID, name, phone, or email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="form-input w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="form-input w-full"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No members found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
                <div className="text-left min-w-[60px]">ID</div>
                <div className="text-left min-w-[140px]">Name</div>
                <div className="text-left min-w-[120px]">Membership</div>
                <div className="text-left min-w-[100px]">Start Date</div>
                <div className="text-left min-w-[100px]">End Date</div>
                <div className="text-left min-w-[120px]">Status</div>
                <div className="text-left min-w-[200px]">Actions</div>
              </div>

              {/* Table Body */}
              {members.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                <div className="flex items-center">
                  <div className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-medium">
                    #{member.id}
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    {member.phone && (
                      <div className="text-sm text-gray-500">{member.phone}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-gray-900">
                  {member.membershipType}
                </div>
                <div className="flex items-center text-gray-600">
                  {formatDate(member.startDate)}
                </div>
                <div className="flex items-center text-gray-600">
                  {formatDate(member.endDate)}
                </div>
                <div className="flex items-center">
                  <span className={getStatusColor(member.status)}>
                    {getStatusText(member.status)}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRenewMembership(member)}
                      className="px-3 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded transition-colors duration-200"
                      title="Renew Membership"
                    >
                      Renew
                    </button>
                    <button
                      onClick={() => handleEditMember(member)}
                      className="px-3 py-1 text-xs bg-yellow-500 text-white hover:bg-yellow-600 rounded transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="px-3 py-1 text-xs bg-red-500 text-white hover:bg-red-600 rounded transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="card mt-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              {/* Pagination info */}
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalMembers)} of{' '}
                {pagination.totalMembers} members
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className={`px-3 py-2 text-sm rounded-md ${
                    pagination.hasPreviousPage
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>

                {/* Page numbers */}
                {(() => {
                  const pages = [];
                  const { currentPage, totalPages } = pagination;
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, currentPage + 2);

                  // Adjust range to always show 5 pages if possible
                  if (endPage - startPage < 4) {
                    if (startPage === 1) {
                      endPage = Math.min(totalPages, startPage + 4);
                    } else {
                      startPage = Math.max(1, endPage - 4);
                    }
                  }

                  // First page
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(<span key="dots1" className="px-2 text-gray-400">...</span>);
                    }
                  }

                  // Page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-2 text-sm rounded-md ${
                          i === currentPage
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Last page
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(<span key="dots2" className="px-2 text-gray-400">...</span>);
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-3 py-2 text-sm rounded-md ${
                    pagination.hasNextPage
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showModal && (
        <MemberModal
          member={editingMember}
          onClose={handleModalClose}
          onSave={handleMemberSaved}
        />
      )}

      {/* Renewal Modal */}
      {showRenewModal && (
        <RenewMembershipModal
          isOpen={showRenewModal}
          member={renewMember}
          onClose={handleRenewModalClose}
          onRenewalSuccess={handleRenewalSuccess}
        />
      )}
    </div>
  );
};

export default Members;