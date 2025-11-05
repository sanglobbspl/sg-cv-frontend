import React, { useState, useEffect } from 'react';
import { api } from '../api';
import CandidateDetailsModal from './CandidateDetailsModal';
import CandidateEditModal from './CandidateEditModal';
import { 
  User, Edit3, Check, X, AlertCircle, Loader, Search, 
  ChevronLeft, ChevronRight, MapPin, Phone, Mail, 
  Building, Calendar, DollarSign, Award, FileText,
  Eye, Download, Star, Trash2, Globe, GraduationCap,
  Briefcase, IndianRupee, TrendingUp, Clock
} from 'lucide-react';

const CandidatesList = ({ user, dashboardFilter }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStatus, setEditingStatus] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [activeFilter, setActiveFilter] = useState(null);
  const [deletingCandidate, setDeletingCandidate] = useState(null);
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total_pages: 1,
    total_candidates: 0,
    has_next: false,
    has_prev: false,
    start_index: 0,
    end_index: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Status options for the dropdown
  const statusOptions = [
    { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { value: 'screening', label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'interview_scheduled', label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800' },
    { value: 'interviewed', label: 'Interviewed', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'offer_released', label: 'Offer Released', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'onboarded', label: 'Onboarded', color: 'bg-teal-100 text-teal-800' },
  ];

  // Update useEffect to handle dashboard filter
  useEffect(() => {
    if (dashboardFilter) {
      setActiveFilter(dashboardFilter);
      setCurrentPage(1); // Reset to first page when filter changes
    }
  }, [dashboardFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [currentPage, searchTerm, activeFilter]);

  const fetchCandidates = async (page = currentPage, search = searchTerm, filter = activeFilter) => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20'
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      // Add filter parameter based on dashboard selection
      if (filter) {
        switch (filter) {
          case 'active':
            params.append('status', 'applied,screening,interview_scheduled');
            break;
          case 'interviews':
            params.append('status', 'interview_scheduled,interviewed');
            break;
          case 'pending_approvals':
            params.append('status', 'interviewed');
            break;
          case 'approved':
            params.append('status', 'approved');
            break;
          case 'offers':
            params.append('status', 'offer_released');
            break;
          case 'onboarding':
            params.append('status', 'onboarded');
            break;
          case 'bottlenecks':
            params.append('filter_type', 'bottlenecks');
            break;
          case 'all':
          default:
            // No additional filter
            break;
        }
      }
      
      const data = await api.getCandidatesList(Object.fromEntries(params));
      
      if (data.success) {
        setCandidates(data.data || []);
        setPagination(data.pagination || {});
        setUserRole(data.user_role || 'user');
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

  const getStatusDisplay = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption || { value: status, label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const handleStatusEdit = (candidateId, currentStatus) => {
    if (userRole !== 'admin') {
      return; // Only admin can edit
    }
    setEditingStatus({ candidateId, currentStatus });
  };

  const handleStatusUpdate = async (candidateId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await api.updateCandidateStatus(candidateId, newStatus);
      
      if (response.success) {
        // Update the local state
        setCandidates(prev => 
          prev.map(candidate => 
            candidate.id === candidateId 
              ? { ...candidate, approval_status: newStatus }
              : candidate
          )
        );
        setEditingStatus(null);
        
        // Show success message (you can add a toast notification here)
        console.log('Status updated successfully');
      } else {
        setError(response.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status');
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStatus(null);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const handlePrevPage = () => {
    if (pagination.has_prev) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.has_next) {
      handlePageChange(currentPage + 1);
    }
  };

  // Search handlers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Auto-search when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchCandidates(1, searchTerm, activeFilter);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeFilter]);

  // Modal handlers
  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  // Edit modal handlers
  const handleEditCandidate = (candidate) => {
    console.log('Edit button clicked for candidate:', candidate);
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      alert('❌ Please log in to edit candidates');
      return;
    }
    
    if (!candidate || !candidate.id) {
      alert('❌ Invalid candidate data');
      console.error('Invalid candidate:', candidate);
      return;
    }
    
    console.log('Setting editing candidate:', candidate.id, candidate.name);
    setEditingCandidate(candidate);
    setIsEditModalOpen(true);
    console.log('Modal state set - isEditModalOpen should be true');
    
    // Force a re-render to ensure modal opens
    setTimeout(() => {
      console.log('After timeout - isEditModalOpen:', isEditModalOpen);
      console.log('After timeout - editingCandidate:', editingCandidate);
    }, 100);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCandidate(null);
  };

  const handleSaveCandidate = async (candidateId, updatedData) => {
    console.log('Saving candidate:', candidateId, updatedData);
    try {
      const response = await api.updateCandidate(candidateId, updatedData);
      console.log('API response:', response);
      
      if (response && response.success) {
        // Refresh the candidates list to show updated data
        fetchCandidates(currentPage, searchTerm, activeFilter);
        
        // Show success popup with smart modal closure
        const userConfirmed = window.confirm(
          '✅ Changes saved successfully!\n\nCandidate information has been updated in the database.\n\nClick OK to close the edit window.'
        );
        
        if (userConfirmed) {
          // Close the modal after user confirmation
          handleCloseEditModal();
        }
        
        // Alternative: Auto-close after a delay
        // setTimeout(() => {
        //   handleCloseEditModal();
        // }, 2000);
        
      } else {
        console.error('Update failed:', response);
        alert('❌ Failed to save changes: ' + (response?.error || 'Unknown error'));
        throw new Error(response?.error || 'Failed to update candidate');
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      alert('❌ Error saving changes: ' + error.message);
      throw error; // Re-throw to prevent modal from closing
    }
  };

  // Temporary test function
  const testAPI = async () => {
    console.log('=== AUTHENTICATION & API TEST ===');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!user);
    
    if (!token) {
      alert('ERROR: No authentication token found! Please log in first.');
      return;
    }
    
    if (!user) {
      alert('ERROR: No user data found! Please log in first.');
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
    } catch (e) {
      console.error('Invalid user data:', e);
      alert('ERROR: Invalid user data! Please log in again.');
      return;
    }
    
    console.log('Token preview:', token.substring(0, 20) + '...');
    
    // Test API connectivity
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('API URL:', apiUrl);
    
    try {
      console.log('Testing GET /api/recruitment/candidates...');
      const response = await fetch(`${apiUrl}/api/recruitment/candidates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('GET Response status:', response.status);
      
      if (response.status === 401) {
        alert('ERROR: Authentication failed! Token may be expired. Please log in again.');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('GET Success! Candidates count:', data.data ? data.data.length : 0);
        alert('✅ API test successful! Authentication working. Check console for details.');
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        alert(`❌ API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`❌ Network Error: ${error.message}`);
    }
  };

  // Delete candidate handler
  const handleDeleteCandidate = async (candidate) => {
    const candidateName = candidate.name || candidate.Name || 'this candidate';
    if (window.confirm(`Are you sure you want to delete ${candidateName}? This action cannot be undone.`)) {
      setDeletingCandidate(candidate.id);
      try {
        const response = await api.deleteCandidate(candidate.id);
        if (response.success) {
          // Refresh the candidates list
          fetchCandidates(currentPage, searchTerm, activeFilter);
          alert(response.message || 'Candidate deleted successfully');
        } else {
          alert(response.error || 'Failed to delete candidate');
        }
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert(error.message || 'Failed to delete candidate');
      } finally {
        setDeletingCandidate(null);
      }
    }
  };

  // Add function to clear filter
  const clearFilter = () => {
    setActiveFilter(null);
    setCurrentPage(1);
  };

  // Add function to get filter display name
  const getFilterDisplayName = (filter) => {
    const filterNames = {
      'all': 'All Candidates',
      'active': 'Active Applications',
      'interviews': 'Interview Candidates',
      'pending_approvals': 'Pending Approvals',
      'approved': 'Approved Candidates',
      'offers': 'Offer Recipients',
      'onboarding': 'Onboarding',
      'bottlenecks': 'Approval Bottlenecks'
    };
    return filterNames[filter] || filter;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading candidates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Candidates Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  {pagination.total_candidates} candidate{pagination.total_candidates !== 1 ? 's' : ''} found
                  {userRole === 'admin' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <Star className="w-3 h-3 mr-1" />
                      Admin Access
                    </span>
                  )}
                </p>
              </div>
              
              {/* Temporary Test Button */}
              <button
                onClick={testAPI}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Test API
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 lg:max-w-lg xl:max-w-xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                     type="text"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder="Search Resume"
                     className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                   />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={handleSearchClear}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Filter Display Section */}
        {activeFilter && (
          <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Filtered View: {getFilterDisplayName(activeFilter)}
                  </h3>
                  <p className="text-sm text-blue-700">
                    Showing candidates based on your dashboard selection
                  </p>
                </div>
              </div>
              <button
                onClick={clearFilter}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Clear Filter</span>
              </button>
            </div>
          </div>
        )}

        {/* Candidates Table */}
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <>
              {/* Mobile responsive notice */}
              <div className="lg:hidden bg-blue-50 border-b border-blue-200 p-3">
                <p className="text-sm text-blue-700 flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Scroll horizontally to view all columns
                </p>
              </div>
              <div 
                className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full" 
                style={{ 
                  scrollbarWidth: 'thin', 
                  scrollbarColor: '#60a5fa #f3f4f6',
                  scrollbarGutter: 'stable',
                  paddingBottom: '8px'
                }}
              >
                <table className="w-full table-auto candidates-table" style={{ minWidth: '1200px' }}>
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="col-status px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="col-actions px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span>Actions</span>
                      </div>
                    </th>
                    <th className="col-candidate px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span>Candidate Info</span>
                        </div>
                      </th>
                    <th className="col-contact px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-green-500" />
                        <span>Contact & Location</span>
                      </div>
                    </th>
                    <th className="col-experience px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-yellow-500" />
                        <span>Experience</span>
                      </div>
                    </th>
                    <th className="col-skills px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-purple-500" />
                        <span>Skills</span>
                      </div>
                    </th>



                    <th className="col-date px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Applied Date</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {candidates.map((candidate, index) => {
                  const statusDisplay = getStatusDisplay(candidate.status || candidate.approval_status);
                  const isEditing = editingStatus?.candidateId === candidate.id;
                  
                  return (
                    <tr 
                      key={candidate.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >

                      {/* Status */}
                      <td className="px-6 py-6">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={editingStatus.currentStatus}
                              onChange={(e) => setEditingStatus(prev => ({ ...prev, currentStatus: e.target.value }))}
                              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              disabled={updatingStatus}
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleStatusUpdate(candidate.id, editingStatus.currentStatus)}
                                disabled={updatingStatus}
                                className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                              >
                                {updatingStatus ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={updatingStatus}
                                className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                              {statusDisplay.label}
                            </span>
                            {userRole === 'admin' && (
                              <button
                                onClick={() => handleStatusEdit(candidate.id, candidate.status || candidate.approval_status)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(candidate)}
                            className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              console.log('Edit button clicked for candidate:', candidate);
                              console.log('Current modal state - isEditModalOpen:', isEditModalOpen);
                              console.log('Current editingCandidate:', editingCandidate);
                              handleEditCandidate(candidate);
                              console.log('After handleEditCandidate - isEditModalOpen should be true');
                            }}
                            className="p-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                            title="Edit Candidate"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {candidate.resume_path && (
                            <a
                              href={`/api/candidates/${candidate.id}/resume`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                              title="Download Resume"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          
                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleDeleteCandidate(candidate.id)}
                              className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete Candidate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Candidate Info */}
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {candidate.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              ID: {candidate.id}
                            </p>
                            <p className="text-xs text-blue-600 font-medium truncate">
                              {candidate.current_designation || candidate.applied_role || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <Mail className="w-3 h-3 mr-1 text-blue-500" />
                            <span className="truncate max-w-[120px]" title={candidate.email}>{candidate.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="w-3 h-3 mr-1 text-green-500" />
                            <span>{candidate.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <MapPin className="w-3 h-3 mr-1 text-red-500" />
                            <span className="truncate max-w-[100px]" title={candidate.current_location}>{candidate.current_location || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Building className="w-3 h-3 mr-1 text-purple-500" />
                            <span className="truncate max-w-[100px]" title={candidate.current_company}>{candidate.current_company || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Briefcase className="w-3 h-3 mr-1 text-yellow-500" />
                            <span className="text-xs font-medium text-gray-900">
                              {candidate.experience_display || 'N/A'}
                            </span>
                          </div>
                          {candidate.relevant_experience && (
                            <div className="flex items-center">
                              <Award className="w-3 h-3 mr-1 text-indigo-500" />
                              <span className="text-xs text-gray-600">
                                {candidate.relevant_experience}y relevant
                              </span>
                            </div>
                          )}
                          {candidate.preferred_location && (
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-green-500" />
                              <span className="text-xs text-gray-600 truncate max-w-[100px]" title={candidate.preferred_location}>
                                Pref: {candidate.preferred_location}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills ? 
                            candidate.skills.split(',').slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {skill.trim()}
                              </span>
                            )) : 
                            <span className="text-xs text-gray-500">No skills listed</span>
                          }
                          {candidate.skills && candidate.skills.split(',').length > 3 && (
                            <span className="text-xs text-gray-400">+{candidate.skills.split(',').length - 3} more</span>
                          )}
                        </div>
                      </td>







                      {/* Applied Date */}
                      <td className="px-4 py-4">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                          <span>
                            {candidate.applied_date ? 
                              new Date(candidate.applied_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              }) : 'N/A'
                            }
                          </span>
                        </div>
                      </td>


                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
          )}

        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {pagination.start_index + 1} to {pagination.end_index} of {pagination.total_candidates} candidates
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={!pagination.has_prev}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.total_pages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.has_next}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Candidate Details Modal */}
      <CandidateDetailsModal
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Candidate Edit Modal */}
      <CandidateEditModal
        candidate={editingCandidate}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveCandidate}
      />
    </div>
  );
};

export default CandidatesList;