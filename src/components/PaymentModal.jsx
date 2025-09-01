import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { memberService } from '../services/memberService';

const PaymentModal = ({ isOpen, onClose, member = null, onPaymentSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPackage) {
      const pkg = packages.find(p => p.id === parseInt(selectedPackage));
      if (pkg) {
        setAmount(pkg.price || '');
      }
    }
  }, [selectedPackage, packages]);

  const loadData = async () => {
    try {
      const [packagesData, paymentMethodsData] = await Promise.all([
        memberService.getPackages(),
        transactionService.getPaymentMethods()
      ]);
      setPackages(packagesData);
      setPaymentMethods(paymentMethodsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load payment data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!member) {
      setError('No member selected');
      return;
    }

    if (!selectedPackage || !selectedPaymentMethod || !amount) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const transactionData = {
        memberId: member.id,
        packageId: parseInt(selectedPackage),
        paymentMethodId: parseInt(selectedPaymentMethod),
        amount: parseFloat(amount),
        notes: notes.trim() || null
      };

      await transactionService.createTransaction(transactionData);
      
      // Reset form
      setSelectedPackage('');
      setSelectedPaymentMethod('');
      setAmount('');
      setNotes('');
      
      onPaymentSuccess && onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.error || 'Failed to process payment');
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
              Process Payment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {member && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-800">{member.name}</p>
              <p className="text-sm text-blue-600">ID: {member.id}</p>
              {member.phone && (
                <p className="text-sm text-blue-600">Phone: {member.phone}</p>
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package *
              </label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select Package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.durationMonths} months) - Rp {pkg.price?.toLocaleString() || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select Payment Method</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Payment amount"
                min="0"
                step="1"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows="3"
                placeholder="Optional notes"
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
                {loading ? 'Processing...' : 'Process Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;