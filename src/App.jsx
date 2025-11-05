import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search,
  User,
  Users,
  LogOut,
  PlusCircle,
  UserPlus,
  History,
  BookOpen,
  FileText,
  Clock,
  X,
  Trash2,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  PanelLeftClose,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  UserCheck,
  Briefcase,
  Award,
} from "lucide-react";
import { api } from "./api";
import ResumeCard from './components/ResumeCard';
import Login from './components/Login';
import CandidateForm from './components/CandidateForm';
import Dashboard from './components/Dashboard';
import CandidatesList from './components/CandidatesList';
import ConvertCandidate from './components/ConvertCandidate';
import Settings from './components/Settings';
import Help from './components/Help';
import CandidateDetailsModal from './components/CandidateDetailsModal';
import CustomerOnboarding from './components/CustomerOnboarding';
import EmployeeManagement from './components/EmployeeManagement';
import PerformanceEvaluation from './components/PerformanceEvaluation';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Existing state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const historyRef = useRef(null);
  
  // Modal state for candidate details
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Company logo state
  const [companyLogo, setCompanyLogo] = useState(null);

  // Load search history and check for existing token on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history:", e);
        localStorage.removeItem("searchHistory");
      }
    }

    // Check for existing token
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse saved user data:", e);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Load saved company logo
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      setCompanyLogo(savedLogo);
    }
  }, []);

  // Close history dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [searchTimeout, loadingTimeout]);

  // Authentication functions
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    // Clear the JWT token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Listen for global auth-expiry events and redirect to login
  useEffect(() => {
    const onAuthExpired = (e) => {
      console.warn('Auth expired, redirecting to login.', e?.detail);
      // Ensure local state reflects logout
      setIsAuthenticated(false);
      setUser(null);
    };
    window.addEventListener('auth:expired', onAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', onAuthExpired);
    };
  }, []);

  // Company logo functions
  const updateCompanyLogo = (logoDataUrl) => {
    setCompanyLogo(logoDataUrl);
    if (logoDataUrl) {
      localStorage.setItem('companyLogo', logoDataUrl);
    } else {
      localStorage.removeItem('companyLogo');
    }
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Save search history to localStorage
  const saveSearchHistory = (history) => {
    try {
      localStorage.setItem("searchHistory", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save search history:", e);
    }
  };

  // Add search to history (limit to 30 entries)
  const addToSearchHistory = (query) => {
    if (!query.trim()) return;

    const newHistory = [
      { query: query.trim(), timestamp: new Date().toISOString() },
      ...searchHistory.filter((item) => item.query !== query.trim()),
    ].slice(0, 30);

    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
  };

  // Clear all search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  // Remove individual search from history
  const removeFromHistory = (queryToRemove) => {
    const newHistory = searchHistory.filter(
      (item) => item.query !== queryToRemove
    );
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
  };

  const handleSearch = async (e, queryOverride = null) => {
    e.preventDefault();
    const query = queryOverride || searchQuery;
    
    if (!query.trim()) return;

    // Clear any existing loading timeout and set new one
    setLoadingTimeout(prevTimeout => {
      if (prevTimeout) {
        clearTimeout(prevTimeout);
      }
      
      return setTimeout(() => {
        setLoading(true);
      }, 100);
    });

    setError("");
    setCurrentPage(1);
    setHasSearched(true);
    setShowHistory(false);

    try {
      const response = await api.searchCandidates({
        query: query.trim(),
        skills: [],
        experience_min: 0,
        experience_max: 20,
        location: "",
      });
    
      // Clear loading timeout since we got results
      setLoadingTimeout(prevTimeout => {
        if (prevTimeout) {
          clearTimeout(prevTimeout);
        }
        return null;
      });
      
      // Ensure we have a valid response with data
      if (response && response.success) {
        setSearchResults(response.data || []);
        // Add to search history only on successful search
        addToSearchHistory(query.trim());
      } else {
        setError(response?.error || "Search failed. Please try again.");
        setSearchResults([]);
      }
    } catch (err) {
      setError("Failed to search candidates. Please check your connection and try again.");
      setSearchResults([]);
      console.error("Search error:", err);
    } finally {
      // Clear loading timeout and set loading to false
      setLoadingTimeout(prevTimeout => {
        if (prevTimeout) {
          clearTimeout(prevTimeout);
        }
        return null;
      });
      setLoading(false);
    }
  };

  // Handle clicking on a history item
  const handleHistoryClick = useCallback((query) => {
    setSearchQuery(query);
    setShowHistory(false);
    // Trigger search with the selected query
    handleSearchFromHistory(query);
  }, []);

  // Memoized callback for ResumeCard interactions
  const handleCandidateView = useCallback((candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  }, []);

  const handleCandidateDownload = useCallback(async (candidate) => {
    try {
      const resumeId = candidate['Resume ID'] || candidate.id;
      if (resumeId) {
        await api.downloadResume(resumeId);
      } else {
        console.error('Resume ID not found for candidate:', candidate);
        alert('Resume ID not found. Cannot download resume.');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download resume. Please try again.');
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  }, []);

  // Debounced search function to prevent excessive API calls
  const debouncedSearch = useCallback((query, delay = 300) => {
    setSearchTimeout(prevTimeout => {
      if (prevTimeout) {
        clearTimeout(prevTimeout);
      }
      
      return setTimeout(() => {
        if (query.trim()) {
          handleSearch({ preventDefault: () => {} }, query);
        }
      }, delay);
    });
  }, []);

  // Memoized pagination calculations to prevent unnecessary recalculations
  const paginationData = useMemo(() => {
    const resultsPerPage = 6;
    const totalPages = Math.ceil(searchResults.length / resultsPerPage);
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const currentResults = searchResults.slice(startIndex, endIndex);
    
    return {
      resultsPerPage,
      totalPages,
      startIndex,
      endIndex,
      currentResults
    };
  }, [searchResults, currentPage]);

  // Extract values for backward compatibility
  const { totalPages, startIndex, currentResults } = paginationData;

  const handleSearchFromHistory = async (query) => {
    setLoading(true);
    setError("");
    setCurrentPage(1);
    setHasSearched(true);

    try {
      const response = await api.searchCandidates({
        query: query.trim(),
        skills: [],
        experience_min: 0,
        experience_max: 20,
        location: "",
      });
      
      // Ensure we have a valid response with data
      if (response && response.success) {
        setSearchResults(response.data || []);
      } else {
        setError(response?.error || "Search failed. Please try again.");
        setSearchResults([]);
      }
    } catch (err) {
      setError("Failed to search candidates. Please check your connection and try again.");
      setSearchResults([]);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-50 shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Left */}
            <div className="flex items-center">
              <img
                src={companyLogo || "/SGLogo_04.jpg"}
                alt="Company Logo"
                className="h-12 w-auto max-w-[200px] rounded-lg shadow-md object-contain"
              />
            </div>
            
            {/* Centered Title */}
            <h1 className="text-2xl font-bold text-gray-800 absolute left-1/2 transform -translate-x-1/2 tracking-wide">
              🏢 Hiring Portal
            </h1>
            
            {/* User Profile Section - Extreme Right */}
            <div className="flex items-center space-x-5">
              <div className="text-right">
                <p className="text-base font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-600">{formatTime(currentTime)}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-3 text-base text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-4rem)] pt-20">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col shadow-lg transition-all duration-300 ease-in-out overflow-hidden`}>
          {/* Navigation Header with Toggle */}
          <div className={`${sidebarCollapsed ? 'p-1' : 'p-4'} border-b border-gray-200 transition-all duration-300 relative flex justify-end`}>
            {/* Toggle Button - Modern Design */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`flex items-center justify-center ${sidebarCollapsed ? 'w-10 h-10' : 'w-10 h-10'} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group`}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronsRight className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <ChevronsLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
            </button>
          </div>
          
          {/* Navigation Tabs */}
          <nav className={`${sidebarCollapsed ? 'p-2' : 'p-6'} transition-all duration-300`}>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-4'} text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }`}
                title={sidebarCollapsed ? "Dashboard" : ""}
              >
                <BarChart3 className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                {!sidebarCollapsed && <span className="text-base font-semibold">Dashboard</span>}
              </button>
              {user && (user.role === 'Admin' || user.role === 'admin' || user.role === 'HR' || user.role === 'hr') && (
                <button
                  onClick={() => setActiveTab("candidate")}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-4'} text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    activeTab === "candidate"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                  title={sidebarCollapsed ? "Add Candidate" : ""}
                >
                  <PlusCircle className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                  {!sidebarCollapsed && <span className="text-base font-semibold">Add Candidate</span>}
                </button>
              )}
              <button
                onClick={() => setActiveTab("search")}
                className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-4'} text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  activeTab === "search"
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                }`}
                title={sidebarCollapsed ? "Search Skills" : ""}
              >
                <UserPlus className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                {!sidebarCollapsed && <span className="text-base font-semibold">Search Skills</span>}
              </button>
              {user && (user.role === 'Admin' || user.role === 'admin' || user.role === 'HR' || user.role === 'hr') && (
                <button
                  onClick={() => setActiveTab("candidates")}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-4'} text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    activeTab === "candidates"
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                  title={sidebarCollapsed ? "Candidates List" : ""}
                >
                  <Users className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                  {!sidebarCollapsed && <span className="text-base font-semibold">Candidates List</span>}
                </button>
              )}

              {user && (user.role === 'Admin' || user.role === 'admin' || user.role === 'HR' || user.role === 'hr') && (
                <button
                  onClick={() => setActiveTab("convert")}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-4'} text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    activeTab === "convert"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                  title={sidebarCollapsed ? "Convert Candidate" : ""}
                >
                  <UserCheck className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                  {!sidebarCollapsed && <span className="text-base font-semibold">Convert Candidate</span>}
                </button>
              )}

              {user && (user.role === 'Admin' || user.role === 'admin' || user.role === 'HR' || user.role === 'hr') && (
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-4'} text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    activeTab === "customers"
                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                  title={sidebarCollapsed ? "Customer Onboarding" : ""}
                >
                  <Building2 className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                  {!sidebarCollapsed && <span className="text-base font-semibold">Customer Onboarding</span>}
                </button>
              )}

              {user && (user.role === 'Admin' || user.role === 'admin' || user.role === 'HR' || user.role === 'hr') && (
                <button
                  onClick={() => setActiveTab("employees")}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-4'} text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    activeTab === "employees"
                      ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                  title={sidebarCollapsed ? "Employee Management" : ""}
                >
                  <Briefcase className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                  {!sidebarCollapsed && <span className="text-base font-semibold">Employee Management</span>}
                </button>
              )}

              {user && (['Admin','admin','HR','hr','Manager','manager','Director','director','Employee','employee'].includes(user.role)) && (
                <button
                  onClick={() => setActiveTab("performance")}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-4'} text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    activeTab === "performance"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                  title={sidebarCollapsed ? "Performance Evaluation" : ""}
                >
                  <Award className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                  {!sidebarCollapsed && <span className="text-base font-semibold">Performance Evaluation</span>}
                </button>
              )}

              {user && (user.role === 'Admin' || user.role === 'admin') && (
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-4'} text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    activeTab === "settings"
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                  title={sidebarCollapsed ? "Settings" : ""}
                >
                  <SettingsIcon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                  {!sidebarCollapsed && <span className="text-base font-semibold">Settings</span>}
                </button>
              )}
              <button
                onClick={() => setActiveTab("help")}
                className={`w-full flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-5 py-4'} text-left rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  activeTab === "help"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                }`}
                title={sidebarCollapsed ? "Help" : ""}
              >
                <BookOpen className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-4'}`} />
                {!sidebarCollapsed && <span className="text-base font-semibold">Help</span>}
              </button>
            </div>
          </nav>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">

          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
          {activeTab === 'dashboard' && (
            <Dashboard onNavigateToList={(filter) => {
              setDashboardFilter(filter);
              setActiveTab('candidates');
            }} />
          )}
          
          {activeTab === "candidates" && (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-full p-4">
                <CandidatesList user={user} dashboardFilter={dashboardFilter} />
              </div>
            </div>
          )}

          {activeTab === "convert" && (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-full p-4">
                <ConvertCandidate />
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-full p-4">
                <CustomerOnboarding user={user} />
              </div>
            </div>
          )}
          
          {activeTab === "candidate" && (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-full p-4 lg:p-6 xl:p-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 lg:px-6 xl:px-8 py-4 lg:py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-2xl font-bold text-gray-900">✨ Add New Candidate</h2>
                    <p className="text-base text-gray-600 mt-2">Fill in the candidate information below</p>
                  </div>
                  <CandidateForm />
                </div>
              </div>
            </div>
          )}

          {activeTab === "employees" && (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-full p-4 lg:p-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 lg:px-6 py-4 lg:py-6 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50">
                    <h2 className="text-2xl font-bold text-gray-900">👔 Employee Management</h2>
                    <p className="text-base text-gray-600 mt-2">Manage employees, import/export, and perform CRUD operations</p>
                  </div>
                  <div className="p-4 lg:p-6">
                    <EmployeeManagement user={user} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-full h-full p-4 lg:p-6">
                <PerformanceEvaluation user={user} />
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div className="flex flex-col h-full">
              {/* Search Bar Section - Fixed Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-8 py-6">
                <div className="w-full">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Search Candidates</h2>
                  <div className="relative" ref={historyRef}>
                    <form onSubmit={handleSearch} className="relative">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSearchQuery(value);
                            if (value.trim()) {
                              debouncedSearch(value);
                            }
                          }}
                          placeholder="Search for candidates by skills, experience, or keywords..."
                          className="w-full pl-12 pr-24 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                          onFocus={() => setShowHistory(searchHistory.length > 0)}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowHistory(!showHistory)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                          >
                            <History className="w-5 h-5" />
                          </button>
                          <button
                            type="submit"
                            disabled={loading || !searchQuery.trim()}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-md"
                          >
                            <ArrowUp className="w-5 h-5" />
                          </button>
                        </div>
                        {/* Search History Dropdown */}
                        {showHistory && searchHistory.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            <div className="p-3 border-b border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Recent Searches
                                  </span>
                                </div>
                                <button
                                  onClick={() => setShowHistory(false)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="py-2">
                              {searchHistory.slice(0, 10).map((item, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleHistoryClick(item.query)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center group"
                                >
                                  <div className="flex items-center flex-1 min-w-0">
                                    <Search className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-sm text-gray-700 truncate">
                                      {item.query}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromHistory(item.query);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            
              {/* Content Area - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {/* Enhanced Loading State */}
                {loading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md mx-auto px-6">
                      <div className="relative mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Search className="w-6 h-6 text-blue-600 animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Searching Candidates
                      </h3>
                      <p className="text-gray-600 mb-4">
                        We're scanning through our database to find the best matches for your search...
                      </p>
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              
                {/* Error Message */}
                {error && (
                  <div className="flex justify-center py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                )}
              
                {/* Welcome State - When no search has been performed */}
                {!hasSearched && !loading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md mx-auto px-6">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Find the Perfect Candidate
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Search through our database of qualified candidates using skills, experience, location, and more.
                      </p>
                      <div className="text-left bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Search Tips:</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Use specific skills like "React", "Python", "AWS"</li>
                          <li>• Try location-based searches</li>
                          <li>• Search by years of experience</li>
                          <li>• Try specific technologies or certifications</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              
                {/* Results Grid */}
                {hasSearched && !loading && !error && (
                  <div className="w-full px-6 py-6">
                    {searchResults.length > 0 ? (
                      <div>
                        {/* Enhanced Search Results Header */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-sm font-medium text-gray-900">
                                  Found{" "}
                                  <span className="text-blue-600 font-semibold">
                                    {searchResults.length}
                                  </span>{" "}
                                  {searchResults.length === 1 ? 'candidate' : 'candidates'}
                                </p>
                              </div>
                              {searchResults.length > paginationData.resultsPerPage && (
                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  Showing {Math.min(paginationData.resultsPerPage, searchResults.length)} per page
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Page {currentPage} of {paginationData.totalPages}
                            </div>
                          </div>
                          {searchQuery && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500">
                                Search query: <span className="font-medium text-gray-700">"{searchQuery}"</span>
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                          {currentResults.map((candidate, index) => (
                            <ResumeCard
                              key={candidate['Resume ID'] || candidate.Email || candidate.Name || `candidate-${startIndex + index}`}
                              candidate={candidate}
                              onView={handleCandidateView}
                              onDownload={handleCandidateDownload}
                            />
                          ))}
                        </div>
                        {/* Enhanced Pagination Controls */}
                        {paginationData.totalPages > 1 && (
                          <div className="flex flex-col items-center space-y-4 pb-6">
                            <div className="flex items-center justify-center space-x-4">
                              <button
                                onClick={() =>
                                  setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                className="group relative flex items-center justify-center w-12 h-12 rounded-lg bg-white border border-gray-300 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                              >
                                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                                <span className="sr-only">Previous page</span>
                              </button>

                              <div className="flex items-center space-x-3 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <span className="text-sm font-medium text-gray-700">
                                  Page {currentPage} of {paginationData.totalPages}
                                </span>
                                <div className="w-px h-4 bg-gray-300"></div>
                                <span className="text-xs text-gray-500">
                                  {searchResults.length} results
                                </span>
                              </div>

                              <button
                                onClick={() =>
                                  setCurrentPage(
                                    Math.min(paginationData.totalPages, currentPage + 1)
                                  )
                                }
                                disabled={currentPage === paginationData.totalPages}
                                className="group relative flex items-center justify-center w-12 h-12 rounded-lg bg-white border border-gray-300 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                              >
                                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                                <span className="sr-only">Next page</span>
                              </button>
                            </div>
                            
                            {/* Page indicator dots for visual feedback */}
                            {paginationData.totalPages <= 10 && (
                              <div className="flex items-center space-x-2">
                                {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                      page === currentPage
                                        ? 'bg-blue-600 w-6'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                  >
                                    <span className="sr-only">Go to page {page}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <Search className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No candidates found
                        </h3>
                        <p className="text-gray-600">
                          Try adjusting your search terms or criteria.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-full p-4 lg:p-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 lg:px-6 py-4 lg:py-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <h2 className="text-2xl font-bold text-gray-900">⚙️ Settings</h2>
                    <p className="text-base text-gray-600 mt-2">Manage your application preferences</p>
                  </div>
                  <div className="p-4 lg:p-6">
                    <Settings user={user} updateCompanyLogo={updateCompanyLogo} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "help" && (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="w-full max-w-6xl mx-auto p-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                    <h2 className="text-2xl font-bold text-gray-900">📚 Help Center</h2>
                    <p className="text-base text-gray-600 mt-2">Get assistance and learn how to use the platform</p>
                  </div>
                  <div className="p-8">
                    <Help />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Candidate Details Modal */}
      <CandidateDetailsModal
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
