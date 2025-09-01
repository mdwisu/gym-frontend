import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { useNotification } from '../contexts/NotificationContext';
import PackageModal from './PackageModal';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await memberService.getPackages();
      setPackages(data);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = () => {
    setEditingPackage(null);
    setShowModal(true);
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setShowModal(true);
  };

  const handleDeletePackage = async (pkg) => {
    if (!window.confirm(`Are you sure you want to delete the package "${pkg.name}"?\n\nNote: If this package has transaction history, it will be deactivated instead of deleted.`)) {
      return;
    }

    try {
      const result = await memberService.deletePackage(pkg.id);
      showSuccess(result.message);
      loadPackages();
    } catch (error) {
      showError(error.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPackage(null);
  };

  const handlePackageSaved = () => {
    loadPackages();
    handleModalClose();
    showSuccess(editingPackage ? 'Package updated successfully!' : 'Package created successfully!');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Membership Packages</h2>
          <p className="text-gray-600">Manage your gym membership packages and pricing</p>
        </div>
        <button onClick={handleAddPackage} className="btn-primary btn-lg">
          <span className="mr-2">➕</span> Add New Package
        </button>
      </div>

      {/* Packages Grid/List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : packages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first membership package</p>
            <button onClick={handleAddPackage} className="btn-primary">
              Add Package
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* Grid Layout for larger screens */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {pkg.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {pkg.durationMonths} {pkg.durationMonths === 1 ? 'month' : 'months'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(pkg.price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(pkg.price / pkg.durationMonths)}/month
                          </div>
                        </div>
                      </div>
                      
                      {pkg.description && (
                        <p className="text-sm text-gray-600 mb-4">
                          {pkg.description}
                        </p>
                      )}

                      <div className="text-xs text-gray-500 mb-4">
                        Created: {formatDate(pkg.createdAt)}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="flex-1 px-3 py-2 text-sm bg-yellow-500 text-white hover:bg-yellow-600 rounded transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg)}
                          className="flex-1 px-3 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Layout for smaller screens */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{pkg.name}</h3>
                        <p className="text-sm text-gray-500">
                          {pkg.durationMonths} {pkg.durationMonths === 1 ? 'month' : 'months'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(pkg.price)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(pkg.price / pkg.durationMonths)}/month
                        </div>
                      </div>
                    </div>
                    
                    {pkg.description && (
                      <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                    )}

                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleEditPackage(pkg)}
                        className="px-3 py-1 text-xs bg-yellow-500 text-white hover:bg-yellow-600 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg)}
                        className="px-3 py-1 text-xs bg-red-500 text-white hover:bg-red-600 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Package Modal */}
      {showModal && (
        <PackageModal
          isOpen={showModal}
          package={editingPackage}
          onClose={handleModalClose}
          onSave={handlePackageSaved}
        />
      )}
    </div>
  );
};

export default Packages;