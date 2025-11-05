import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, AlertCircle, XCircle, User, FileText, 
  Calendar, Award, Briefcase, UserCheck, Gift, Home,
  ArrowRight, Play, Pause, RotateCcw
} from 'lucide-react';

const CandidateWorkflow = ({ candidate, onStatusUpdate }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [stageHistory, setStageHistory] = useState([]);

  // Define the complete workflow stages
  const workflowStages = [
    {
      id: 'applied',
      name: 'Application Received',
      description: 'Candidate has submitted their application',
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      estimatedDuration: '1 day'
    },
    {
      id: 'screening',
      name: 'Initial Screening',
      description: 'Resume review and initial qualification check',
      icon: User,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
      estimatedDuration: '2-3 days'
    },
    {
      id: 'interview_scheduled',
      name: 'Interview Scheduled',
      description: 'Interview has been scheduled with the candidate',
      icon: Calendar,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600',
      estimatedDuration: '3-5 days'
    },
    {
      id: 'interviewed',
      name: 'Interview Completed',
      description: 'Candidate has completed the interview process',
      icon: UserCheck,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700',
      iconColor: 'text-indigo-600',
      estimatedDuration: '1-2 days'
    },
    {
      id: 'approved',
      name: 'Approved',
      description: 'Candidate has been approved for the position',
      icon: Award,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      estimatedDuration: '2-3 days'
    },
    {
      id: 'offer_released',
      name: 'Offer Released',
      description: 'Job offer has been sent to the candidate',
      icon: Gift,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      iconColor: 'text-emerald-600',
      estimatedDuration: '5-7 days'
    },
    {
      id: 'onboarded',
      name: 'Onboarded',
      description: 'Candidate has successfully joined the organization',
      icon: Home,
      color: 'teal',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-700',
      iconColor: 'text-teal-600',
      estimatedDuration: 'Complete'
    }
  ];

  // Rejection stage (can happen at any point)
  const rejectionStage = {
    id: 'rejected',
    name: 'Rejected',
    description: 'Application was not successful',
    icon: XCircle,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
    estimatedDuration: 'Final'
  };

  // Initialize workflow state based on candidate status
  useEffect(() => {
    if (candidate) {
      const status = candidate.status || candidate.approval_status || 'applied';
      const stageIndex = workflowStages.findIndex(stage => stage.id === status);
      
      if (stageIndex !== -1) {
        setCurrentStage(stageIndex);
        setCompletedStages(Array.from({ length: stageIndex }, (_, i) => i));
      } else if (status === 'rejected') {
        // Handle rejection - could be at any stage
        setCurrentStage(-1); // Special case for rejection
      }

      // Build stage history from candidate data
      buildStageHistory();
    }
  }, [candidate]);

  const buildStageHistory = () => {
    const history = [];
    
    if (candidate.application_date) {
      history.push({
        stage: 'applied',
        date: candidate.application_date,
        action: 'Application submitted'
      });
    }
    
    if (candidate.screening_date) {
      history.push({
        stage: 'screening',
        date: candidate.screening_date,
        action: 'Screening completed'
      });
    }
    
    if (candidate.interview_scheduled_date) {
      history.push({
        stage: 'interview_scheduled',
        date: candidate.interview_scheduled_date,
        action: 'Interview scheduled'
      });
    }
    
    if (candidate.interview_date) {
      history.push({
        stage: 'interviewed',
        date: candidate.interview_date,
        action: 'Interview completed'
      });
    }
    
    if (candidate.approval_date) {
      history.push({
        stage: 'approved',
        date: candidate.approval_date,
        action: 'Candidate approved'
      });
    }
    
    if (candidate.offer_letter_sent_date) {
      history.push({
        stage: 'offer_released',
        date: candidate.offer_letter_sent_date,
        action: 'Offer letter sent'
      });
    }
    
    if (candidate.onboarding_date) {
      history.push({
        stage: 'onboarded',
        date: candidate.onboarding_date,
        action: 'Onboarding completed'
      });
    }

    setStageHistory(history.sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const getStageStatus = (stageIndex) => {
    const status = candidate.status || candidate.approval_status || 'applied';
    
    if (status === 'rejected') {
      return 'rejected';
    }
    
    if (completedStages.includes(stageIndex)) {
      return 'completed';
    }
    
    if (stageIndex === currentStage) {
      return 'current';
    }
    
    return 'pending';
  };

  const getStatusIcon = (stage, status) => {
    const IconComponent = stage.icon;
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'current':
        return <IconComponent className={`w-6 h-6 ${stage.iconColor} animate-pulse`} />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysInStage = (stageId) => {
    const stageEntry = stageHistory.find(h => h.stage === stageId);
    if (!stageEntry) return null;
    
    const stageDate = new Date(stageEntry.date);
    const now = new Date();
    const diffTime = Math.abs(now - stageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const isRejected = (candidate.status || candidate.approval_status) === 'rejected';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
            Recruitment Workflow
          </h3>
          <p className="text-gray-600 mt-1">Track candidate progress through the hiring process</p>
        </div>
        <div className="flex items-center space-x-2">
          {isRejected ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <XCircle className="w-4 h-4 mr-1" />
              Rejected
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Play className="w-4 h-4 mr-1" />
              In Progress
            </span>
          )}
        </div>
      </div>

      {/* Workflow Visualization */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-8 top-12 bottom-0 w-0.5 bg-gray-200"></div>
        <div 
          className="absolute left-8 top-12 w-0.5 bg-gradient-to-b from-blue-500 to-green-500 transition-all duration-1000"
          style={{ 
            height: isRejected ? '0%' : `${(currentStage / (workflowStages.length - 1)) * 100}%` 
          }}
        ></div>

        {/* Workflow Stages */}
        <div className="space-y-4">
          {workflowStages.map((stage, index) => {
            const status = getStageStatus(index);
            const stageDate = stageHistory.find(h => h.stage === stage.id)?.date;
            const daysInStage = calculateDaysInStage(stage.id);
            
            return (
              <div key={stage.id} className="relative flex items-start">
                {/* Stage Icon */}
                <div className={`
                  relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 
                  ${status === 'completed' ? 'bg-green-100 border-green-500' : 
                    status === 'current' ? `${stage.bgColor} ${stage.borderColor}` : 
                    status === 'rejected' ? 'bg-red-100 border-red-500' :
                    'bg-gray-100 border-gray-300'}
                  transition-all duration-300
                `}>
                  {getStatusIcon(stage, status)}
                </div>

                {/* Stage Content */}
                <div className="ml-6 flex-1 min-w-0">
                  <div className={`
                    rounded-lg border-2 p-4 transition-all duration-300
                    ${status === 'completed' ? 'bg-green-50 border-green-200' : 
                      status === 'current' ? `${stage.bgColor} ${stage.borderColor}` : 
                      status === 'rejected' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'}
                  `}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`
                        font-semibold text-lg
                        ${status === 'completed' ? 'text-green-800' : 
                          status === 'current' ? stage.textColor : 
                          status === 'rejected' ? 'text-red-800' :
                          'text-gray-600'}
                      `}>
                        {stage.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {stageDate && (
                          <span className="text-sm text-gray-500">
                            {formatDate(stageDate)}
                          </span>
                        )}
                        {status === 'current' && daysInStage && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {daysInStage} day{daysInStage !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className={`
                      text-sm mb-2
                      ${status === 'completed' ? 'text-green-700' : 
                        status === 'current' ? stage.textColor : 
                        status === 'rejected' ? 'text-red-700' :
                        'text-gray-500'}
                    `}>
                      {stage.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Est. Duration: {stage.estimatedDuration}
                      </span>
                      
                      {status === 'current' && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-blue-600 font-medium">Active</span>
                        </div>
                      )}
                      
                      {status === 'completed' && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Rejection Stage (if applicable) */}
          {isRejected && (
            <div className="relative flex items-start">
              <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 bg-red-100 border-red-500">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <div className="ml-6 flex-1 min-w-0">
                <div className="rounded-lg border-2 p-4 bg-red-50 border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg text-red-800">
                      {rejectionStage.name}
                    </h4>
                    {candidate.rejection_date && (
                      <span className="text-sm text-gray-500">
                        {formatDate(candidate.rejection_date)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-red-700 mb-2">
                    {rejectionStage.description}
                  </p>
                  
                  {candidate.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Reason:</strong> {candidate.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">Total Time</p>
              <p className="text-lg font-bold text-blue-700">
                {stageHistory.length > 0 ? 
                  Math.ceil((new Date() - new Date(stageHistory[0].date)) / (1000 * 60 * 60 * 24)) : 0} days
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-900">Completed Stages</p>
              <p className="text-lg font-bold text-green-700">
                {completedStages.length} / {workflowStages.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Award className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-purple-900">Progress</p>
              <p className="text-lg font-bold text-purple-700">
                {isRejected ? '0%' : Math.round((currentStage / (workflowStages.length - 1)) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      {stageHistory.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Activity Timeline
          </h4>
          <div className="space-y-3">
            {stageHistory.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateWorkflow;