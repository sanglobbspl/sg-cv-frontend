import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  Search,
  PlusCircle,
  BarChart3,
  Settings,
  History,
  FileText,
  ChevronRight,
  ChevronDown,
  User,
  Shield,
  Database,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  HelpCircle,
  Lightbulb,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Clock,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  Crown,
  DollarSign,
  Calendar,
  FileImage,
  Globe
} from 'lucide-react';

const Help = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sections = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: <BookOpen className="w-5 h-5" />,
      content: 'overview'
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Zap className="w-5 h-5" />,
      content: 'getting-started'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      content: 'dashboard'
    },
    {
      id: 'candidate-management',
      title: 'Candidate Management',
      icon: <Users className="w-5 h-5" />,
      content: 'candidate-management'
    },
    {
      id: 'search-features',
      title: 'Search Features',
      icon: <Search className="w-5 h-5" />,
      content: 'search-features'
    },
    {
      id: 'subscription-management',
      title: 'Subscription Management',
      icon: <CreditCard className="w-5 h-5" />,
      content: 'subscription-management'
    },
    {
      id: 'business-settings',
      title: 'Business Settings',
      icon: <Building2 className="w-5 h-5" />,
      content: 'business-settings'
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: <Shield className="w-5 h-5" />,
      content: 'user-management'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <HelpCircle className="w-5 h-5" />,
      content: 'troubleshooting'
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: <Lightbulb className="w-5 h-5" />,
      content: 'faq'
    }
  ];

  const FeatureCard = ({ icon, title, description, features }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 rounded-lg mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      {features && (
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const StepCard = ({ number, title, description, icon }) => (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
          {number}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-2">
          {icon && <div className="mr-2">{icon}</div>}
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                SG CV Search System
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A comprehensive recruitment management system designed to streamline candidate sourcing, 
                resume analysis, and talent acquisition processes.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    What is SG CV Search?
                  </h2>
                  <p className="text-gray-700 mb-4">
                    SG CV Search is an intelligent recruitment platform that combines advanced search capabilities 
                    with comprehensive candidate management tools. It helps HR professionals and recruiters 
                    efficiently manage their talent pipeline from initial sourcing to final hiring decisions.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">AI-Powered</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-5 h-5 text-green-500 mr-1" />
                      <span className="text-sm font-medium">Efficient</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-blue-500 mr-1" />
                      <span className="text-sm font-medium">Secure</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Key Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">500+</div>
                      <div className="text-sm text-gray-600">Candidates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">50+</div>
                      <div className="text-sm text-gray-600">Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">24/7</div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Search className="w-6 h-6 text-blue-600" />}
                title="Smart Search"
                description="Advanced search algorithms to find the perfect candidates based on skills, experience, and requirements."
                features={[
                  "Skill-based filtering",
                  "Experience level matching",
                  "Location preferences",
                  "Availability status"
                ]}
              />
              <FeatureCard
                icon={<Users className="w-6 h-6 text-green-600" />}
                title="Candidate Management"
                description="Comprehensive tools to manage candidate profiles, track applications, and monitor progress."
                features={[
                  "Profile management",
                  "Application tracking",
                  "Interview scheduling",
                  "Status updates"
                ]}
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
                title="Analytics Dashboard"
                description="Real-time insights and analytics to make data-driven recruitment decisions."
                features={[
                  "Recruitment metrics",
                  "Performance tracking",
                  "Trend analysis",
                  "Custom reports"
                ]}
              />
              <FeatureCard
                icon={<CreditCard className="w-6 h-6 text-orange-600" />}
                title="Subscription Management"
                description="Flexible subscription plans with secure payment processing and billing management."
                features={[
                  "Multiple subscription plans",
                  "Secure payment gateway",
                  "Automatic renewals",
                  "Billing history tracking"
                ]}
              />
              <FeatureCard
                icon={<Building2 className="w-6 h-6 text-indigo-600" />}
                title="Business Settings"
                description="Complete business configuration including company information and tax compliance."
                features={[
                  "Company profile setup",
                  "Tax ID management",
                  "Document uploads",
                  "Financial settings"
                ]}
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-red-600" />}
                title="Advanced User Management"
                description="Comprehensive user access control with role-based permissions and trial management."
                features={[
                  "Role-based access control",
                  "Feature toggles",
                  "Trial user management",
                  "Activity monitoring"
                ]}
              />
            </div>
          </div>
        );

      case 'getting-started':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Getting Started</h1>
              <p className="text-lg text-gray-600">
                Follow these simple steps to get up and running with SG CV Search system.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Info className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-blue-900">Before You Begin</h2>
              </div>
              <p className="text-blue-800">
                Make sure you have received your login credentials from your system administrator. 
                You'll need a valid username and password to access the system.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
              
              <StepCard
                number="1"
                title="Login to the System"
                description="Use your provided credentials to log into the SG CV Search platform. Your access level will determine which features are available to you."
                icon={<User className="w-5 h-5 text-blue-600" />}
              />
              
              <StepCard
                number="2"
                title="Explore the Dashboard"
                description="Familiarize yourself with the main dashboard which provides an overview of candidates, recent activities, and key metrics."
                icon={<BarChart3 className="w-5 h-5 text-green-600" />}
              />
              
              <StepCard
                number="3"
                title="Add Your First Candidate"
                description="Navigate to 'Add Candidate' to input candidate information or upload resumes. The system will automatically extract relevant details."
                icon={<PlusCircle className="w-5 h-5 text-purple-600" />}
              />
              
              <StepCard
                number="4"
                title="Perform Your First Search"
                description="Use the 'Search Skills' feature to find candidates matching specific criteria. Try different search terms to see the system's capabilities."
                icon={<Search className="w-5 h-5 text-orange-600" />}
              />
              
              <StepCard
                number="5"
                title="Review Candidate Profiles"
                description="Click on any candidate to view their detailed profile, including skills, experience, contact information, and uploaded documents."
                icon={<Eye className="w-5 h-5 text-indigo-600" />}
              />
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-green-900">You're Ready!</h3>
              </div>
              <p className="text-green-800">
                Congratulations! You've completed the basic setup. Explore other sections of this help guide 
                to learn about advanced features and best practices.
              </p>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard Overview</h1>
              <p className="text-lg text-gray-600">
                The dashboard is your central hub for monitoring recruitment activities and accessing key insights.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Components</h2>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Candidate Statistics</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      View total candidates, active applications, and recent additions to your talent pool.
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Filter className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Quick Filters</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Access pre-configured filters for common searches like "Recent Candidates", "Available Now", etc.
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Clock className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Track recent candidate additions, profile updates, and system activities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Dashboard Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Real-time Updates</span>
                      <p className="text-sm text-gray-600">Data refreshes automatically to show the latest information</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Interactive Charts</span>
                      <p className="text-sm text-gray-600">Click on chart elements to drill down into specific data</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Quick Actions</span>
                      <p className="text-sm text-gray-600">Access frequently used features directly from the dashboard</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Customizable Views</span>
                      <p className="text-sm text-gray-600">Personalize your dashboard layout and preferences</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'candidate-management':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Candidate Management</h1>
              <p className="text-lg text-gray-600">
                Learn how to effectively manage candidate profiles, add new candidates, and track their progress.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <FeatureCard
                icon={<PlusCircle className="w-6 h-6 text-blue-600" />}
                title="Adding Candidates"
                description="Multiple ways to add candidates to your system"
                features={[
                  "Manual profile creation",
                  "Resume upload and parsing",
                  "Bulk import from spreadsheets",
                  "API integration support"
                ]}
              />
              <FeatureCard
                icon={<Edit className="w-6 h-6 text-green-600" />}
                title="Profile Management"
                description="Comprehensive tools for managing candidate information"
                features={[
                  "Edit personal details",
                  "Update skills and experience",
                  "Add notes and comments",
                  "Track application status"
                ]}
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Candidate Profile Fields</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Full Name</li>
                    <li>• Email Address</li>
                    <li>• Phone Number</li>
                    <li>• Location</li>
                    <li>• Date of Birth</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Professional Details
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Current Position</li>
                    <li>• Experience Level</li>
                    <li>• Skills & Technologies</li>
                    <li>• Education Background</li>
                    <li>• Certifications</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                    Application Status
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Application Date</li>
                    <li>• Current Stage</li>
                    <li>• Interview Schedule</li>
                    <li>• Feedback & Notes</li>
                    <li>• Final Decision</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-600 mr-3" />
                <h3 className="text-lg font-semibold text-yellow-900">Best Practices</h3>
              </div>
              <ul className="space-y-2 text-yellow-800">
                <li>• Keep candidate profiles updated with latest information</li>
                <li>• Use consistent naming conventions for skills and technologies</li>
                <li>• Add detailed notes after each interaction</li>
                <li>• Regularly review and clean up outdated profiles</li>
                <li>• Ensure all required fields are completed</li>
              </ul>
            </div>
          </div>
        );

      case 'search-features':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Features</h1>
              <p className="text-lg text-gray-600">
                Master the powerful search capabilities to find the perfect candidates for your requirements.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Search Types</h2>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Search className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Skill-Based Search</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      Search for candidates based on specific technical skills, programming languages, or technologies.
                    </p>
                    <div className="bg-gray-50 rounded p-3">
                      <code className="text-sm">Example: "React, Node.js, MongoDB"</code>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Filter className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      Use multiple criteria to narrow down your search results effectively.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Experience level (Junior, Mid, Senior)</li>
                      <li>• Location preferences</li>
                      <li>• Availability status</li>
                      <li>• Education background</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <History className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Search History</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Access your previous searches to quickly repeat common queries and track search patterns.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Search Tips</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Use Specific Keywords</h4>
                      <p className="text-sm text-gray-600">Be specific with skill names and technologies for better results</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-green-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Combine Multiple Filters</h4>
                      <p className="text-sm text-gray-600">Use location, experience, and skill filters together</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-purple-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Save Frequent Searches</h4>
                      <p className="text-sm text-gray-600">Bookmark commonly used search criteria for quick access</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-orange-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Review Search Results</h4>
                      <p className="text-sm text-gray-600">Click through to candidate profiles to verify match quality</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'user-management':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">User Management</h1>
              <p className="text-lg text-gray-600">
                Administrative features for managing system users, roles, and permissions.
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-orange-900">Admin Access Required</h2>
              </div>
              <p className="text-orange-800">
                User management features are only available to users with Administrator privileges. 
                Contact your system administrator if you need access to these features.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <FeatureCard
                icon={<Users className="w-6 h-6 text-blue-600" />}
                title="User Administration"
                description="Comprehensive user account management capabilities"
                features={[
                  "Create new user accounts",
                  "Edit user profiles and details",
                  "Assign roles and permissions",
                  "Activate/deactivate accounts"
                ]}
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-green-600" />}
                title="Role Management"
                description="Define and manage user roles and access levels"
                features={[
                  "Admin - Full system access",
                  "HR Manager - Recruitment features",
                  "Recruiter - Basic search and view",
                  "Viewer - Read-only access"
                ]}
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management Actions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <PlusCircle className="w-5 h-5 mr-2 text-blue-600" />
                    Adding New Users
                  </h3>
                  <ol className="space-y-2 text-sm text-gray-600 ml-7">
                    <li>1. Navigate to Settings → User Management</li>
                    <li>2. Click "Add New User" button</li>
                    <li>3. Fill in required user details</li>
                    <li>4. Assign appropriate role</li>
                    <li>5. Set initial password</li>
                    <li>6. Save and send credentials</li>
                  </ol>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Edit className="w-5 h-5 mr-2 text-green-600" />
                    Editing User Profiles
                  </h3>
                  <ol className="space-y-2 text-sm text-gray-600 ml-7">
                    <li>1. Find user in the user list</li>
                    <li>2. Click the edit (pencil) icon</li>
                    <li>3. Modify user information</li>
                    <li>4. Update role if necessary</li>
                    <li>5. Save changes</li>
                    <li>6. Notify user of updates</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-red-900">Security Considerations</h3>
              </div>
              <ul className="space-y-2 text-red-800">
                <li>• Regularly review user access and permissions</li>
                <li>• Deactivate accounts for users who no longer need access</li>
                <li>• Use strong password policies</li>
                <li>• Monitor user activity for suspicious behavior</li>
                <li>• Keep user information up to date</li>
              </ul>
            </div>
          </div>
        );

      case 'troubleshooting':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Troubleshooting</h1>
              <p className="text-lg text-gray-600">
                Common issues and their solutions to help you resolve problems quickly.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                  Common Issues
                </h2>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Login Problems</h3>
                    <p className="text-gray-600 mb-3">Unable to log into the system or authentication errors.</p>
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="font-medium text-gray-900 mb-2">Solutions:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Verify username and password are correct</li>
                        <li>• Check if Caps Lock is enabled</li>
                        <li>• Clear browser cache and cookies</li>
                        <li>• Try using a different browser</li>
                        <li>• Contact administrator for password reset</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Search Not Working</h3>
                    <p className="text-gray-600 mb-3">Search results are empty or not displaying correctly.</p>
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="font-medium text-gray-900 mb-2">Solutions:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Check search terms for typos</li>
                        <li>• Try broader search criteria</li>
                        <li>• Remove some filters to expand results</li>
                        <li>• Refresh the page and try again</li>
                        <li>• Verify database connectivity</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">File Upload Issues</h3>
                    <p className="text-gray-600 mb-3">Problems uploading resumes or documents.</p>
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="font-medium text-gray-900 mb-2">Solutions:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Check file size (max 10MB)</li>
                        <li>• Ensure file format is supported (PDF, DOC, DOCX)</li>
                        <li>• Try uploading a different file</li>
                        <li>• Check internet connection stability</li>
                        <li>• Contact support if issue persists</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Performance Issues</h3>
                    <p className="text-gray-600 mb-3">System running slowly or pages taking long to load.</p>
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="font-medium text-gray-900 mb-2">Solutions:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Close unnecessary browser tabs</li>
                        <li>• Clear browser cache</li>
                        <li>• Check internet connection speed</li>
                        <li>• Try using a different browser</li>
                        <li>• Report persistent issues to IT support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-blue-900">Need More Help?</h3>
                </div>
                <p className="text-blue-800 mb-4">
                  If you're still experiencing issues after trying these solutions, don't hesitate to reach out for support.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800">support@sgcvsearch.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800">+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
              <p className="text-lg text-gray-600">
                Find answers to the most commonly asked questions about the SG CV Search system.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "How do I reset my password?",
                  answer: "Contact your system administrator to request a password reset. They will provide you with new login credentials via email."
                },
                {
                  question: "What file formats are supported for resume uploads?",
                  answer: "The system supports PDF, DOC, and DOCX file formats. Maximum file size is 10MB per upload."
                },
                {
                  question: "How often is the candidate database updated?",
                  answer: "The database is updated in real-time as new candidates are added or existing profiles are modified."
                },
                {
                  question: "Can I export search results?",
                  answer: "Yes, you can export search results to Excel or CSV format using the export button in the search results page."
                },
                {
                  question: "How do I add multiple candidates at once?",
                  answer: "Use the bulk import feature in the 'Add Candidate' section. You can upload a CSV file with multiple candidate records."
                },
                {
                  question: "What browsers are supported?",
                  answer: "The system works best with modern browsers including Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported."
                },
                {
                  question: "How do I change my user preferences?",
                  answer: "Click on your profile icon in the top right corner and select 'Preferences' to customize your settings."
                },
                {
                  question: "Can I schedule automated reports?",
                  answer: "Yes, administrators can set up automated reports that are sent via email on a regular schedule."
                },
                {
                  question: "How do I track candidate application status?",
                  answer: "Use the candidate profile page to update and track application status through different stages of the recruitment process."
                },
                {
                  question: "Is there a mobile app available?",
                  answer: "Currently, the system is web-based and optimized for mobile browsers. A dedicated mobile app is planned for future release."
                },
                {
                  question: "How do I upgrade my subscription plan?",
                  answer: "Go to Settings > Subscription Management to view available plans and upgrade. Payment is processed securely through our payment gateway."
                },
                {
                  question: "What payment methods are accepted?",
                  answer: "We accept all major credit cards, debit cards, and digital payment methods through our secure payment gateway."
                },
                {
                  question: "Can I cancel my subscription anytime?",
                  answer: "Yes, you can cancel your subscription at any time from the Subscription Management section. Your access will continue until the end of the current billing period."
                },
                {
                  question: "How do I update my business information?",
                  answer: "Navigate to Settings > Business Settings to update company details, tax information, and upload required documents."
                },
                {
                  question: "What documents are required for business verification?",
                  answer: "You'll need to provide GST certificate, PAN card, CIN document, and company registration certificate for complete verification."
                },
                {
                  question: "How do I manage user roles and permissions?",
                  answer: "Administrators can manage user access through Settings > Access Management, where you can create users, assign roles, and control feature access."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200">
                  <button
                    onClick={() => toggleSection(`faq-${index}`)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    {expandedSections[`faq-${index}`] ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections[`faq-${index}`] && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="text-center">
                <Lightbulb className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Still Have Questions?</h3>
                <p className="text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help!
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="flex items-center bg-white rounded-lg px-4 py-2">
                    <Mail className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-gray-700">support@sgcvsearch.com</span>
                  </div>
                  <div className="flex items-center bg-white rounded-lg px-4 py-2">
                    <Phone className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-gray-700">+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'subscription-management':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Management</h1>
              <p className="text-lg text-gray-600">
                Manage your subscription plans, billing, and payment methods to ensure uninterrupted access to SG CV Search features.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Flexible Subscription Plans
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Choose from our range of subscription plans designed to meet different business needs. 
                    From monthly plans for small teams to yearly plans for enterprise organizations.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Crown className="w-5 h-5 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">Premium Features</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-blue-500 mr-1" />
                      <span className="text-sm font-medium">Secure Payments</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Available Plans</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monthly Plan</span>
                      <span className="font-semibold text-blue-600">₹99/month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quarterly Plan</span>
                      <span className="font-semibold text-green-600">₹249/quarter</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Half-Yearly Plan</span>
                      <span className="font-semibold text-purple-600">₹445/6 months</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Yearly Plan</span>
                      <span className="font-semibold text-orange-600">₹831/year</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<CreditCard className="w-6 h-6 text-blue-600" />}
                title="Plan Selection"
                description="Choose the subscription plan that best fits your organization's needs and budget."
                features={[
                  "Compare plan features",
                  "View pricing details",
                  "See savings on longer plans",
                  "Popular plan recommendations"
                ]}
              />
              <FeatureCard
                icon={<DollarSign className="w-6 h-6 text-green-600" />}
                title="Payment Processing"
                description="Secure payment processing with multiple payment methods and automatic billing."
                features={[
                  "Credit/Debit card payments",
                  "UPI and digital wallets",
                  "Automatic renewals",
                  "Payment history tracking"
                ]}
              />
              <FeatureCard
                icon={<Calendar className="w-6 h-6 text-purple-600" />}
                title="Subscription Management"
                description="Full control over your subscription including upgrades, downgrades, and cancellations."
                features={[
                  "View current subscription",
                  "Upgrade/downgrade plans",
                  "Cancel subscription",
                  "Billing history access"
                ]}
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">How to Manage Your Subscription</h2>
              
              <div className="space-y-4">
                <StepCard
                  number="1"
                  title="Access Subscription Settings"
                  description="Navigate to Settings > Subscription Management to view your current plan and available options."
                  icon={<Settings className="w-5 h-5 text-blue-600" />}
                />
                
                <StepCard
                  number="2"
                  title="Choose Your Plan"
                  description="Browse available subscription plans, compare features, and select the one that meets your needs."
                  icon={<Crown className="w-5 h-5 text-yellow-600" />}
                />
                
                <StepCard
                  number="3"
                  title="Complete Payment"
                  description="Enter your payment details and complete the secure checkout process to activate your subscription."
                  icon={<CreditCard className="w-5 h-5 text-green-600" />}
                />
                
                <StepCard
                  number="4"
                  title="Enjoy Premium Features"
                  description="Access all the features included in your plan and track your usage through the subscription dashboard."
                  icon={<Star className="w-5 h-5 text-purple-600" />}
                />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
                <h3 className="text-lg font-semibold text-yellow-900">Important Notes</h3>
              </div>
              <ul className="space-y-2 text-yellow-800">
                <li>• Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>• You can upgrade or downgrade your plan at any time</li>
                <li>• Refunds are processed according to our refund policy</li>
                <li>• All payments are processed securely through encrypted channels</li>
                <li>• Contact support for any billing or subscription-related queries</li>
              </ul>
            </div>
          </div>
        );

      case 'business-settings':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Settings</h1>
              <p className="text-lg text-gray-600">
                Configure your organization's business information, tax details, and operational settings.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Complete Business Configuration
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Set up your company information, tax identification numbers, and business preferences 
                    to ensure compliance and proper documentation for all recruitment activities.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-blue-500 mr-1" />
                      <span className="text-sm font-medium">Company Profile</span>
                    </div>
                    <div className="flex items-center">
                      <FileImage className="w-5 h-5 text-green-500 mr-1" />
                      <span className="text-sm font-medium">Document Management</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Configuration Areas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">Company Information</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">Tax & Legal Details</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">Financial Settings</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">Document Upload</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FeatureCard
                icon={<Building2 className="w-6 h-6 text-blue-600" />}
                title="Company Information"
                description="Manage your organization's basic information and contact details."
                features={[
                  "Company name and address",
                  "Contact information",
                  "Website and email",
                  "Company logo upload"
                ]}
              />
              <FeatureCard
                icon={<FileText className="w-6 h-6 text-green-600" />}
                title="Legal & Tax Details"
                description="Configure tax identification numbers and legal compliance information."
                features={[
                  "GST number validation",
                  "PAN card information",
                  "CIN registration details",
                  "Tax ID management"
                ]}
              />
              <FeatureCard
                icon={<DollarSign className="w-6 h-6 text-purple-600" />}
                title="Financial Settings"
                description="Set up currency preferences and fiscal year configuration."
                features={[
                  "Default currency selection",
                  "Fiscal year start month",
                  "Financial reporting settings",
                  "Currency conversion rates"
                ]}
              />
              <FeatureCard
                icon={<Upload className="w-6 h-6 text-orange-600" />}
                title="Document Management"
                description="Upload and manage important business documents and certificates."
                features={[
                  "Certificate uploads",
                  "Legal document storage",
                  "Compliance documentation",
                  "Document version control"
                ]}
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Setting Up Business Configuration</h2>
              
              <div className="space-y-4">
                <StepCard
                  number="1"
                  title="Access Business Settings"
                  description="Navigate to Settings > Business Settings to begin configuring your organization's information."
                  icon={<Settings className="w-5 h-5 text-blue-600" />}
                />
                
                <StepCard
                  number="2"
                  title="Enter Company Details"
                  description="Fill in your company name, address, contact information, and upload your company logo."
                  icon={<Building2 className="w-5 h-5 text-green-600" />}
                />
                
                <StepCard
                  number="3"
                  title="Configure Tax Information"
                  description="Enter your GST number, PAN details, CIN, and other tax identification information."
                  icon={<FileText className="w-5 h-5 text-purple-600" />}
                />
                
                <StepCard
                  number="4"
                  title="Set Financial Preferences"
                  description="Choose your default currency and set your fiscal year start month for reporting."
                  icon={<DollarSign className="w-5 h-5 text-orange-600" />}
                />
                
                <StepCard
                  number="5"
                  title="Upload Documents"
                  description="Upload important business documents, certificates, and compliance documentation."
                  icon={<Upload className="w-5 h-5 text-indigo-600" />}
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Info className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900">Validation & Compliance</h3>
              </div>
              <div className="text-blue-800 space-y-2">
                <p>• GST numbers are automatically validated against the standard format</p>
                <p>• PAN card information is verified for correct format and structure</p>
                <p>• CIN validation ensures proper company identification number format</p>
                <p>• All uploaded documents are securely stored and encrypted</p>
                <p>• Regular backups ensure your business information is always protected</p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a section from the sidebar to view help content.</div>;
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Help Center</h1>
              <p className="text-sm text-gray-600">SG CV Search Documentation</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {section.icon}
                <span className="ml-3 font-medium">{section.title}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Version Info</span>
            </div>
            <p className="text-sm text-blue-800">SG CV Search v2.1.0</p>
            <p className="text-xs text-blue-600">Last updated: January 2025</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Help;