import React, { useState, useEffect } from 'react';
import { reportService, transactionService } from '../services/transactionService';
import { useNotification } from '../contexts/NotificationContext';

const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [previousMonthReport, setPreviousMonthReport] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [packageReport, setPackageReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  const { showError } = useNotification();

  useEffect(() => {
    if (activeTab === 'monthly') {
      loadMonthlyReport();
    } else if (activeTab === 'transactions') {
      loadTransactions();
    } else if (activeTab === 'packages') {
      loadPackageReport();
    }
  }, [activeTab, selectedYear, selectedMonth]);

  const loadMonthlyReport = async () => {
    setLoading(true);
    try {
      // Load current month report
      const data = await reportService.getMonthlyReport(selectedYear, selectedMonth);
      setMonthlyReport(data);

      // Load previous month for comparison
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      
      try {
        const prevData = await reportService.getMonthlyReport(prevYear, prevMonth);
        setPreviousMonthReport(prevData);
      } catch (prevError) {
        // Previous month data might not exist, that's ok
        setPreviousMonthReport(null);
      }
    } catch (error) {
      showError('Failed to load monthly report');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await transactionService.getTransactions(1, 50);
      setTransactions(data.transactions || []);
    } catch (error) {
      showError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadPackageReport = async () => {
    setLoading(true);
    try {
      const data = await reportService.getPackageReport();
      setPackageReport(data);
    } catch (error) {
      showError('Failed to load package report');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getCurrentMonthName = () => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[selectedMonth - 1];
  };

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous * 100);
  };

  const renderPercentageChange = (current, previous, label) => {
    const change = calculatePercentageChange(current, previous);
    if (change === null) return null;

    const isPositive = change >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const icon = isPositive ? '↗️' : '↘️';

    return (
      <div className={`text-xs ${color} mt-1`}>
        {icon} {Math.abs(change).toFixed(1)}% vs last month
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports</h2>
        <p className="text-gray-600">Track your gym's financial performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monthly'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Monthly Report
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Transactions
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'packages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Package Performance
            </button>
          </nav>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Monthly Report Tab */}
      {activeTab === 'monthly' && !loading && (
        <div>
          {/* Month/Year Selector */}
          <div className="card mb-6">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Period
                  </label>
                  <div className="flex space-x-3">
                    <div>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[140px]"
                        disabled={loading}
                      >
                        {(() => {
                          const currentYear = new Date().getFullYear();
                          const years = [];
                          // Generate from 2 years ago to 2 years ahead
                          for (let year = currentYear - 2; year <= currentYear + 2; year++) {
                            years.push(year);
                          }
                          return years.map(year => (
                            <option key={year} value={year}>
                              {year}
                              {year === currentYear && ' (Current)'}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                    <div>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[140px]"
                        disabled={loading}
                      >
                        {[
                          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                        ].map((monthName, index) => {
                          const monthValue = index + 1;
                          const currentDate = new Date();
                          const isCurrentMonth = selectedYear === currentDate.getFullYear() && 
                                                monthValue === currentDate.getMonth() + 1;
                          return (
                            <option key={monthValue} value={monthValue}>
                              {monthName}
                              {isCurrentMonth && ' (Now)'}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Quick Navigation Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
                      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
                      setSelectedMonth(prevMonth);
                      setSelectedYear(prevYear);
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    disabled={loading}
                    title="Previous Month"
                  >
                    ← Prev
                  </button>
                  
                  <button
                    onClick={() => {
                      const today = new Date();
                      setSelectedYear(today.getFullYear());
                      setSelectedMonth(today.getMonth() + 1);
                    }}
                    className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                    disabled={loading}
                    title="Current Month"
                  >
                    Today
                  </button>
                  
                  <button
                    onClick={() => {
                      const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
                      const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
                      setSelectedMonth(nextMonth);
                      setSelectedYear(nextYear);
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    disabled={loading}
                    title="Next Month"
                  >
                    Next →
                  </button>
                </div>
              </div>
              
              {/* Period Display */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  📊 Showing report for: <span className="font-medium text-gray-900">
                    {getCurrentMonthName()} {selectedYear}
                  </span>
                  {selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth() + 1 && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Current Month
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Loading State untuk Monthly Report */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading {getCurrentMonthName()} {selectedYear} report...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && monthlyReport && monthlyReport.totalRevenue === 0 && (
            <div className="card">
              <div className="p-8 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-500 mb-4">
                  No transactions found for {getCurrentMonthName()} {selectedYear}
                </p>
                <button
                  onClick={() => {
                    const today = new Date();
                    setSelectedYear(today.getFullYear());
                    setSelectedMonth(today.getMonth() + 1);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  View Current Month
                </button>
              </div>
            </div>
          )}

          {!loading && monthlyReport && monthlyReport.totalRevenue > 0 && (
            <div>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="card">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyReport.totalRevenue)}</p>
                        {previousMonthReport && renderPercentageChange(
                          monthlyReport.totalRevenue, 
                          previousMonthReport.totalRevenue
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Transactions</p>
                        <p className="text-2xl font-bold text-gray-900">{monthlyReport.totalTransactions}</p>
                        {previousMonthReport && renderPercentageChange(
                          monthlyReport.totalTransactions, 
                          previousMonthReport.totalTransactions
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">New Members</p>
                        <p className="text-2xl font-bold text-gray-900">{monthlyReport.newMembers}</p>
                        {previousMonthReport && renderPercentageChange(
                          monthlyReport.newMembers, 
                          previousMonthReport.newMembers
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg per Transaction</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(monthlyReport.totalTransactions > 0 ? monthlyReport.totalRevenue / monthlyReport.totalTransactions : 0)}
                        </p>
                        {previousMonthReport && renderPercentageChange(
                          monthlyReport.totalTransactions > 0 ? monthlyReport.totalRevenue / monthlyReport.totalTransactions : 0,
                          previousMonthReport.totalTransactions > 0 ? previousMonthReport.totalRevenue / previousMonthReport.totalTransactions : 0
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue by Package */}
              <div className="mb-6">
                <div className="card">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Package</h3>
                    <div className="space-y-3">
                      {monthlyReport.revenueByPackage.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{item.packageName}</span>
                            <span className="text-gray-500 text-sm ml-2">({item.count} sales)</span>
                            <div className="text-xs text-gray-400">{item.duration} months package</div>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-green-600 block">{formatCurrency(item.revenue)}</span>
                            <span className="text-xs text-gray-500">
                              {formatCurrency(item.revenue / (item.count || 1))} avg/sale
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && !loading && (
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.transactionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{transaction.member.name}</div>
                          <div className="text-sm text-gray-500">ID: {transaction.member.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.packageName} ({transaction.packageDuration} months)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.paymentMethod.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Package Performance Tab */}
      {activeTab === 'packages' && !loading && packageReport && (
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Performance (All Time)</h3>
            {packageReport.packages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No package data found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {packageReport.packages.map((pkg) => (
                      <tr key={pkg.packageId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pkg.packageName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pkg.duration} months
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(pkg.currentPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pkg.totalSold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(pkg.totalRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(pkg.averagePrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;