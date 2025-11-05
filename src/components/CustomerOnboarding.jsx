import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Eye, Edit, Trash2, 
  CheckCircle, Clock, AlertCircle, Building, Mail, 
  Phone, Globe, User, Calendar, FileText, ArrowRight,
  BarChart3, TrendingUp, Target, Award, Activity, 
  Heart, PieChart, LineChart, DollarSign, Star, Briefcase
} from 'lucide-react';
import { 
  getCustomers, 
  createCustomer, 
  getCustomer, 
  updateCustomer, 
  startCustomerOnboarding, 
  updateCustomerOnboarding, 
  getCustomerDashboard, 
  addCustomerInteraction, 
  getCustomerInteractions, 
  getOnboardingWorkflow 
} from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const CustomerOnboarding = ({ user }) => {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState({});
  const [dashboardData, setDashboardData] = useState(null);
  
  // Enhanced chart data
  const [chartData, setChartData] = useState({
    growthTrends: null,
    revenueAnalytics: null,
    industryInsights: null,
    healthMetrics: null
  });
  const [chartLoading, setChartLoading] = useState(false);
  
  // Commercial information for active customers
  const [commercialInfo, setCommercialInfo] = useState({
    monthly_revenue: '',
    annual_revenue: '',
    contract_value: '',
    payment_terms: '',
    billing_cycle: 'monthly',
    account_manager: '',
    success_manager: '',
    support_tier: 'standard',
    renewal_date: '',
    upsell_opportunities: '',
    satisfaction_score: '',
    usage_metrics: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Form data for new customer
  const [newCustomer, setNewCustomer] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    company_size: '',
    customer_type: 'sme',
    lead_source: '',
    notes: ''
  });

  const customerStatuses = [
    { value: 'inquiry', label: 'Inquiry', color: 'bg-blue-100 text-blue-800' },
    { value: 'demo_scheduled', label: 'Demo Scheduled', color: 'bg-purple-100 text-purple-800' },
    { value: 'demo_completed', label: 'Demo Completed', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'proposal_sent', label: 'Proposal Sent', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { value: 'contract_sent', label: 'Contract Sent', color: 'bg-pink-100 text-pink-800' },
    { value: 'contract_signed', label: 'Contract Signed', color: 'bg-green-100 text-green-800' },
    { value: 'onboarding', label: 'Onboarding', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'active', label: 'Active', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'churned', label: 'Churned', color: 'bg-red-100 text-red-800' },
    { value: 'suspended', label: 'Suspended', color: 'bg-gray-100 text-gray-800' }
  ];

  const customerTypes = [
    { value: 'startup', label: 'Startup' },
    { value: 'sme', label: 'SME' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'agency', label: 'Agency' },
    { value: 'consultant', label: 'Consultant' }
  ];

  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    } else if (activeTab === 'dashboard') {
      fetchDashboardData();
      fetchEnhancedChartData();
    }
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  // Handle status changes in edit modal to show/hide commercial information
  useEffect(() => {
    if (editCustomer && editCustomer.status === 'active') {
      // Initialize commercial info when status becomes active
      setCommercialInfo({
        monthly_revenue: editCustomer.monthly_revenue || '',
        annual_revenue: editCustomer.annual_revenue || '',
        contract_value: editCustomer.contract_value || '',
        payment_terms: editCustomer.payment_terms || '',
        billing_cycle: editCustomer.billing_cycle || 'monthly',
        account_manager: editCustomer.account_manager || '',
        success_manager: editCustomer.success_manager || '',
        support_tier: editCustomer.support_tier || 'standard',
        renewal_date: editCustomer.renewal_date || '',
        upsell_opportunities: editCustomer.upsell_opportunities || '',
        satisfaction_score: editCustomer.satisfaction_score || '',
        usage_metrics: editCustomer.usage_metrics || ''
      });
    } else if (editCustomer && editCustomer.status !== 'active') {
      // Reset commercial info when status is not active
      setCommercialInfo({
        monthly_revenue: '',
        annual_revenue: '',
        contract_value: '',
        payment_terms: '',
        billing_cycle: 'monthly',
        account_manager: '',
        success_manager: '',
        support_tier: 'standard',
        renewal_date: '',
        upsell_opportunities: '',
        satisfaction_score: '',
        usage_metrics: ''
      });
    }
  }, [editCustomer?.status]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await getCustomers(params.toString());
      if (response.success) {
        setCustomers(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.error || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getCustomerDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnhancedChartData = async () => {
    setChartLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all chart data in parallel
      const [growthResponse, revenueResponse, industryResponse, healthResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/charts/growth-trends`, { headers }),
        fetch(`${API_BASE_URL}/api/customers/charts/revenue-analytics`, { headers }),
        fetch(`${API_BASE_URL}/api/customers/charts/industry-insights`, { headers }),
        fetch(`${API_BASE_URL}/api/customers/charts/health-metrics`, { headers })
      ]);

      const [growthData, revenueData, industryData, healthData] = await Promise.all([
        growthResponse.json(),
        revenueResponse.json(),
        industryResponse.json(),
        healthResponse.json()
      ]);

      setChartData({
        growthTrends: growthData.success ? growthData.data : null,
        revenueAnalytics: revenueData.success ? revenueData.data : null,
        industryInsights: industryData.success ? industryData.data : null,
        healthMetrics: healthData.success ? healthData.data : null
      });

    } catch (err) {
      console.error('Error fetching enhanced chart data:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createCustomer(newCustomer);
      setShowAddModal(false);
      setNewCustomer({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        website: '',
        industry: '',
        company_size: '',
        customer_type: 'sme',
        lead_source: '',
        notes: ''
      });
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Include commercial information for active customers
      const customerData = { ...editCustomer };
      if (editCustomer.status === 'active') {
        Object.assign(customerData, commercialInfo);
      }
      
      await updateCustomer(editCustomer.customer_id, customerData);
      setShowEditModal(false);
      setEditCustomer({});
      setSelectedCustomer(null);
      setCommercialInfo({
        monthly_revenue: '',
        annual_revenue: '',
        contract_value: '',
        payment_terms: '',
        billing_cycle: 'monthly',
        account_manager: '',
        success_manager: '',
        support_tier: 'standard',
        renewal_date: '',
        upsell_opportunities: '',
        satisfaction_score: '',
        usage_metrics: ''
      });
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (customer) => {
    setEditCustomer({...customer});
    setSelectedCustomer(customer);
    
    // Initialize commercial information for active customers
    if (customer.status === 'active') {
      setCommercialInfo({
        monthly_revenue: customer.monthly_revenue || '',
        annual_revenue: customer.annual_revenue || '',
        contract_value: customer.contract_value || '',
        payment_terms: customer.payment_terms || '',
        billing_cycle: customer.billing_cycle || 'monthly',
        account_manager: customer.account_manager || '',
        success_manager: customer.success_manager || '',
        support_tier: customer.support_tier || 'standard',
        renewal_date: customer.renewal_date || '',
        upsell_opportunities: customer.upsell_opportunities || '',
        satisfaction_score: customer.satisfaction_score || '',
        usage_metrics: customer.usage_metrics || ''
      });
    } else {
      // Reset commercial info for non-active customers
      setCommercialInfo({
        monthly_revenue: '',
        annual_revenue: '',
        contract_value: '',
        payment_terms: '',
        billing_cycle: 'monthly',
        account_manager: '',
        success_manager: '',
        support_tier: 'standard',
        renewal_date: '',
        upsell_opportunities: '',
        satisfaction_score: '',
        usage_metrics: ''
      });
    }
    
    setShowEditModal(true);
  };

  const handleStartOnboarding = async (customerId) => {
    try {
      const response = await startCustomerOnboarding(customerId);
      if (response.success) {
        fetchCustomers();
        alert('Onboarding started successfully!');
      } else {
        setError(response.error || 'Failed to start onboarding');
      }
    } catch (err) {
      setError('Failed to start onboarding');
      console.error('Error starting onboarding:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = customerStatuses.find(s => s.value === status);
    return statusConfig || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customer Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {dashboardData && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.total_customers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.active_customers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Onboarding</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.customers_in_onboarding}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${dashboardData.overview.monthly_recurring_revenue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries(dashboardData.status_distribution || {}).map(([status, count]) => {
                  const statusConfig = getStatusBadge(status);
                  const percentage = (count / dashboardData.overview.total_customers) * 100;
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Onboarding Metrics */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Onboarding Time</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {dashboardData.onboarding.average_onboarding_time} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overdue Onboardings</span>
                  <span className="text-lg font-semibold text-red-600">
                    {dashboardData.onboarding.overdue_onboardings}
                  </span>
                </div>
                {Object.entries(dashboardData.onboarding.customers_by_stage || {}).map(([stage, count]) => (
                  <div key={stage} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{stage.replace('_', ' ')}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Customers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recent_customers.map((customer) => {
                    const statusConfig = getStatusBadge(customer.status);
                    return (
                      <tr key={customer.customer_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {customer.company_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(customer.created_date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Charts Section */}
          {chartLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow border">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : chartData && (
            <div className="space-y-6">
              {/* Customer Growth Trends */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center mb-4">
                  <Activity className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Growth Trends</h3>
                </div>
                {chartData.growthTrends && (
                  <div className="h-80">
                    <Line
                      data={{
                        labels: chartData.growthTrends.labels,
                        datasets: [
                          {
                            label: 'New Customers',
                            data: chartData.growthTrends.new_customers,
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4
                          },
                          {
                            label: 'Total Customers',
                            data: chartData.growthTrends.total_customers,
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.4
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Customer Growth Over Time'
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Revenue Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center mb-4">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">MRR Trends</h3>
                  </div>
                  {chartData.revenueAnalytics?.mrr_trends && (
                    <div className="h-64">
                      <Line
                        data={{
                          labels: chartData.revenueAnalytics.mrr_trends.labels,
                          datasets: [{
                            label: 'Monthly Recurring Revenue',
                            data: chartData.revenueAnalytics.mrr_trends.values,
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.4
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return '$' + value.toLocaleString();
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center mb-4">
                    <PieChart className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Revenue by Plan</h3>
                  </div>
                  {chartData.revenueAnalytics?.revenue_by_plan && (
                    <div className="h-64">
                      <Doughnut
                        data={{
                          labels: chartData.revenueAnalytics.revenue_by_plan.labels,
                          datasets: [{
                            data: chartData.revenueAnalytics.revenue_by_plan.values,
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(245, 158, 11, 0.8)',
                              'rgba(239, 68, 68, 0.8)',
                              'rgba(139, 92, 246, 0.8)'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((context.parsed * 100) / total).toFixed(1);
                                  return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Industry Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center mb-4">
                    <Briefcase className="w-5 h-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Industry Distribution</h3>
                  </div>
                  {chartData.industryInsights?.industry_distribution && (
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: chartData.industryInsights.industry_distribution.labels,
                          datasets: [{
                            label: 'Customers',
                            data: chartData.industryInsights.industry_distribution.values,
                            backgroundColor: 'rgba(99, 102, 241, 0.8)',
                            borderColor: 'rgba(99, 102, 241, 1)',
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                stepSize: 1
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center mb-4">
                    <Star className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Company Size Distribution</h3>
                  </div>
                  {chartData.industryInsights?.company_size_distribution && (
                    <div className="h-64">
                      <Pie
                        data={{
                          labels: chartData.industryInsights.company_size_distribution.labels,
                          datasets: [{
                            data: chartData.industryInsights.company_size_distribution.values,
                            backgroundColor: [
                              'rgba(34, 197, 94, 0.8)',
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(245, 158, 11, 0.8)',
                              'rgba(239, 68, 68, 0.8)'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((context.parsed * 100) / total).toFixed(1);
                                  return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Health Metrics */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center mb-4">
                  <Heart className="w-5 h-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Health Score Distribution</h3>
                </div>
                {chartData.healthMetrics?.health_score_distribution && (
                  <div className="h-80">
                    <Bar
                      data={{
                        labels: chartData.healthMetrics.health_score_distribution.labels,
                        datasets: [{
                          label: 'Number of Customers',
                          data: chartData.healthMetrics.health_score_distribution.values,
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',   // Poor
                            'rgba(245, 158, 11, 0.8)',  // Fair
                            'rgba(59, 130, 246, 0.8)',  // Good
                            'rgba(16, 185, 129, 0.8)'   // Excellent
                          ],
                          borderColor: [
                            'rgba(239, 68, 68, 1)',
                            'rgba(245, 158, 11, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(16, 185, 129, 1)'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed.y * 100) / total).toFixed(1);
                                return `${context.parsed.y} customers (${percentage}%)`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const CustomersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {customerStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => {
                const statusConfig = getStatusBadge(customer.status);
                return (
                  <tr key={customer.customer_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.company_name}</div>
                          <div className="text-sm text-gray-500">{customer.industry}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.contact_person}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {customer.customer_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.created_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Customer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(customer)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {customer.status === 'contract_signed' && (
                          <button
                            onClick={() => handleStartOnboarding(customer.customer_id)}
                            className="text-green-600 hover:text-green-900"
                            title="Start Onboarding"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * pagination.per_page) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pagination.per_page, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="mt-2 text-gray-600">Manage customer onboarding and track business growth</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Customers
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && activeTab === 'dashboard' && <DashboardTab />}
        {!loading && activeTab === 'customers' && <CustomersTab />}

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Customer</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
                <form onSubmit={handleAddCustomer} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCustomer.company_name}
                        onChange={(e) => setNewCustomer({...newCustomer, company_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCustomer.contact_person}
                        onChange={(e) => setNewCustomer({...newCustomer, contact_person: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={newCustomer.website}
                        onChange={(e) => setNewCustomer({...newCustomer, website: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={newCustomer.industry}
                        onChange={(e) => setNewCustomer({...newCustomer, industry: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Size
                      </label>
                      <input
                        type="text"
                        value={newCustomer.company_size}
                        onChange={(e) => setNewCustomer({...newCustomer, company_size: e.target.value})}
                        placeholder="e.g., 50-100 employees"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Type
                      </label>
                      <select
                        value={newCustomer.customer_type}
                        onChange={(e) => setNewCustomer({...newCustomer, customer_type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {customerTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Source
                    </label>
                    <input
                      type="text"
                      value={newCustomer.lead_source}
                      onChange={(e) => setNewCustomer({...newCustomer, lead_source: e.target.value})}
                      placeholder="e.g., Website, Referral, Cold Call"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Commercial Information Section - Only for Active Customers */}
                  {editCustomer.status === 'active' && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center mb-6">
                        <BarChart3 className="w-6 h-6 text-emerald-600 mr-3" />
                        <h4 className="text-xl font-semibold text-emerald-800">Commercial Information</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <h5 className="font-medium text-emerald-700 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Revenue & Financials
                          </h5>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Monthly Revenue ($)
                            </label>
                            <input
                              type="number"
                              value={commercialInfo.monthly_revenue}
                              onChange={(e) => setCommercialInfo({...commercialInfo, monthly_revenue: e.target.value})}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="5000"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Annual Revenue ($)
                            </label>
                            <input
                              type="number"
                              value={commercialInfo.annual_revenue}
                              onChange={(e) => setCommercialInfo({...commercialInfo, annual_revenue: e.target.value})}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="60000"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Contract Value ($)
                            </label>
                            <input
                              type="number"
                              value={commercialInfo.contract_value}
                              onChange={(e) => setCommercialInfo({...commercialInfo, contract_value: e.target.value})}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="120000"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="font-medium text-emerald-700 flex items-center">
                            <Target className="w-4 h-4 mr-2" />
                            Account Management
                          </h5>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Payment Terms
                            </label>
                            <input
                              type="text"
                              value={commercialInfo.payment_terms}
                              onChange={(e) => setCommercialInfo({...commercialInfo, payment_terms: e.target.value})}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Net 30"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Billing Cycle
                            </label>
                            <select
                              value={commercialInfo.billing_cycle}
                              onChange={(e) => setCommercialInfo({...commercialInfo, billing_cycle: e.target.value})}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="annually">Annually</option>
                              <option value="custom">Custom</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Account Manager
                            </label>
                            <input
                              type="text"
                              value={commercialInfo.account_manager}
                              onChange={(e) => setCommercialInfo({...commercialInfo, account_manager: e.target.value})}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="John Smith"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Success Manager
                            </label>
                            <input
                              type="text"
                              value={commercialInfo.success_manager}
                              onChange={(e) => setCommercialInfo({...commercialInfo, success_manager: e.target.value})}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Jane Doe"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="font-medium text-emerald-700 flex items-center">
                            <Award className="w-4 h-4 mr-2" />
                            Performance & Growth
                          </h5>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Support Tier
                            </label>
                            <select
                              value={commercialInfo.support_tier}
                              onChange={(e) => setCommercialInfo({...commercialInfo, support_tier: e.target.value})}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="basic">Basic</option>
                              <option value="standard">Standard</option>
                              <option value="premium">Premium</option>
                              <option value="enterprise">Enterprise</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Renewal Date
                            </label>
                            <input
                              type="date"
                              value={commercialInfo.renewal_date}
                              onChange={(e) => setCommercialInfo({...commercialInfo, renewal_date: e.target.value})}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Satisfaction Score (1-10)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={commercialInfo.satisfaction_score}
                              onChange={(e) => setCommercialInfo({...commercialInfo, satisfaction_score: e.target.value})}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="8"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Upsell Opportunities
                            </label>
                            <textarea
                              value={commercialInfo.upsell_opportunities}
                              onChange={(e) => setCommercialInfo({...commercialInfo, upsell_opportunities: e.target.value})}
                              rows={2}
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Additional modules, premium features..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Workflow & Lifecycle Display */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center mb-6">
                      <ArrowRight className="w-6 h-6 text-blue-600 mr-3" />
                      <h4 className="text-xl font-semibold text-blue-800">Customer Journey & Workflow</h4>
                    </div>
                    
                    {/* Status Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">Current Status Progress</span>
                        <span className="text-sm text-blue-600">{getStatusBadge(editCustomer.status).label}</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, (customerStatuses.findIndex(s => s.value === editCustomer.status) + 1) / customerStatuses.length * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customerStatuses.slice(0, 9).map((status, index) => {
                        const isCurrentStatus = editCustomer.status === status.value;
                        const isPastStatus = customerStatuses.findIndex(s => s.value === editCustomer.status) > index;
                        const isFutureStatus = customerStatuses.findIndex(s => s.value === editCustomer.status) < index;
                        
                        return (
                          <div 
                            key={status.value}
                            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                              isCurrentStatus 
                                ? 'border-blue-500 bg-blue-100 shadow-lg transform scale-105' 
                                : isPastStatus 
                                  ? 'border-green-300 bg-green-50' 
                                  : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-3 ${
                                  isCurrentStatus 
                                    ? 'bg-blue-500 animate-pulse' 
                                    : isPastStatus 
                                      ? 'bg-green-500' 
                                      : 'bg-gray-300'
                                }`}></div>
                                <span className={`text-sm font-medium ${
                                  isCurrentStatus ? 'text-blue-800' : isPastStatus ? 'text-green-700' : 'text-gray-600'
                                }`}>
                                  {status.label}
                                </span>
                              </div>
                              {isCurrentStatus && (
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                              )}
                              {isPastStatus && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Key Metrics for Active Customers */}
                    {editCustomer.status === 'active' && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                            <div>
                              <p className="text-xs text-gray-600">Customer Since</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {editCustomer.created_at ? formatDate(editCustomer.created_at) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                          <div className="flex items-center">
                            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                            <div>
                              <p className="text-xs text-gray-600">Monthly Value</p>
                              <p className="text-sm font-semibold text-gray-900">
                                ${commercialInfo.monthly_revenue || '0'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                          <div className="flex items-center">
                            <Award className="w-5 h-5 text-purple-500 mr-2" />
                            <div>
                              <p className="text-xs text-gray-600">Support Tier</p>
                              <p className="text-sm font-semibold text-gray-900 capitalize">
                                {commercialInfo.support_tier || 'Standard'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                          <div className="flex items-center">
                            <Target className="w-5 h-5 text-orange-500 mr-2" />
                            <div>
                              <p className="text-xs text-gray-600">Satisfaction</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {commercialInfo.satisfaction_score ? `${commercialInfo.satisfaction_score}/10` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Customer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced View Customer Details Modal */}
        {showDetailsModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
            <div className="relative top-8 mx-auto p-0 w-11/12 max-w-6xl shadow-2xl rounded-2xl bg-white overflow-hidden">
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedCustomer.company_name}</h3>
                      <p className="text-blue-100">{selectedCustomer.contact_person}</p>
                      <div className="flex items-center mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedCustomer.status).color} bg-white bg-opacity-90`}>
                          {getStatusBadge(selectedCustomer.status).label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedCustomer(null);
                    }}
                    className="text-white hover:text-gray-200 bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all duration-200"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 space-y-8">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center">
                      <Mail className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Contact</p>
                        <p className="text-sm font-semibold text-blue-900 truncate">{selectedCustomer.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center">
                      <Phone className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Phone</p>
                        <p className="text-sm font-semibold text-green-900">{selectedCustomer.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center">
                      <Globe className="w-8 h-8 text-purple-600 mr-3" />
                      <div>
                        <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Website</p>
                        <p className="text-sm font-semibold text-purple-900 truncate">{selectedCustomer.website || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center">
                      <Calendar className="w-8 h-8 text-orange-600 mr-3" />
                      <div>
                        <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">Customer Since</p>
                        <p className="text-sm font-semibold text-orange-900">{formatDate(selectedCustomer.created_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Company Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center mb-6">
                      <Building className="w-6 h-6 text-gray-600 mr-3" />
                      <h4 className="text-xl font-semibold text-gray-800">Company Information</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Industry</span>
                        <span className="text-sm text-gray-900 font-semibold">{selectedCustomer.industry || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Company Size</span>
                        <span className="text-sm text-gray-900 font-semibold">{selectedCustomer.company_size || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Customer Type</span>
                        <span className="text-sm text-gray-900 font-semibold capitalize">{selectedCustomer.customer_type}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm font-medium text-gray-600">Lead Source</span>
                        <span className="text-sm text-gray-900 font-semibold">{selectedCustomer.lead_source || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Management */}
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
                    <div className="flex items-center mb-6">
                      <User className="w-6 h-6 text-indigo-600 mr-3" />
                      <h4 className="text-xl font-semibold text-indigo-800">Account Management</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-indigo-200">
                        <span className="text-sm font-medium text-indigo-600">Assigned Sales Rep</span>
                        <span className="text-sm text-indigo-900 font-semibold">{selectedCustomer.assigned_sales_rep || 'Not assigned'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-indigo-200">
                        <span className="text-sm font-medium text-indigo-600">Last Updated</span>
                        <span className="text-sm text-indigo-900 font-semibold">{formatDate(selectedCustomer.last_updated)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm font-medium text-indigo-600">Customer ID</span>
                        <span className="text-sm text-indigo-900 font-semibold">#{selectedCustomer.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Journey Timeline */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                  <div className="flex items-center mb-6">
                    <ArrowRight className="w-6 h-6 text-emerald-600 mr-3" />
                    <h4 className="text-xl font-semibold text-emerald-800">Customer Journey</h4>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-700">Current Progress</span>
                      <span className="text-sm text-emerald-600 font-semibold">{getStatusBadge(selectedCustomer.status).label}</span>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, (customerStatuses.findIndex(s => s.value === selectedCustomer.status) + 1) / customerStatuses.length * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {customerStatuses.slice(0, 10).map((status, index) => {
                      const isCurrentStatus = selectedCustomer.status === status.value;
                      const isPastStatus = customerStatuses.findIndex(s => s.value === selectedCustomer.status) > index;
                      
                      return (
                        <div 
                          key={status.value}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                            isCurrentStatus 
                              ? 'border-emerald-500 bg-emerald-200 shadow-lg' 
                              : isPastStatus 
                                ? 'border-green-300 bg-green-100' 
                                : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              isCurrentStatus 
                                ? 'bg-emerald-500 animate-pulse' 
                                : isPastStatus 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                            }`}></div>
                            <span className={`text-xs font-medium ${
                              isCurrentStatus ? 'text-emerald-800' : isPastStatus ? 'text-green-700' : 'text-gray-600'
                            }`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes Section */}
                {selectedCustomer.notes && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                    <div className="flex items-center mb-4">
                      <FileText className="w-6 h-6 text-amber-600 mr-3" />
                      <h4 className="text-xl font-semibold text-amber-800">Notes & Comments</h4>
                    </div>
                    <p className="text-amber-900 leading-relaxed">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openEditModal(selectedCustomer);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Customer</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedCustomer(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Edit Customer Modal */}
        {showEditModal && editCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
            <div className="relative top-4 mx-auto p-0 w-11/12 max-w-7xl shadow-2xl rounded-2xl bg-white overflow-hidden">
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Edit Customer</h3>
                      <p className="text-blue-100">{editCustomer.company_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditCustomer({});
                      setSelectedCustomer(null);
                    }}
                    className="text-white hover:text-gray-200 bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30 transition-all duration-200"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleEditCustomer} className="p-8 space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center mb-6">
                    <Building className="w-6 h-6 text-blue-600 mr-3" />
                    <h4 className="text-xl font-semibold text-blue-800">Basic Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">
                        Company Name *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
                        <input
                          type="text"
                          required
                          value={editCustomer.company_name || ''}
                          onChange={(e) => setEditCustomer({...editCustomer, company_name: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter company name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">
                        Contact Person *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
                        <input
                          type="text"
                          required
                          value={editCustomer.contact_person || ''}
                          onChange={(e) => setEditCustomer({...editCustomer, contact_person: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter contact person name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
                        <input
                          type="email"
                          required
                          value={editCustomer.email || ''}
                          onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
                        <input
                          type="tel"
                          value={editCustomer.phone || ''}
                          onChange={(e) => setEditCustomer({...editCustomer, phone: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
                        <input
                          type="url"
                          value={editCustomer.website || ''}
                          onChange={(e) => setEditCustomer({...editCustomer, website: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={editCustomer.industry || ''}
                        onChange={(e) => setEditCustomer({...editCustomer, industry: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Technology, Healthcare, Finance"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Details Section */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center mb-6">
                    <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
                    <h4 className="text-xl font-semibold text-purple-800">Business Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-purple-700 mb-2">
                        Company Size
                      </label>
                      <input
                        type="text"
                        value={editCustomer.company_size || ''}
                        onChange={(e) => setEditCustomer({...editCustomer, company_size: e.target.value})}
                        placeholder="e.g., 1-10, 11-50, 51-200"
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-purple-700 mb-2">
                        Customer Type
                      </label>
                      <select
                        value={editCustomer.customer_type || 'sme'}
                        onChange={(e) => setEditCustomer({...editCustomer, customer_type: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      >
                        {customerTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-purple-700 mb-2">
                        Status
                      </label>
                      <select
                        value={editCustomer.status || 'inquiry'}
                        onChange={(e) => setEditCustomer({...editCustomer, status: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      >
                        {customerStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-purple-700 mb-2">
                        Lead Source
                      </label>
                      <input
                        type="text"
                        value={editCustomer.lead_source || ''}
                        onChange={(e) => setEditCustomer({...editCustomer, lead_source: e.target.value})}
                        placeholder="e.g., Website, Referral, Cold Call"
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Commercial Information Section - Only for Active Customers */}
                {editCustomer.status === 'active' && (
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                    <div className="flex items-center mb-6">
                      <TrendingUp className="w-6 h-6 text-emerald-600 mr-3" />
                      <h4 className="text-xl font-semibold text-emerald-800">Commercial Information</h4>
                      <span className="ml-3 px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-semibold rounded-full">
                        Active Customer
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-emerald-700 mb-2">
                          Monthly Revenue
                        </label>
                        <input
                          type="number"
                          value={commercialInfo.monthly_revenue}
                          onChange={(e) => setCommercialInfo({...commercialInfo, monthly_revenue: e.target.value})}
                          placeholder="0.00"
                          className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-emerald-700 mb-2">
                          Annual Revenue
                        </label>
                        <input
                          type="number"
                          value={commercialInfo.annual_revenue}
                          onChange={(e) => setCommercialInfo({...commercialInfo, annual_revenue: e.target.value})}
                          placeholder="0.00"
                          className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-emerald-700 mb-2">
                          Contract Value
                        </label>
                        <input
                          type="number"
                          value={commercialInfo.contract_value}
                          onChange={(e) => setCommercialInfo({...commercialInfo, contract_value: e.target.value})}
                          placeholder="0.00"
                          className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-emerald-700 mb-2">
                          Account Manager
                        </label>
                        <input
                          type="text"
                          value={commercialInfo.account_manager}
                          onChange={(e) => setCommercialInfo({...commercialInfo, account_manager: e.target.value})}
                          placeholder="Enter account manager name"
                          className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-emerald-700 mb-2">
                          Success Manager
                        </label>
                        <input
                          type="text"
                          value={commercialInfo.success_manager}
                          onChange={(e) => setCommercialInfo({...commercialInfo, success_manager: e.target.value})}
                          placeholder="Enter success manager name"
                          className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-emerald-700 mb-2">
                          Support Tier
                        </label>
                        <select
                          value={commercialInfo.support_tier}
                          onChange={(e) => setCommercialInfo({...commercialInfo, support_tier: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="basic">Basic</option>
                          <option value="standard">Standard</option>
                          <option value="premium">Premium</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Workflow & Lifecycle Display */}
                {editCustomer.status === 'active' && (
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
                    <div className="flex items-center mb-6">
                      <Target className="w-6 h-6 text-indigo-600 mr-3" />
                      <h4 className="text-xl font-semibold text-indigo-800">Customer Journey & Performance</h4>
                    </div>
                    
                    {/* Status Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-indigo-700">Journey Progress</span>
                        <span className="text-sm text-indigo-600 font-semibold">{getStatusBadge(editCustomer.status).label}</span>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ 
                            width: `${Math.min(100, (customerStatuses.findIndex(s => s.value === editCustomer.status) + 1) / customerStatuses.length * 100)}%` 
                          }}
                        >
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center">
                          <Award className="w-5 h-5 text-indigo-600 mr-2" />
                          <span className="text-sm font-medium text-indigo-700">Customer Since</span>
                        </div>
                        <p className="text-lg font-bold text-indigo-900 mt-1">{formatDate(editCustomer.created_date)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                          <span className="text-sm font-medium text-indigo-700">Last Updated</span>
                        </div>
                        <p className="text-lg font-bold text-indigo-900 mt-1">{formatDate(editCustomer.last_updated)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-indigo-600 mr-2" />
                          <span className="text-sm font-medium text-indigo-700">Customer ID</span>
                        </div>
                        <p className="text-lg font-bold text-indigo-900 mt-1">#{editCustomer.id}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-amber-600 mr-3" />
                    <h4 className="text-xl font-semibold text-amber-800">Notes & Comments</h4>
                  </div>
                  <textarea
                    value={editCustomer.notes || ''}
                    onChange={(e) => setEditCustomer({...editCustomer, notes: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="Add any additional notes or comments about this customer..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 -mx-8 -mb-8 px-8 py-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditCustomer({});
                        setSelectedCustomer(null);
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Update Customer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOnboarding;