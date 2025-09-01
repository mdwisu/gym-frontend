import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { useNotification } from '../contexts/NotificationContext';

const MemberModal = ({ member, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    membership_type: '',
    start_date: new Date().toISOString().split('T')[0],
    duration_months: '',
    notes: '',
  });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    loadPackages();
    
    if (member) {
      // Calculate duration months for editing
      const startDate = new Date(member.startDate);
      const endDate = new Date(member.endDate);
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      
      setFormData({
        name: member.name,
        phone: member.phone || '',
        email: member.email || '',
        membership_type: member.membershipType,
        start_date: member.startDate.split('T')[0],
        duration_months: months.toString(),
        notes: member.notes || '',
      });
    }
  }, [member]);

  const loadPackages = async () => {
    try {
      const data = await memberService.getPackages();
      setPackages(data);
    } catch (error) {
      showError(error.message);
    } finally {
      setPackagesLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePackageChange = (e) => {
    const selectedPackage = packages.find(pkg => pkg.name === e.target.value);
    setFormData({
      ...formData,
      membership_type: e.target.value,
      duration_months: selectedPackage ? selectedPackage.durationMonths.toString() : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (member) {
        await memberService.updateMember(member.id, formData);
      } else {
        await memberService.createMember(formData);
      }
      onSave();
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-container">
        <div className="modal-content animate-slide-up">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {member ? 'Edit Member' : 'Add New Member'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="form-label">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="membership_type" className="form-label">Membership Type *</label>
                <select
                  id="membership_type"
                  name="membership_type"
                  required
                  value={formData.membership_type}
                  onChange={handlePackageChange}
                  className="form-input"
                  disabled={packagesLoading}
                >
                  <option value="">Select Package</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.name}>
                      {pkg.name} ({pkg.durationMonths} months)
                    </option>
                  ))}
                </select>
                {packagesLoading && (
                  <div className="text-sm text-gray-500 mt-1">Loading packages...</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="start_date" className="form-label">Start Date *</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  required
                  value={formData.start_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="duration_months" className="form-label">Duration (Months) *</label>
                <input
                  type="number"
                  id="duration_months"
                  name="duration_months"
                  min="1"
                  required
                  value={formData.duration_months}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                className="form-input resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary btn-md"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary btn-md disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Member'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;