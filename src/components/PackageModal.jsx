import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';

const PackageModal = ({ isOpen, onClose, package: editingPackage, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    durationMonths: '',
    price: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingPackage) {
        // Edit mode
        setFormData({
          name: editingPackage.name || '',
          durationMonths: editingPackage.durationMonths || '',
          price: editingPackage.price || '',
          description: editingPackage.description || ''
        });
      } else {
        // Create mode
        setFormData({
          name: '',
          durationMonths: '',
          price: '',
          description: ''
        });
      }
      setError('');
    }
  }, [isOpen, editingPackage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.durationMonths || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (parseInt(formData.durationMonths) <= 0) {
      setError('Duration must be greater than 0 months');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const packageData = {
        name: formData.name.trim(),
        durationMonths: parseInt(formData.durationMonths),
        price: parseFloat(formData.price),
        description: formData.description.trim() || null
      };

      if (editingPackage) {
        await memberService.updatePackage(editingPackage.id, packageData);
      } else {
        await memberService.createPackage(packageData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Save package error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Monthly, 3 Months, Annual"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Months) *
              </label>
              <input
                type="number"
                name="durationMonths"
                value={formData.durationMonths}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 1, 3, 6, 12"
                min="1"
                step="1"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (IDR) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 150000"
                min="1"
                step="1"
                required
                disabled={loading}
              />
              {formData.price && (
                <p className="text-sm text-gray-500 mt-1">
                  Preview: Rp {parseFloat(formData.price || 0).toLocaleString('id-ID')}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Enter exact amount (e.g., 150000 for Rp 150,000)
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows="3"
                placeholder="Optional description of the package"
                disabled={loading}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading 
                  ? 'Saving...' 
                  : editingPackage 
                    ? 'Update Package' 
                    : 'Create Package'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PackageModal;