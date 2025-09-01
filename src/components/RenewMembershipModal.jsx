import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { transactionService } from '../services/transactionService';

const RenewMembershipModal = ({ isOpen, onClose, member, onRenewalSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [renewalPreview, setRenewalPreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSelectedPackage('');
      setSelectedPaymentMethod('');
      setAmount('');
      setNotes('');
      setError('');
      setRenewalPreview(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPackage && member) {
      calculateRenewalPreview();
    }
  }, [selectedPackage, member]);

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
      setError('Failed to load renewal data');
    }
  };

  const calculateRenewalPreview = () => {
    const pkg = packages.find(p => p.id === parseInt(selectedPackage));
    if (!pkg || !member) return;

    const now = new Date();
    const currentEndDate = new Date(member.endDate);
    
    // If membership not expired, extend from current end date
    // If expired, start from today
    const newStartDate = currentEndDate > now ? currentEndDate : now;
    const newEndDate = new Date(newStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + pkg.durationMonths);

    const extensionDays = Math.ceil((newEndDate - currentEndDate) / (1000 * 60 * 60 * 24));

    setRenewalPreview({
      packageName: pkg.name,
      duration: pkg.durationMonths,
      currentEndDate: currentEndDate,
      newStartDate: newStartDate,
      newEndDate: newEndDate,
      extensionDays: extensionDays,
      isExpired: currentEndDate <= now
    });
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
      const renewalData = {
        packageId: parseInt(selectedPackage),
        paymentMethodId: parseInt(selectedPaymentMethod),
        amount: parseFloat(amount),
        notes: notes.trim() || null
      };

      const response = await fetch(`http://localhost:3000/api/members/${member.id}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(renewalData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to renew membership');
      }

      const result = await response.json();
      
      onRenewalSuccess && onRenewalSuccess(result);
      onClose();
    } catch (error) {
      console.error('Renewal error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Renew Membership
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

          {member && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-800">{member.name}</p>
              <p className="text-sm text-blue-600">ID: {member.id}</p>
              {member.phone && (
                <p className="text-sm text-blue-600">Phone: {member.phone}</p>
              )}
              <p className="text-sm text-blue-600">
                Current: {member.membershipType} (Expires: {formatDate(member.endDate)})
              </p>
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
                New Package *
              </label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.durationMonths} months) - {formatCurrency(pkg.price)}
                  </option>
                ))}
              </select>
            </div>

            {renewalPreview && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Renewal Preview:</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• Package: {renewalPreview.packageName} ({renewalPreview.duration} months)</p>
                  <p>• Current End Date: {formatDate(renewalPreview.currentEndDate)}</p>
                  <p>• New Start Date: {formatDate(renewalPreview.newStartDate)}</p>
                  <p>• New End Date: {formatDate(renewalPreview.newEndDate)}</p>
                  <p className="font-medium">
                    • Extension: +{renewalPreview.extensionDays} days
                    {renewalPreview.isExpired && " (Plus catching up from expired period)"}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={loading}
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
                disabled={loading}
              />
              {amount && (
                <p className="text-sm text-gray-500 mt-1">
                  Preview: {formatCurrency(parseFloat(amount || 0))}
                </p>
              )}
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
                placeholder="Optional notes for this renewal"
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
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Renew Membership'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RenewMembershipModal;