import { useState } from 'react';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

const CheckIn = () => {
  const [searchType, setSearchType] = useState('phone');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [duplicateMembers, setDuplicateMembers] = useState([]);
  
  let showNotification;
  try {
    const notification = useNotification();
    showNotification = notification?.showNotification || notification?.addNotification || (() => {});
  } catch (error) {
    console.warn('Notification context not available:', error);
    showNotification = (message, type) => {
      console.log(`${type}: ${message}`);
      alert(`${type}: ${message}`);
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      showNotification('Please enter search value', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload = {};
      payload[searchType] = searchValue.trim();

      const response = await axios.post('http://localhost:3000/api/checkin', payload);
      
      setResult({
        success: true,
        data: response.data
      });
      
      if (response.data.canEnter) {
        showNotification(response.data.message, 'success');
      }
    } catch (error) {
      const errorData = error.response?.data;
      
      // Handle duplicate members (status code 300)
      if (error.response?.status === 300 && errorData?.duplicateMembers) {
        setDuplicateMembers(errorData.duplicateMembers);
        setResult({
          success: false,
          data: errorData,
          hasDuplicates: true
        });
        showNotification(errorData.message || 'Multiple members found', 'warning');
      } else {
        setResult({
          success: false,
          data: errorData,
          hasDuplicates: false
        });
        showNotification(errorData?.error || 'Check-in failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchValue('');
    setResult(null);
    setDuplicateMembers([]);
  };

  // Handle selecting a specific member from duplicates
  const handleSelectMember = async (member) => {
    setLoading(true);
    setDuplicateMembers([]);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3000/api/checkin', {
        memberNumber: member.id
      });
      
      setResult({
        success: true,
        data: response.data
      });
      
      if (response.data.canEnter) {
        showNotification(response.data.message, 'success');
      }
    } catch (error) {
      const errorData = error.response?.data;
      
      setResult({
        success: false,
        data: errorData
      });
      
      showNotification(errorData?.error || 'Check-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expiring_soon': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'expiring_soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Member Check-In
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-blue-800 text-sm">
                <p className="font-medium mb-1">Recommended for faster check-in:</p>
                <p>📱 <strong>Phone Number</strong> - Most reliable and easy to remember</p>
                <p>🆔 <strong>Member Number</strong> - Fastest if member knows their ID</p>
                <p>👤 <strong>Name</strong> - Use only if phone/ID unavailable</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Search By</label>
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="form-input"
              >
                <option value="phone">Phone Number (Recommended)</option>
                <option value="memberNumber">Member Number</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                {searchType === 'phone' && 'Phone Number'}
                {searchType === 'memberNumber' && 'Member Number'}
                {searchType === 'name' && 'Member Name'}
              </label>
              <input
                type={searchType === 'memberNumber' ? 'number' : 'text'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  searchType === 'phone' ? 'Enter phone number (e.g: 081234567890)' :
                  searchType === 'memberNumber' ? 'Enter member number' :
                  'Enter member name'
                }
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-md flex-1"
              >
                {loading ? 'Checking...' : 'Check In'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary btn-md"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Duplicate Members Selection */}
      {duplicateMembers.length > 0 && (
        <div className="card mt-6 border-l-4 border-yellow-500">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-800">
                  Multiple Members Found
                </h3>
                <p className="text-yellow-600">
                  Please select the correct member from the list below:
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {duplicateMembers.map((member, index) => (
                <div
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 hover:border-yellow-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-semibold text-gray-900 mr-2">{member.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('active')}`}>
                          Click to Select
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Member ID:</span> {member.id}
                        </div>
                        {member.phone && (
                          <div>
                            <span className="font-medium">Phone:</span> {member.phone}
                          </div>
                        )}
                        {member.email && (
                          <div>
                            <span className="font-medium">Email:</span> {member.email}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Membership:</span> {member.membershipType}
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span> {formatDate(member.endDate)}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> To avoid this in the future, use the member's phone number or ID for faster check-in.
              </p>
            </div>
          </div>
        </div>
      )}

      {result && !result.hasDuplicates && (
        <div className={`card mt-6 ${result.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                result.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {result.success ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? 'Access Granted' : 'Access Denied'}
                </h3>
                <p className={`${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.data.message || result.data.error}
                </p>
              </div>
            </div>

            {result.data.member && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{result.data.member.name}</h4>
                    <p className="text-gray-600">Member #{result.data.member.id}</p>
                    {result.data.member.phone && (
                      <p className="text-gray-600">{result.data.member.phone}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.data.member.status)}`}>
                    {getStatusText(result.data.member.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Membership Type:</span>
                    <div className="font-medium">{result.data.member.membershipType}</div>
                  </div>
                  
                  {result.data.member.endDate && (
                    <div>
                      <span className="text-gray-500">Expires:</span>
                      <div className="font-medium">{formatDate(result.data.member.endDate)}</div>
                    </div>
                  )}
                  
                  {result.data.member.daysRemaining !== undefined && (
                    <div>
                      <span className="text-gray-500">Days Remaining:</span>
                      <div className={`font-medium ${
                        result.data.member.daysRemaining <= 7 ? 'text-yellow-600' : 
                        result.data.member.daysRemaining <= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {result.data.member.daysRemaining} days
                      </div>
                    </div>
                  )}
                </div>

                {result.data.warning && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-yellow-800 text-sm font-medium">{result.data.warning}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIn;