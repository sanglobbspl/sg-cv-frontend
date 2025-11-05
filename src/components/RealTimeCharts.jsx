import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { RefreshCw, TrendingUp, Users, DollarSign, Calendar, MapPin, Target, Clock, Briefcase, Star } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RealTimeCharts = () => {
  const [chartsData, setChartsData] = useState({
    candidatesTimeline: null,
    statusDistribution: null,
    skillsDemand: null,
    experienceDistribution: null,
    subscriptionRevenue: null,
    interviewSuccessRate: null,
    locationDistribution: null,
    realTimeMetrics: null,
    hiringFunnel: null,
    performanceTrends: null,
    salaryInsights: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  const API_BASE = 'http://localhost:5000/api/charts';

  // Chart options configurations
  const chartOptions = {
    line: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Applications Timeline'
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
    },
    bar: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Top Skills in Demand'
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
    },
    pie: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Status Distribution'
        }
      }
    },
    doughnut: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Experience Distribution'
        }
      }
    },
    funnel: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Hiring Funnel'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const percentage = context.raw;
              const count = context.dataset.data[context.dataIndex];
              return `${context.label}: ${count} candidates (${percentage}%)`;
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
    },
    trends: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Performance Trends (6 Months)'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          },
        },
      }
    },
    salary: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Salary Distribution'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${context.label}: ${context.raw} candidates (${percentage}%)`;
            }
          }
        }
      }
    }
  };

  // Fetch data from API endpoints
  const fetchChartData = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE}/${endpoint}`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  };

  // Load all chart data
  const loadAllChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        candidatesTimeline,
        statusDistribution,
        skillsDemand,
        experienceDistribution,
        subscriptionRevenue,
        interviewSuccessRate,
        locationDistribution,
        realTimeMetrics,
        hiringFunnel,
        performanceTrends,
        salaryInsights
      ] = await Promise.all([
        fetchChartData('candidates-timeline'),
        fetchChartData('status-distribution'),
        fetchChartData('skills-demand'),
        fetchChartData('experience-distribution'),
        fetchChartData('subscription-revenue'),
        fetchChartData('interview-success-rate'),
        fetchChartData('location-distribution'),
        fetchChartData('real-time-metrics'),
        fetchChartData('hiring-funnel'),
        fetchChartData('performance-trends'),
        fetchChartData('salary-insights')
      ]);

      setChartsData({
        candidatesTimeline,
        statusDistribution,
        skillsDemand,
        experienceDistribution,
        subscriptionRevenue,
        interviewSuccessRate,
        locationDistribution,
        realTimeMetrics,
        hiringFunnel,
        performanceTrends,
        salaryInsights
      });

      setLastUpdated(new Date());
    } catch (error) {
      setError('Failed to load chart data');
      console.error('Error loading charts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    loadAllChartData();

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadAllChartData();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);



  const handleManualRefresh = () => {
    loadAllChartData();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (loading && !chartsData.realTimeMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading real-time charts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 font-medium">Error loading charts</div>
          <button
            onClick={handleManualRefresh}
            className="ml-auto bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Analytics Dashboard</h2>
          <p className="text-gray-600">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={toggleAutoRefresh}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Auto-refresh (30s)</span>
          </label>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Real-time metrics cards */}
      {chartsData.realTimeMetrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {chartsData.realTimeMetrics.total_candidates}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {chartsData.realTimeMetrics.active_candidates}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${chartsData.realTimeMetrics.monthly_revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {chartsData.realTimeMetrics.conversion_rate}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {chartsData.realTimeMetrics.pending_interviews}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hiring Velocity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {chartsData.realTimeMetrics.hiring_velocity}/month
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Top Skill Demand</p>
                  <p className="text-lg font-bold text-gray-900">
                    {chartsData.realTimeMetrics.top_skill_demand || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Briefcase className="w-8 h-8 text-teal-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {chartsData.realTimeMetrics.active_subscriptions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidates Timeline */}
        {chartsData.candidatesTimeline && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-80">
              <Line data={chartsData.candidatesTimeline} options={chartOptions.line} />
            </div>
          </div>
        )}

        {/* Status Distribution */}
        {chartsData.statusDistribution && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-80">
              <Pie data={chartsData.statusDistribution} options={chartOptions.pie} />
            </div>
          </div>
        )}

        {/* Skills Demand */}
        {chartsData.skillsDemand && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-80">
              <Bar data={chartsData.skillsDemand} options={chartOptions.bar} />
            </div>
          </div>
        )}

        {/* Experience Distribution */}
        {chartsData.experienceDistribution && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-80">
              <Doughnut data={chartsData.experienceDistribution} options={chartOptions.doughnut} />
            </div>
          </div>
        )}

        {/* Subscription Revenue */}
        {chartsData.subscriptionRevenue && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-80">
              <Line 
                data={chartsData.subscriptionRevenue} 
                options={{
                  ...chartOptions.line,
                  plugins: {
                    ...chartOptions.line.plugins,
                    title: {
                      display: true,
                      text: 'Revenue Timeline'
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}

        {/* Location Distribution */}
        {chartsData.locationDistribution && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-80">
              <Bar 
                data={chartsData.locationDistribution} 
                options={{
                  ...chartOptions.bar,
                  plugins: {
                    ...chartOptions.bar.plugins,
                    title: {
                      display: true,
                      text: 'Candidate Locations'
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}

        {/* Hiring Funnel */}
        {chartsData.hiringFunnel && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-80">
              <Bar 
                data={chartsData.hiringFunnel} 
                options={chartOptions.funnel}
              />
            </div>
          </div>
        )}

        {/* Salary Distribution */}
        {chartsData.salaryInsights && chartsData.salaryInsights.distribution && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-80">
              <Doughnut 
                data={chartsData.salaryInsights.distribution} 
                options={chartOptions.salary}
              />
            </div>
            {/* Salary insights summary */}
            {chartsData.salaryInsights.insights && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Avg Expected CTC</p>
                  <p className="font-bold text-lg">₹{chartsData.salaryInsights.insights.avg_expected_ctc}L</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Growth Expectation</p>
                  <p className="font-bold text-lg text-green-600">
                    {chartsData.salaryInsights.insights.salary_growth_expectation}%
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-width charts */}
      <div className="space-y-6">
        {/* Performance Trends */}
        {chartsData.performanceTrends && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-96">
              <Line 
                data={chartsData.performanceTrends} 
                options={chartOptions.trends}
              />
            </div>
          </div>
        )}

        {/* Interview Success Rate */}
        {chartsData.interviewSuccessRate && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-80">
              <Pie 
                data={chartsData.interviewSuccessRate} 
                options={{
                  ...chartOptions.pie,
                  plugins: {
                    ...chartOptions.pie.plugins,
                    title: {
                      display: true,
                      text: 'Interview Success Rate'
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeCharts;