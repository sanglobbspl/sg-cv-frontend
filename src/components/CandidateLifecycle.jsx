import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Clock, Calendar, BarChart3, PieChart, Activity,
  Target, Zap, AlertTriangle, CheckCircle2, Timer, Users,
  ArrowUp, ArrowDown, Minus, Star, Award, Trophy,
  MessageSquare, FileText, Phone, Video, Mail
} from 'lucide-react';

const CandidateLifecycle = ({ candidate }) => {
  const [lifecycleData, setLifecycleData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    if (candidate) {
      calculateLifecycleMetrics();
      generateInsights();
    }
  }, [candidate]);

  const calculateLifecycleMetrics = () => {
    const stages = [
      { id: 'applied', date: candidate.application_date, name: 'Application' },
      { id: 'screening', date: candidate.screening_date, name: 'Screening' },
      { id: 'interview_scheduled', date: candidate.interview_scheduled_date, name: 'Interview Scheduled' },
      { id: 'interviewed', date: candidate.interview_date, name: 'Interview' },
      { id: 'approved', date: candidate.approval_date, name: 'Approval' },
      { id: 'offer_released', date: candidate.offer_letter_sent_date, name: 'Offer' },
      { id: 'onboarded', date: candidate.onboarding_date, name: 'Onboarding' }
    ];

    const validStages = stages.filter(stage => stage.date);
    const totalDays = validStages.length > 1 ? 
      Math.ceil((new Date(validStages[validStages.length - 1].date) - new Date(validStages[0].date)) / (1000 * 60 * 60 * 24)) : 0;

    const stageMetrics = validStages.map((stage, index) => {
      const nextStage = validStages[index + 1];
      const daysInStage = nextStage ? 
        Math.ceil((new Date(nextStage.date) - new Date(stage.date)) / (1000 * 60 * 60 * 24)) : 
        Math.ceil((new Date() - new Date(stage.date)) / (1000 * 60 * 60 * 24));

      return {
        ...stage,
        daysInStage,
        efficiency: daysInStage <= 3 ? 'excellent' : daysInStage <= 7 ? 'good' : daysInStage <= 14 ? 'average' : 'slow'
      };
    });

    setLifecycleData({
      stages: stageMetrics,
      totalDays,
      currentStage: validStages[validStages.length - 1]?.name || 'Applied',
      completionRate: (validStages.length / stages.length) * 100
    });

    setMetrics({
      averageStageTime: stageMetrics.length > 0 ? 
        Math.round(stageMetrics.reduce((sum, stage) => sum + stage.daysInStage, 0) / stageMetrics.length) : 0,
      fastestStage: stageMetrics.length > 0 ? 
        stageMetrics.reduce((min, stage) => stage.daysInStage < min.daysInStage ? stage : min) : null,
      slowestStage: stageMetrics.length > 0 ? 
        stageMetrics.reduce((max, stage) => stage.daysInStage > max.daysInStage ? stage : max) : null,
      totalStages: validStages.length,
      efficiency: totalDays <= 21 ? 'excellent' : totalDays <= 45 ? 'good' : totalDays <= 90 ? 'average' : 'slow'
    });
  };

  const generateInsights = () => {
    const insightsList = [];
    const status = candidate.status || candidate.approval_status;

    // Performance insights
    if (lifecycleData?.totalDays <= 21) {
      insightsList.push({
        type: 'success',
        icon: Zap,
        title: 'Fast Track Candidate',
        description: 'This candidate is moving through the process exceptionally quickly.',
        priority: 'high'
      });
    } else if (lifecycleData?.totalDays > 60) {
      insightsList.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Extended Timeline',
        description: 'This candidate has been in the process for an extended period.',
        priority: 'medium'
      });
    }

    // Status-specific insights
    if (status === 'interview_scheduled') {
      insightsList.push({
        type: 'info',
        icon: Calendar,
        title: 'Interview Preparation',
        description: 'Ensure interview materials and feedback forms are ready.',
        priority: 'high'
      });
    }

    if (status === 'interviewed' && !candidate.approval_date) {
      const daysSinceInterview = candidate.interview_date ? 
        Math.ceil((new Date() - new Date(candidate.interview_date)) / (1000 * 60 * 60 * 24)) : 0;
      
      if (daysSinceInterview > 5) {
        insightsList.push({
          type: 'warning',
          icon: Clock,
          title: 'Pending Decision',
          description: `Interview completed ${daysSinceInterview} days ago. Consider expediting the decision process.`,
          priority: 'high'
        });
      }
    }

    // Experience insights
    const totalExp = candidate.total_experience || 0;
    const relevantExp = candidate.relevant_experience || 0;
    
    if (relevantExp / totalExp > 0.8) {
      insightsList.push({
        type: 'success',
        icon: Star,
        title: 'Highly Relevant Experience',
        description: 'Candidate has excellent relevant experience ratio.',
        priority: 'medium'
      });
    }

    // Salary insights
    const currentCTC = parseFloat(candidate.current_ctc) || 0;
    const expectedCTC = parseFloat(candidate.expected_ctc) || 0;
    
    if (expectedCTC > 0 && currentCTC > 0) {
      const increase = ((expectedCTC - currentCTC) / currentCTC) * 100;
      if (increase > 50) {
        insightsList.push({
          type: 'warning',
          icon: TrendingUp,
          title: 'High Salary Expectation',
          description: `Candidate expects ${increase.toFixed(0)}% salary increase.`,
          priority: 'medium'
        });
      } else if (increase < 20) {
        insightsList.push({
          type: 'success',
          icon: Target,
          title: 'Reasonable Expectations',
          description: 'Candidate has realistic salary expectations.',
          priority: 'low'
        });
      }
    }

    setInsights(insightsList);
  };

  const getEfficiencyColor = (efficiency) => {
    switch (efficiency) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'slow': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!lifecycleData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lifecycle Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-blue-600" />
            Candidate Lifecycle Analytics
          </h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEfficiencyColor(metrics.efficiency)}`}>
            {metrics.efficiency?.charAt(0).toUpperCase() + metrics.efficiency?.slice(1)} Process
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">Total Days</p>
                <p className="text-2xl font-bold text-blue-700">{lifecycleData.totalDays}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">Completion</p>
                <p className="text-2xl font-bold text-green-700">{Math.round(lifecycleData.completionRate)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center">
              <Timer className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-900">Avg Stage Time</p>
                <p className="text-2xl font-bold text-purple-700">{metrics.averageStageTime}d</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-orange-900">Current Stage</p>
                <p className="text-lg font-bold text-orange-700">{lifecycleData.currentStage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Performance Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Stage Performance Analysis
          </h4>
          <div className="space-y-3">
            {lifecycleData.stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getEfficiencyColor(stage.efficiency).replace('text-', 'bg-').replace(' bg-', ' ')}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{stage.name}</p>
                    <p className="text-sm text-gray-500">{formatDate(stage.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{stage.daysInStage} days</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(stage.efficiency)}`}>
                    {stage.efficiency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
          AI-Powered Insights
        </h3>
        
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <IconComponent className={`w-6 h-6 mt-0.5 ${getInsightIcon(insight.type)}`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.priority} priority
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No specific insights available yet. More data will generate better recommendations.</p>
          </div>
        )}
      </div>

      {/* Performance Benchmarks */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Award className="w-6 h-6 mr-2 text-green-600" />
          Performance Benchmarks
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Speed Comparison */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Speed Analysis
            </h4>
            <div className="space-y-3">
              {metrics.fastestStage && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fastest Stage:</span>
                  <div className="text-right">
                    <p className="font-medium text-green-700">{metrics.fastestStage.name}</p>
                    <p className="text-sm text-green-600">{metrics.fastestStage.daysInStage} days</p>
                  </div>
                </div>
              )}
              {metrics.slowestStage && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Slowest Stage:</span>
                  <div className="text-right">
                    <p className="font-medium text-red-700">{metrics.slowestStage.name}</p>
                    <p className="text-sm text-red-600">{metrics.slowestStage.daysInStage} days</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Efficiency Score */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Efficiency Score
            </h4>
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${lifecycleData.completionRate * 2.51} 251`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">
                    {Math.round(lifecycleData.completionRate)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Process Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-purple-600" />
          Communication Timeline
        </h3>
        
        <div className="space-y-4">
          {/* Sample communication events - in a real app, this would come from actual data */}
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="font-medium text-gray-900">Application Acknowledgment</p>
              <p className="text-sm text-gray-600">Automated email sent to candidate</p>
              <p className="text-xs text-gray-500">{formatDate(candidate.application_date)}</p>
            </div>
          </div>
          
          {candidate.interview_scheduled_date && (
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Interview Invitation</p>
                <p className="text-sm text-gray-600">Interview scheduled and calendar invite sent</p>
                <p className="text-xs text-gray-500">{formatDate(candidate.interview_scheduled_date)}</p>
              </div>
            </div>
          )}
          
          {candidate.offer_letter_sent_date && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Offer Letter Sent</p>
                <p className="text-sm text-gray-600">Official job offer delivered to candidate</p>
                <p className="text-xs text-gray-500">{formatDate(candidate.offer_letter_sent_date)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateLifecycle;