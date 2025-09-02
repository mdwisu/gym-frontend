import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { useNotification } from '../contexts/NotificationContext';

const DayPassCheckIn = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    payment_method_id: '',
    amount: '25000'
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
      // Reset form
      setFormData({
        name: '',
        phone: '',
        payment_method_id: '',
        amount: '25000'
      });
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const data = await memberService.getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      showError(error.message);
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create day pass member with transaction
      const dayPassData = {
        name: formData.name,
        phone: formData.phone,
        email: null,
        membership_type: 'Day Pass',
        start_date: new Date().toISOString().split('T')[0],
        duration_months: '0', // Day pass = 0 months
        notes: 'Day Pass - Single visit'
      };

      // Find day pass package ID
      const packages = await memberService.getPackages();
      const dayPassPackage = packages.find(pkg => pkg.name === 'Day Pass');
      
      if (!dayPassPackage) {
        showError('Day Pass package not found. Please contact admin.');
        return;
      }

      const result = await memberService.createMemberWithTransaction(
        dayPassData,
        dayPassPackage.id,
        parseInt(formData.payment_method_id),
        parseFloat(formData.amount)
      );

      showSuccess(`🎉 Day Pass created for ${formData.name}! Valid until end of today.`);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      onClose();
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-container">
        <div className="modal-content animate-slide-up">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                🏃‍♂️ Day Pass Check-in
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Single day gym access - Expires at end of today
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Guest Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="form-label">Guest Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter guest name"
                />
              </div>
              <div>
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-green-900 mb-3">💳 Day Pass Payment</h4>
              </div>
              <div>
                <label htmlFor="payment_method_id" className="form-label">Payment Method *</label>
                <select
                  id="payment_method_id"
                  name="payment_method_id"
                  required
                  value={formData.payment_method_id}
                  onChange={handleChange}
                  className="form-input"
                  disabled={paymentMethodsLoading}
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
                {paymentMethodsLoading && (
                  <div className="text-sm text-gray-500 mt-1">Loading payment methods...</div>
                )}
              </div>
              <div>
                <label htmlFor="amount" className="form-label">Amount (Rp) *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min="0"
                  step="1000"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Day Pass Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Valid for today only (expires at midnight)</li>
                      <li>Full gym access for the entire day</li>
                      <li>Can be upgraded to membership later</li>
                      <li>QR code will be generated for check-in</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-md"
              >
                {loading ? 'Creating Day Pass...' : '🏃‍♂️ Create Day Pass'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DayPassCheckIn;