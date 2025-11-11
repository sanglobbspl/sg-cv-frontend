import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, TrendingUp, Calendar, Award, Clock, Target, MapPin, DollarSign, Star, Briefcase, CheckCircle, XCircle, AlertTriangle, UserCheck, ArrowRight, Timer, Search, Filter, Eye, Download, Phone, Mail, Building, PieChart, CreditCard, Activity } from 'lucide-react';
import { api } from '../api';
import RealTimeCharts from './RealTimeCharts';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Candidate Filter Section Component
const CandidateFilterSection = ({ onNavigateToList, activeFilter, triggerSearch }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showResults, setShowResults] = useState(false);

  // Respond to metric clicks from dashboard
  useEffect(() => {
    if (activeFilter && triggerSearch > 0) {
      setSelectedFilter(activeFilter);
      setShowResults(true); // Show results section
      // Trigger search automatically
      setTimeout(() => {
        fetchFilteredCandidates();
      }, 100);
    }
  }, [activeFilter, triggerSearch]);



  const statusOptions = [
    { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { value: 'screening', label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'interview_scheduled', label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800' },
    { value: 'interviewed', label: 'Interviewed', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'offer_released', label: 'Offer Released', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'onboarded', label: 'Onboarded', color: 'bg-teal-100 text-teal-800' }
  ];

  const fetchFilteredCandidates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: '1',
        per_page: '1000' // Get all results, not just 10
      };
      
      // Add status parameter for status-based filtering
      if (selectedFilter && selectedFilter !== 'all') {
        params.status = selectedFilter;
      }
      
      const data = await api.getCandidatesList(params);
      
      if (data.success) {
        const filteredCandidates = data.data || [];
        setCandidates(filteredCandidates);
        setShowResults(true);
      } else {
        setError(data.error || 'Failed to fetch candidates');
      }
    } catch (err) {
      setError('Failed to fetch candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };



  const getStatusStyle = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.label : status;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Search className="h-6 w-6 mr-3 text-blue-600" />
          Search Results
        </h3>
        {showResults && (
          <button
            onClick={() => onNavigateToList && onNavigateToList(selectedFilter)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Results Display */}
      {showResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-xl border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Found {candidates?.length || 0} candidates
            </h4>
            {candidates?.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filter: {selectedFilter}</span>
              </div>
            )}
          </div>
          
          {!candidates || candidates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidates?.map((candidate, index) => (
                      <tr key={candidate.id || candidate['Resume ID'] || candidate.email || `candidate-${index}`} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {candidate.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              {candidate.current_designation || candidate.applied_role || 'Not specified'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-xs text-gray-600">
                              <Mail className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="truncate font-medium">{candidate.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <Phone className="w-4 h-4 mr-2 text-green-500" />
                              <span className="font-medium">{candidate.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-red-500" />
                              <span className="truncate font-medium">{candidate.current_location || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            {candidate.total_experience || 0} years
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            {candidate.relevant_experience || 0} years relevant
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(candidate.status)}`}>
                            {getStatusLabel(candidate.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200">
                              <Eye className="w-4 h-4" />
                            </button>
                            {candidate.resume_path && (
                              <a
                                href={`/api/candidates/${candidate.id}/resume`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {candidates?.map((candidate, index) => (
                  <div key={candidate.id || candidate['Resume ID'] || candidate.email || `candidate-${index}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          {candidate.name || 'N/A'}
                        </h4>
                        <p className="text-sm text-gray-600 font-medium">
                          {candidate.current_designation || candidate.applied_role || 'Not specified'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(candidate.status)}`}>
                        {getStatusLabel(candidate.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="font-medium">{candidate.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-3 text-green-500" />
                        <span className="font-medium">{candidate.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-3 text-red-500" />
                        <span className="font-medium">{candidate.current_location || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-3 text-purple-500" />
                        <span className="font-medium">{candidate.total_experience || 0} years total, {candidate.relevant_experience || 0} years relevant</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                      <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </button>
                      {candidate.resume_path && (
                        <a
                          href={`/api/candidates/${candidate.id}/resume`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Resume
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ onNavigateToList }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [triggerSearch, setTriggerSearch] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceData, setPerformanceData] = useState(null);
  const [perfLoading, setPerfLoading] = useState(false);
  const [perfError, setPerfError] = useState(null);
  const [goalsAssignments, setGoalsAssignments] = useState([]);
  const [goalsSummary, setGoalsSummary] = useState({ total: 0, byStatus: {}, byPriority: {} });

  useEffect(() => {
    if (activeTab !== 'performance') return;
    setPerfLoading(true);
    setPerfError(null);
    api.getPerformanceAnalytics()
      .then((resp) => {
        setPerformanceData(resp?.data ?? resp ?? null);
      })
      .catch((err) => {
        setPerfError(err?.message || 'Failed to load performance analytics');
      })
      .finally(() => setPerfLoading(false));
  }, [activeTab]);

  // Load goals assignments for performance analytics tab
  useEffect(() => {
    if (activeTab !== 'performance') return;
    try {
      const raw = localStorage.getItem('employee_goals_assignments');
      const list = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(list) ? list : [];
      setGoalsAssignments(arr);
      const byStatus = arr.reduce((acc, g) => {
        const s = (g.status || 'assigned').toLowerCase();
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});
      const byPriority = arr.reduce((acc, g) => {
        const p = (g.priority || 'medium').toLowerCase();
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      }, {});
      setGoalsSummary({ total: arr.length, byStatus, byPriority });
    } catch (_) {
      setGoalsAssignments([]);
      setGoalsSummary({ total: 0, byStatus: {}, byPriority: {} });
    }
  }, [activeTab]);

  // Handle metric card clicks to filter candidates in dashboard
  const handleMetricClick = (filterType) => {
    setActiveFilter(filterType);
    setTriggerSearch(prev => prev + 1);
  };

  // Fetch comprehensive recruitment analytics including approval process
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await api.getDashboardData();
        
        if (result && result.data) {
          setDashboardData(result.data);
        } else if (result) {
          // Try to use the result directly if it contains data
          setDashboardData(result);
        } else {
          setError('Invalid response format from server');
        }
      } catch (error) {
        setError(`Error loading dashboard data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use real data or fallback to empty arrays
  const data = dashboardData || {
    totalCandidates: 0,
    activeApplications: 0,
    interviewsScheduled: 0,
    hiredThisMonth: 0,
    candidatesBySkill: [],
    applicationsByMonth: [],
    experienceDistribution: [],
    locationDistribution: [],
    recentActivities: [],
    interviewSuccess: [],
    salaryRanges: [],
    // Approval process data
    total_approvals: 0,
    approvals_by_decision: {},
    approval_pipeline: {
      pending_approvals: [],
      approval_hierarchy: {
        hr: { pending: 0, approved: 0, rejected: 0 },
        manager: { pending: 0, approved: 0, rejected: 0 },
        director: { pending: 0, approved: 0, rejected: 0 }
      },
      approval_timeline: [],
      bottlenecks: []
    },
    stage_flow: {},
    conversion_rates: {}
  };

  const StatCard = ({ icon: Icon, title, value, change, changeType, prefix = '', suffix = '', onClick, color = 'blue' }) => {
    const colorClasses = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-200',
        hover: 'hover:from-blue-100 hover:to-blue-200 hover:border-blue-300',
        icon: 'bg-blue-500 text-white',
        text: 'text-blue-700',
        value: 'text-blue-900'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-200',
        hover: 'hover:from-green-100 hover:to-green-200 hover:border-green-300',
        icon: 'bg-green-500 text-white',
        text: 'text-green-700',
        value: 'text-green-900'
      },
      yellow: {
        bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
        border: 'border-yellow-200',
        hover: 'hover:from-yellow-100 hover:to-yellow-200 hover:border-yellow-300',
        icon: 'bg-yellow-500 text-white',
        text: 'text-yellow-700',
        value: 'text-yellow-900'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-200',
        hover: 'hover:from-orange-100 hover:to-orange-200 hover:border-orange-300',
        icon: 'bg-orange-500 text-white',
        text: 'text-orange-700',
        value: 'text-orange-900'
      },
      red: {
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-200',
        hover: 'hover:from-red-100 hover:to-red-200 hover:border-red-300',
        icon: 'bg-red-500 text-white',
        text: 'text-red-700',
        value: 'text-red-900'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        border: 'border-purple-200',
        hover: 'hover:from-purple-100 hover:to-purple-200 hover:border-purple-300',
        icon: 'bg-purple-500 text-white',
        text: 'text-purple-700',
        value: 'text-purple-900'
      },
      indigo: {
        bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
        border: 'border-indigo-200',
        hover: 'hover:from-indigo-100 hover:to-indigo-200 hover:border-indigo-300',
        icon: 'bg-indigo-500 text-white',
        text: 'text-indigo-700',
        value: 'text-indigo-900'
      }
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
      <div 
        className={`${colors.bg} rounded-xl shadow-lg border ${colors.border} p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
          onClick ? `cursor-pointer ${colors.hover}` : ''
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <div className={`p-3 rounded-lg ${colors.icon} shadow-md`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <p className={`text-sm font-semibold ${colors.text} mb-2`}>{title}</p>
            <p className={`text-3xl font-bold ${colors.value} leading-none`}>
              {prefix}{value.toLocaleString()}{suffix}
            </p>
            {change && (
              <div className="flex items-center mt-3">
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  changeType === 'positive' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <TrendingUp className={`h-3 w-3 mr-1 ${
                    changeType === 'positive' ? 'text-green-600' : 'text-red-600 transform rotate-180'
                  }`} />
                  {changeType === 'positive' ? '+' : ''}{change}%
                </div>
                <span className="text-xs text-gray-500 ml-2">vs last month</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CompactBarChart = ({ data, title, dataKey = 'count' }) => {
    const colors = [
      'bg-gradient-to-r from-blue-400 to-blue-600',
      'bg-gradient-to-r from-green-400 to-green-600',
      'bg-gradient-to-r from-yellow-400 to-yellow-600',
      'bg-gradient-to-r from-red-400 to-red-600',
      'bg-gradient-to-r from-purple-400 to-purple-600',
      'bg-gradient-to-r from-indigo-400 to-indigo-600',
      'bg-gradient-to-r from-pink-400 to-pink-600',
      'bg-gradient-to-r from-orange-400 to-orange-600'
    ];

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-80 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-3 h-60 overflow-y-auto pr-2">
          {data && data.length > 0 ? data.map((item, index) => (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 truncate max-w-20">
                  {item.skill || item.month || item.range || item.stage}
                </span>
                <span className="text-xs font-bold text-gray-900">{item[dataKey]}</span>
              </div>
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-700 ease-out group-hover:scale-105 ${colors[index % colors.length]}`}
                  style={{ width: `${(item[dataKey] / Math.max(...data.map(d => d[dataKey]))) * 100}%` }}
                ></div>
              </div>
            </div>
          )) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs">No data available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CompactPieChart = ({ data, title }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-80 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center justify-center h-60 text-gray-400">
            <div className="text-center">
              <PieChart className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">No data available</p>
            </div>
          </div>
        </div>
      );
    }

    const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
    
    // Return early if total is 0 to avoid division by zero
    if (total === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-80 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center justify-center h-60 text-gray-400">
            <div className="text-center">
              <PieChart className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">No data available</p>
            </div>
          </div>
        </div>
      );
    }
    
    let cumulativePercentage = 0;
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-80 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center mb-4">
          <PieChart className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
        <div className="flex flex-col items-center h-60">
          {/* Pie Chart */}
          <div className="relative w-36 h-36 mb-4 group">
            <svg className="w-36 h-36 transform -rotate-90 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const count = item.count || 0;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const strokeDasharray = `${percentage.toFixed(2)} ${(100 - percentage).toFixed(2)}`;
                const strokeDashoffset = cumulativePercentage > 0 ? -cumulativePercentage.toFixed(2) : 0;
                cumulativePercentage += percentage;
                
                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];
                
                // Skip rendering if percentage is 0 or invalid
                if (percentage <= 0 || !isFinite(percentage)) {
                  return null;
                }
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="15.915"
                    fill="transparent"
                    stroke={colors[index % colors.length]}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 hover:stroke-[10] cursor-pointer"
                    strokeLinecap="round"
                  />
                );
              }).filter(Boolean)}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
          
          {/* Legends - Scrollable */}
          <div className="w-full max-h-28 overflow-y-auto pr-2">
            <div className="space-y-2">
              {data.map((item, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-lime-500'];
                const percentage = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center justify-between text-xs hover:bg-gray-50 p-1 rounded transition-colors">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2 flex-shrink-0 shadow-sm`}></div>
                      <span className="text-gray-700 truncate font-medium">{item.level || item.location}</span>
                    </div>
                    <div className="flex items-center ml-2 flex-shrink-0">
                      <span className="font-bold text-gray-900 mr-1">{item.count}</span>
                      <span className="text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Approval Pipeline Component
  const ApprovalPipeline = ({ approvalData }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-80">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
        <UserCheck className="h-4 w-4 mr-2" />
        Approval Pipeline
      </h3>
      <div className="h-64 overflow-y-auto pr-2">
        {approvalData?.pending_approvals?.length > 0 ? (
          <div className="space-y-2">
            {approvalData?.pending_approvals?.map((approval, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-900 truncate">
                    {approval.candidate_name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    approval.days_pending > 10 ? 'bg-red-100 text-red-800' :
                    approval.days_pending > 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {approval.days_pending} days
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Level {approval.hierarchy_level}</span>
                  <span className="capitalize">{approval.approver_role}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  Approver: {approval.approver_name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            No pending approvals
          </div>
        )}
      </div>
    </div>
  );

  // Approval Hierarchy Status Component
  const ApprovalHierarchy = ({ hierarchyData }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-80">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
        <Target className="h-4 w-4 mr-2" />
        Approval Hierarchy Status
      </h3>
      <div className="space-y-4 h-64 overflow-y-auto pr-2">
        {Object.entries(hierarchyData).map(([role, stats]) => (
          <div key={role} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 capitalize">{role}</span>
              <span className="text-xs text-gray-500">
                Total: {stats.pending + stats.approved + stats.rejected}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-bold text-yellow-800">{stats.pending}</div>
                <div className="text-yellow-600">Pending</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-bold text-green-800">{stats.approved}</div>
                <div className="text-green-600">Approved</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-bold text-red-800">{stats.rejected}</div>
                <div className="text-red-600">Rejected</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Bottlenecks Component
  const ApprovalBottlenecks = ({ bottlenecks }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-80">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
        Approval Bottlenecks
      </h3>
      <div className="h-64 overflow-y-auto pr-2">
        {bottlenecks?.length > 0 ? (
          <div className="space-y-2">
            {bottlenecks?.map((bottleneck, index) => (
              <div key={index} className={`border rounded-lg p-3 ${
                bottleneck.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-900">
                    {bottleneck.candidate_id}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    bottleneck.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bottleneck.severity}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  Stuck at: {bottleneck.approver_role} ({bottleneck.approver_name})
                </div>
                <div className="text-xs text-gray-500">
                  {bottleneck.days_pending} days pending
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            No bottlenecks detected
          </div>
        )}
      </div>
    </div>
  );

  // Approval Hierarchy Status Component
  const ApprovalHierarchyStatus = ({ data }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-80">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
        <UserCheck className="h-4 w-4 mr-2" />
        Approval Hierarchy Status
      </h3>
      <div className="h-64 overflow-y-auto pr-2">
        {data && data.length > 0 ? (
          <div className="space-y-2">
            {data.map((level, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-900">
                    Level {level.level}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    level.status === 'active' ? 'bg-green-100 text-green-800' :
                    level.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {level.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  Role: {level.role}
                </div>
                <div className="text-xs text-gray-500">
                  Approver: {level.approver_name || 'Not assigned'}
                </div>
                {level.pending_count > 0 && (
                  <div className="text-xs text-orange-600 mt-1">
                    {level.pending_count} pending approvals
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            <UserCheck className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            No hierarchy data available
          </div>
        )}
      </div>
    </div>
  );

  // Recruitment Stage Flow Component
  const RecruitmentStageFlow = ({ stageFlow }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-80">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
        <ArrowRight className="h-4 w-4 mr-2" />
        Recruitment Stage Flow
      </h3>
      <div className="h-64 overflow-y-auto pr-2">
        <div className="space-y-2">
          {Object.entries(stageFlow || {}).map(([stage, count], index) => {
            const stageLabels = {
              applied: 'Applied',
              shortlisted: 'Shortlisted',
              interview_scheduled: 'Interview Scheduled',
              interviewed: 'Interviewed',
              approved: 'Approved',
              offer_sent: 'Offer Sent',
              offer_accepted: 'Offer Accepted',
              onboarding: 'Onboarding',
              onboarded: 'Onboarded',
              rejected: 'Rejected'
            };
            
            const stageColors = {
              applied: 'bg-blue-100 text-blue-800',
              shortlisted: 'bg-indigo-100 text-indigo-800',
              interview_scheduled: 'bg-purple-100 text-purple-800',
              interviewed: 'bg-pink-100 text-pink-800',
              approved: 'bg-green-100 text-green-800',
              offer_sent: 'bg-yellow-100 text-yellow-800',
              offer_accepted: 'bg-emerald-100 text-emerald-800',
              onboarding: 'bg-teal-100 text-teal-800',
              onboarded: 'bg-cyan-100 text-cyan-800',
              rejected: 'bg-red-100 text-red-800'
            };
            
            return (
              <div key={stage} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <span className="text-xs font-medium text-gray-900">
                  {stageLabels[stage] || stage}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${stageColors[stage] || 'bg-gray-100 text-gray-800'}`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">Real-time insights from Excel data sources</p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
        
        {/* Tab Navigation */}
      <div className="mt-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'charts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Real-Time Charts
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'performance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Performance Analytics
          </button>
        </nav>
      </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
        {/* Key Metrics Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          <StatCard 
            title="Total Candidates" 
            value={data.total_candidates || data.totalCandidates || 0} 
            icon={Users} 
            color="blue" 
            change={12}
            changeType="positive"
            onClick={() => handleMetricClick('all')}
          />
          <StatCard 
            title="Active Applications" 
            value={data.activeApplications || 0} 
            icon={FileText} 
            color="green" 
            change={8}
            changeType="positive"
            onClick={() => handleMetricClick('active')}
          />
          <StatCard 
            title="Interviews Scheduled" 
            value={data.total_interviews || data.interviewsScheduled || 0} 
            icon={Calendar} 
            color="yellow" 
            change={-5}
            changeType="negative"
            onClick={() => handleMetricClick('interviews')}
          />
          <StatCard 
            title="Pending Approvals" 
            value={data.approval_pipeline?.pending_approvals?.length || 0} 
            icon={UserCheck} 
            color="orange" 
            change={15}
            changeType="positive"
            onClick={() => handleMetricClick('pending_approvals')}
          />
          <StatCard 
            title="Total Approvals" 
            value={data.total_approvals || 0} 
            icon={CheckCircle} 
            color="green" 
            change={-3}
            changeType="negative"
            onClick={() => handleMetricClick('approved')}
          />
          <StatCard 
            title="Approval Bottlenecks" 
            value={data.approval_pipeline?.bottlenecks?.length || 0} 
            icon={AlertTriangle} 
            color="red" 
            change={7}
            changeType="positive"
            onClick={() => handleMetricClick('bottlenecks')}
          />
          <StatCard 
            title="Offers Sent" 
            value={data.total_offers || 0} 
            icon={Award} 
            color="purple" 
            change={20}
            changeType="positive"
            onClick={() => handleMetricClick('offers')}
          />
          <StatCard 
            title="Onboarding" 
            value={data.total_onboarding || 0} 
            icon={Briefcase} 
            color="indigo" 
            change={10}
            changeType="positive"
            onClick={() => handleMetricClick('onboarding')}
          />
        </div>

        {/* Filter Results Section - Full Width */}
        <CandidateFilterSection 
          onNavigateToList={onNavigateToList} 
          activeFilter={activeFilter}
          triggerSearch={triggerSearch}
        />

        {/* Main Dashboard Layout - Charts (3/4) + Recent Activities (1/4) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Charts Section - 3/4 space with 3x2 Grid Layout */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <CompactBarChart 
            data={data.candidatesBySkill}
            title="Top Skills"
          />
          
          <CompactPieChart 
            data={data.experienceDistribution}
            title="Experience Levels"
          />
          
          <CompactBarChart 
            data={data.interviewSuccess}
            title="Interview Funnel"
          />

          {/* New Graph 1: Salary Distribution */}
          <CompactBarChart 
            data={[
              { name: '0-50k', value: Math.floor(Math.random() * 20) + 10 },
              { name: '50-80k', value: Math.floor(Math.random() * 30) + 25 },
              { name: '80-120k', value: Math.floor(Math.random() * 25) + 20 },
              { name: '120k+', value: Math.floor(Math.random() * 15) + 8 }
            ]}
            title="Salary Distribution"
          />

          {/* New Graph 2: Department Breakdown */}
          <CompactPieChart 
            data={[
              { name: 'Engineering', value: Math.floor(Math.random() * 40) + 30 },
              { name: 'Marketing', value: Math.floor(Math.random() * 20) + 15 },
              { name: 'Sales', value: Math.floor(Math.random() * 25) + 20 },
              { name: 'HR', value: Math.floor(Math.random() * 15) + 10 },
              { name: 'Finance', value: Math.floor(Math.random() * 10) + 5 }
            ]}
            title="Department Breakdown"
          />
          
              {/* Key Performance Indicators */}
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Key Performance Indicators
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-xs font-medium text-blue-900">Application Rate</span>
                    <span className="text-xs font-bold text-blue-600">
                      {data.total_candidates > 0 && data.activeApplications > 0 ? `${Math.round((data.activeApplications / data.total_candidates) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-xs font-medium text-green-900">Interview Rate</span>
                    <span className="text-xs font-bold text-green-600">
                      {data.activeApplications > 0 && data.total_interviews > 0 ? `${Math.round((data.total_interviews / data.activeApplications) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span className="text-xs font-medium text-purple-900">Hire Rate</span>
                    <span className="text-xs font-bold text-purple-600">
                      {data.total_interviews > 0 && data.total_offers > 0 ? `${Math.round((data.total_offers / data.total_interviews) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-xs font-medium text-yellow-900">Time to Hire</span>
                    <span className="text-xs font-bold text-yellow-600">
                      {data.avg_time_to_hire ? `${data.avg_time_to_hire} days` : '14 days'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                    <span className="text-xs font-medium text-indigo-900">Quality Score</span>
                    <span className="text-xs font-bold text-indigo-600">
                      {data.quality_score ? `${data.quality_score}/10` : '8.5/10'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities Section - 1/4 space */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-[656px] flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center flex-shrink-0">
                <Clock className="h-4 w-4 mr-2" />
                Recent Activities
              </h3>
              <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                {data.recentActivities?.length > 0 ? (
                  data.recentActivities.map((activity, index) => {
                    const getActivityIcon = (iconName, type) => {
                      // Use the icon name from backend, fallback to type-based icons
                      switch(iconName || type) {
                        case 'user-plus':
                        case 'candidate': return <FileText className="h-3 w-3" />;
                        case 'credit-card':
                        case 'subscription': return <CreditCard className="h-3 w-3" />;
                        case 'dollar-sign':
                        case 'payment': return <DollarSign className="h-3 w-3" />;
                        case 'calendar':
                        case 'interview': return <Calendar className="h-3 w-3" />;
                        case 'check-circle':
                        case 'approval': return <CheckCircle className="h-3 w-3" />;
                        case 'award':
                        case 'offer': return <Award className="h-3 w-3" />;
                        case 'application': return <FileText className="h-3 w-3" />;
                        case 'hire': return <Award className="h-3 w-3" />;
                        default: return <Clock className="h-3 w-3" />;
                      }
                    };
                    
                    const getStatusColor = (status) => {
                      switch(status) {
                        case 'new': return 'bg-green-100 text-green-800';
                        case 'pending': return 'bg-yellow-100 text-yellow-800';
                        case 'completed': 
                        case 'active': return 'bg-blue-100 text-blue-800';
                        case 'scheduled': return 'bg-purple-100 text-purple-800';
                        case 'sent': return 'bg-indigo-100 text-indigo-800';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    };

                    const getAreaColor = (area) => {
                      switch(area) {
                        case 'Recruitment': return 'text-blue-600';
                        case 'Billing': return 'text-green-600';
                        case 'Finance': return 'text-emerald-600';
                        case 'HR': return 'text-purple-600';
                        case 'Management': return 'text-orange-600';
                        default: return 'text-gray-600';
                      }
                    };
                    
                    return (
                      <div key={index} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                        <div className={`mt-0.5 ${getAreaColor(activity.area)}`}>
                          {getActivityIcon(activity.icon, activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {activity.title}
                            </p>
                            <span className="text-xs text-gray-400 ml-1">
                              {activity.area}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {activity.action}
                          </p>
                          {activity.details && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {activity.details}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">{activity.time}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No recent activities
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {/* Hiring Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Hiring Trends (Last 6 Months)
            </h3>
            <div className="space-y-3">
              {['January', 'February', 'March', 'April', 'May', 'June'].map((month, index) => (
                <div key={month} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{Math.floor(Math.random() * 50) + 10}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-900">Candidate Satisfaction</span>
                  <span className="text-lg font-bold text-green-600">4.8/5</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-900">Process Efficiency</span>
                  <span className="text-lg font-bold text-blue-600">87%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-purple-900">Time to Fill</span>
                  <span className="text-lg font-bold text-purple-600">12 days</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-600" />
            Team Performance Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['HR Team', 'Technical Team', 'Management'].map((team, index) => (
              <div key={team} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">{team}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Cases</span>
                    <span className="font-medium">{Math.floor(Math.random() * 20) + 5}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium">{Math.floor(Math.random() * 50) + 20}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-medium text-green-600">{Math.floor(Math.random() * 20) + 80}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Summary</h3>
            <p className="text-gray-600 mb-4">
              This dashboard provides comprehensive insights into your recruitment process. 
              All data is updated in real-time and reflects the current state of your hiring pipeline.
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <span>Last Updated: {new Date().toLocaleString()}</span>
              <span>•</span>
              <span>Data Source: Excel Integration</span>
              <span>•</span>
              <span>Refresh Rate: Real-time</span>
            </div>
          </div>
        </div>
          </div>
        )}

      {/* Real-Time Charts Tab */}
      {activeTab === 'charts' && (
        <RealTimeCharts />
      )}

      {/* Performance Analytics Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          {perfLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}

          {!perfLoading && perfError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{perfError}</p>
              </div>
            </div>
          )}

          {!perfLoading && !perfError && performanceData && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  title="Avg KPI Score"
                  value={performanceData.average_kpi_score ?? performanceData.avg_kpi ?? 0}
                  icon={Target}
                  color="purple"
                />
                <StatCard
                  title="Avg Overall Score"
                  value={performanceData.average_overall_score ?? performanceData.avg_overall ?? 0}
                  icon={Award}
                  color="indigo"
                />
                <StatCard
                  title="Evaluations"
                  value={(performanceData.evaluations?.length) ?? performanceData.total_evaluations ?? 0}
                  icon={FileText}
                  color="blue"
                />
                <StatCard
                  title="Top Performers"
                  value={(performanceData.top_performers?.length) ?? performanceData.topPerformersCount ?? 0}
                  icon={Users}
                  color="green"
                />
                <StatCard
                  title="Goals Assigned"
                  value={goalsSummary.total}
                  icon={BarChart3}
                  color="orange"
                />
              </div>

              {/* Goals Bar */}
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="flex items-center mb-3">
                  <BarChart3 className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Goals Bar</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded border bg-orange-50">
                    <div className="text-sm text-gray-600">By Status</div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {Object.entries(goalsSummary.byStatus).map(([s, n]) => (
                        <span key={s} className="px-2 py-1 rounded border bg-white text-gray-800 text-xs">{s}: {n}</span>
                      ))}
                      {Object.keys(goalsSummary.byStatus).length === 0 && (
                        <span className="text-xs text-gray-500">No data</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-yellow-50">
                    <div className="text-sm text-gray-600">By Priority</div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {Object.entries(goalsSummary.byPriority).map(([p, n]) => (
                        <span key={p} className="px-2 py-1 rounded border bg-white text-gray-800 text-xs">{p}: {n}</span>
                      ))}
                      {Object.keys(goalsSummary.byPriority).length === 0 && (
                        <span className="text-xs text-gray-500">No data</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-indigo-50">
                    <div className="text-sm text-gray-600">Total Goals</div>
                    <div className="mt-2 text-2xl font-semibold text-indigo-700">{goalsSummary.total}</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weightage</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {goalsAssignments.length === 0 ? (
                        <tr>
                          <td className="px-4 py-3 text-center text-gray-500" colSpan="7">No goals assigned</td>
                        </tr>
                      ) : (
                        goalsAssignments.map((g) => (
                          <tr key={`${g.id}-${g.employee_id}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700">{g.kpi || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded border text-xs ${
                                g.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                                g.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-green-50 text-green-700 border-green-200'
                              }`}>{(g.priority || '').toUpperCase() || '-'}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{g.weightage || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{g.assignee_name || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 border">{g.status || 'assigned'}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{g.assigned_at ? new Date(g.assigned_at).toLocaleString() : '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{g.due_at ? new Date(g.due_at).toLocaleString() : '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow border p-4">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Top KPIs</h3>
                  </div>
                  <ul className="space-y-2">
                    {(performanceData.top_kpis || performanceData.kpi_leaders || []).slice(0, 8).map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item?.label ?? item?.name ?? `KPI ${idx+1}`}</span>
                        <span className="text-gray-900 font-medium">{item?.value ?? item?.score ?? 0}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow border p-4">
                  <div className="flex items-center mb-3">
                    <Users className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
                  </div>
                  <ul className="space-y-2">
                    {(performanceData.top_performers || []).slice(0, 8).map((emp, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{emp?.name ?? emp?.employee_name ?? `Employee ${idx+1}`}</span>
                        <span className="text-gray-900 font-medium">{emp?.score ?? emp?.overall_score ?? 0}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!perfLoading && !perfError && !performanceData && (
            <div className="text-center py-12">
              <p className="text-gray-600">No performance data available.</p>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;