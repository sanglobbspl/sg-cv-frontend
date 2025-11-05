import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Mail, Phone, MapPin, Building, Calendar, DollarSign, 
  Award, FileText, User, Briefcase, GraduationCap, 
  Clock, Star, Download, Activity, BarChart3
} from 'lucide-react';
import CandidateWorkflow from './CandidateWorkflow';
import CandidateLifecycle from './CandidateLifecycle';

const CandidateDetailsModal = ({ candidate, isOpen, onClose }) => {
  const modalRef = useRef(null);
  const [activeTab, setActiveTab] = useState('details');

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !candidate) return null;

  const handleDownloadResume = async () => {
    if (candidate.cv_file_path) {
      try {
        const response = await fetch(`/api/candidates/${candidate.id}/download-resume`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${candidate.name}_Resume.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          console.error('Failed to download resume');
        }
      } catch (error) {
        console.error('Error downloading resume:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'applied': 'bg-blue-100 text-blue-800',
      'screening': 'bg-yellow-100 text-yellow-800',
      'interview_scheduled': 'bg-purple-100 text-purple-800',
      'interviewed': 'bg-indigo-100 text-indigo-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'offer_released': 'bg-emerald-100 text-emerald-800',
      'onboarded': 'bg-teal-100 text-teal-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {candidate.name ? candidate.name.charAt(0).toUpperCase() : 'N'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{candidate.name || 'N/A'}</h2>
              <p className="text-blue-100">{candidate.current_designation || 'Not specified'}</p>
              <p className="text-blue-200 text-sm">ID: {candidate.id}</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Details</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'workflow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Workflow</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('lifecycle')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'lifecycle'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Lifecycle</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="h-[calc(90vh-180px)]">
          {activeTab === 'details' && (
            <div className="flex h-full">
              {/* Left Panel - Details */}
              <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">{candidate.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{candidate.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">{candidate.current_location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">{candidate.current_company || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Experience</p>
                      <p className="text-sm text-gray-600">{candidate.total_experience || 0} years</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Relevant Experience</p>
                      <p className="text-sm text-gray-600">{candidate.relevant_experience || 0} years</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notice Period</p>
                      <p className="text-sm text-gray-600">{candidate.notice_period || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Preferred Location</p>
                      <p className="text-sm text-gray-600">{candidate.preferred_location || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compensation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                  Compensation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Current CTC</p>
                    <p className="text-sm text-gray-600">{candidate.salary_display || candidate.current_ctc || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Expected CTC</p>
                    <p className="text-sm text-gray-600">{candidate.expected_salary_display || candidate.expected_ctc || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {candidate.skills && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-600" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.split(',').map((skill, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {candidate.education && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                    Education
                  </h3>
                  <p className="text-sm text-gray-600">{candidate.education}</p>
                </div>
              )}

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(candidate.status || candidate.approval_status)}`}>
                  {candidate.status || candidate.approval_status || 'N/A'}
                </span>
              </div>

              {/* Timeline Dates */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  {candidate.application_date && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm font-medium text-gray-900">Application Date</span>
                      <span className="text-sm text-gray-600">
                        {new Date(candidate.application_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {candidate.screening_date && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm font-medium text-gray-900">Screening Date</span>
                      <span className="text-sm text-gray-600">
                        {new Date(candidate.screening_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {candidate.interview_scheduled_date && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm font-medium text-gray-900">Interview Scheduled</span>
                      <span className="text-sm text-gray-600">
                        {new Date(candidate.interview_scheduled_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {candidate.interview_date && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm font-medium text-gray-900">Interview Date</span>
                      <span className="text-sm text-gray-600">
                        {new Date(candidate.interview_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {candidate.approval_date && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm font-medium text-gray-900">Approval Date</span>
                      <span className="text-sm text-gray-600">
                        {new Date(candidate.approval_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {candidate.offer_letter_sent_date && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm font-medium text-gray-900">Offer Letter Sent</span>
                      <span className="text-sm text-gray-600">
                        {new Date(candidate.offer_letter_sent_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {candidate.onboarding_date && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm font-medium text-gray-900">Onboarding Date</span>
                      <span className="text-sm text-gray-600">
                        {new Date(candidate.onboarding_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {!candidate.application_date && !candidate.screening_date && !candidate.interview_scheduled_date && 
                   !candidate.interview_date && !candidate.approval_date && !candidate.offer_letter_sent_date && 
                   !candidate.onboarding_date && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">No timeline dates available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {candidate.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{candidate.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Resume Viewer */}
          <div className="w-1/2 border-l border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Resume
                </h3>
                {candidate.cv_file_path && (
                  <button
                    onClick={handleDownloadResume}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="h-full p-4">
              {candidate.cv_file_path ? (
                <div className="h-full bg-white rounded-lg shadow-inner">
                  <iframe
                    src={`/api/candidates/${candidate.id}/view-resume?token=${localStorage.getItem('token')}`}
                    className="w-full h-full rounded-lg"
                    title="Resume Preview"
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-white rounded-lg">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No resume available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
          )}

          {activeTab === 'workflow' && (
            <div className="h-full p-6 overflow-y-auto">
              <CandidateWorkflow candidate={candidate} />
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <div className="h-full p-6 overflow-y-auto">
              <CandidateLifecycle candidate={candidate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;