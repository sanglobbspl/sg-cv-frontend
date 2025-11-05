import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Users,
  UserPlus,
  Shield,
  ToggleLeft,
  ToggleRight,
  Clock,
  Key,
  Database,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  X,
  Building2,
  CreditCard
} from 'lucide-react';
import { api } from '../api';
import BusinessSettings from './BusinessSettings';
import SubscriptionManagement from './SubscriptionManagement';

const Settings = ({ user, updateCompanyLogo }) => {
  const [activeSection, setActiveSection] = useState('access');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Access Management State
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([
    { id: 1, name: 'Admin', permissions: ['all'], color: 'red' },
    { id: 2, name: 'HR Manager', permissions: ['candidates', 'interviews', 'reports'], color: 'blue' },
    { id: 3, name: 'Recruiter', permissions: ['candidates', 'interviews'], color: 'green' },
    { id: 4, name: 'Viewer', permissions: ['view_only'], color: 'gray' }
  ]);

  // User Creation State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Viewer',
    department: '',
    location: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: ''
  });

  // Delete User State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Feature Toggles State
  const [features, setFeatures] = useState({
    candidateSearch: { enabled: true, description: 'Allow searching through candidate database' },
    bulkImport: { enabled: true, description: 'Enable bulk candidate import functionality' },
    emailNotifications: { enabled: true, description: 'Send email notifications for important events' },
    advancedFilters: { enabled: true, description: 'Advanced filtering options in candidate search' },
    exportData: { enabled: true, description: 'Allow data export functionality' },
    apiAccess: { enabled: false, description: 'Enable API access for third-party integrations' },
    auditLogs: { enabled: true, description: 'Track and log all user activities' },
    twoFactorAuth: { enabled: false, description: 'Require two-factor authentication for login' },
    customerPortal: { enabled: true, description: 'Enable customer portal access and management' },
    customerOnboarding: { enabled: true, description: 'Customer onboarding workflow and tracking' },
    customerInteractions: { enabled: true, description: 'Track and manage customer interactions' },
    customerAnalytics: { enabled: true, description: 'Customer analytics and reporting dashboard' },
    commercialInfo: { enabled: true, description: 'Display commercial information for active customers' },
    enhancedModals: { enabled: true, description: 'Enhanced view and edit modals with modern design' },
    roleBasedAccess: { enabled: true, description: 'Role-based access control and permissions' },
    dashboardCustomization: { enabled: true, description: 'Customizable dashboard layouts and widgets' }
  });

  // Trial Access State
  const [trialUsers, setTrialUsers] = useState([]);
  const [trialSettings, setTrialSettings] = useState({
    duration: 30,
    maxUsers: 5,
    features: ['candidateSearch', 'basicReports'],
    autoExpire: true
  });

  // Load data on component mount
  useEffect(() => {
    loadUsers();
    loadTrialUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockUsers = [
        {
          id: 1,
          name: 'John Admin',
          email: 'admin@company.com',
          role: 'Admin',
          department: 'IT',
          location: 'New York',
          status: 'active',
          lastLogin: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Sarah HR',
          email: 'hr@company.com',
          role: 'HR Manager',
          department: 'Human Resources',
          location: 'San Francisco',
          status: 'active',
          lastLogin: '2024-01-14T15:45:00Z',
          createdAt: '2024-01-02T00:00:00Z'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const loadTrialUsers = async () => {
    try {
      // Mock trial users data
      const mockTrialUsers = [
        {
          id: 1,
          name: 'Trial User 1',
          email: 'trial1@example.com',
          startDate: '2024-01-10T00:00:00Z',
          endDate: '2024-02-09T23:59:59Z',
          status: 'active',
          usage: { searches: 45, exports: 2 }
        },
        {
          id: 2,
          name: 'Trial User 2',
          email: 'trial2@example.com',
          startDate: '2024-01-05T00:00:00Z',
          endDate: '2024-02-04T23:59:59Z',
          status: 'expired',
          usage: { searches: 120, exports: 5 }
        }
      ];
      setTrialUsers(mockTrialUsers);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load trial users' });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUser.password !== newUser.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      setLoading(true);
      // Mock API call - replace with actual implementation
      const createdUser = {
        id: users.length + 1,
        ...newUser,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      
      setUsers([...users, createdUser]);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: 'Viewer',
        department: '',
        location: '',
        password: '',
        confirmPassword: ''
      });
      setMessage({ type: 'success', text: 'User created successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (featureKey) => {
    setFeatures(prev => ({
      ...prev,
      [featureKey]: {
        ...prev[featureKey],
        enabled: !prev[featureKey].enabled
      }
    }));
    setMessage({ type: 'success', text: `Feature ${features[featureKey].enabled ? 'disabled' : 'enabled'} successfully` });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: user.department,
      location: user.location
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Mock API call - replace with actual implementation
      const updatedUsers = users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...editUserData }
          : user
      );
      setUsers(updatedUsers);
      setShowEditModal(false);
      setEditingUser(null);
      setMessage({ type: 'success', text: 'User updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual implementation
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      setShowDeleteModal(false);
      setUserToDelete(null);
      setMessage({ type: 'success', text: 'User deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = (userId, newStatus) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    setMessage({ type: 'success', text: `User ${newStatus} successfully` });
  };

  const extendTrialAccess = (userId, days) => {
    setTrialUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newEndDate = new Date(user.endDate);
        newEndDate.setDate(newEndDate.getDate() + days);
        return { ...user, endDate: newEndDate.toISOString(), status: 'active' };
      }
      return user;
    }));
    setMessage({ type: 'success', text: `Trial access extended by ${days} days` });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role) => {
    const roleObj = roles.find(r => r.name === role);
    return roleObj ? roleObj.color : 'gray';
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="w-full p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <SettingsIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage system configuration and admin activities</p>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 flex items-center ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {message.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
              {message.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
              {message.type === 'info' && <Info className="w-5 h-5 mr-2" />}
              <span>{message.text}</span>
              <button 
                onClick={() => setMessage({ type: '', text: '' })}
                className="ml-auto text-current hover:opacity-70"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4 lg:gap-6">
          {/* Sidebar Navigation */}
          <div className="w-56 lg:w-64 xl:w-72 bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-fit">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('access')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'access'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-4 h-4 mr-3" />
                Access Management
              </button>
              <button
                onClick={() => setActiveSection('users')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'users'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <UserPlus className="w-4 h-4 mr-3" />
                User Creation
              </button>
              <button
                onClick={() => setActiveSection('features')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'features'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ToggleLeft className="w-4 h-4 mr-3" />
                Feature Toggles
              </button>
              <button
                onClick={() => setActiveSection('trial')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'trial'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4 mr-3" />
                Trial Access
              </button>
              <button
                onClick={() => setActiveSection('business')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'business'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Building2 className="w-4 h-4 mr-3" />
                Business Settings
              </button>
              <button
                onClick={() => setActiveSection('subscription')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'subscription'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-4 h-4 mr-3" />
                Manage Subscription
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Access Management Section */}
            {activeSection === 'access' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Access Management</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage user roles and permissions</p>
                </div>
                <div className="p-6">
                  {/* Roles Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Roles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {roles.map(role => (
                        <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{role.name}</h4>
                            <span className={`w-3 h-3 rounded-full bg-${role.color}-500`}></span>
                          </div>
                          <div className="space-y-1">
                            {role.permissions.map(permission => (
                              <span key={permission} className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mr-1">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Users Table */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">System Users</h3>
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Login</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{user.department}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => handleEditUser(user)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                    title="Edit User"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  {user.status === 'active' ? (
                                    <button 
                                      onClick={() => updateUserStatus(user.id, 'suspended')}
                                      className="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50"
                                      title="Suspend User"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => updateUserStatus(user.id, 'active')}
                                      className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                      title="Activate User"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Creation Section */}
            {activeSection === 'users' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
                  <p className="text-sm text-gray-600 mt-1">Add new users to the system</p>
                </div>
                <div className="p-6">
                  <form onSubmit={handleCreateUser} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role *
                        </label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.name}>{role.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          value={newUser.department}
                          onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={newUser.location}
                          onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          value={newUser.confirmPassword}
                          onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {loading ? 'Creating...' : 'Create User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Feature Toggles Section */}
            {activeSection === 'features' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Feature Toggles</h2>
                  <p className="text-sm text-gray-600 mt-1">Enable or disable system features</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {Object.entries(features).map(([key, feature]) => (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        </div>
                        <button
                          onClick={() => toggleFeature(key)}
                          className={`flex items-center p-1 rounded-full transition-colors ${
                            feature.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          {feature.enabled ? (
                            <ToggleRight className="w-6 h-6 text-white" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-gray-600" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Trial Access Section */}
            {activeSection === 'trial' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Trial Access Management</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage trial users and access settings</p>
                </div>
                <div className="p-6">
                  {/* Trial Settings */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Trial Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trial Duration (days)
                        </label>
                        <input
                          type="number"
                          value={trialSettings.duration}
                          onChange={(e) => setTrialSettings({...trialSettings, duration: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Trial Users
                        </label>
                        <input
                          type="number"
                          value={trialSettings.maxUsers}
                          onChange={(e) => setTrialSettings({...trialSettings, maxUsers: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Auto Expire
                        </label>
                        <button
                          onClick={() => setTrialSettings({...trialSettings, autoExpire: !trialSettings.autoExpire})}
                          className={`flex items-center p-1 rounded-full transition-colors ${
                            trialSettings.autoExpire ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          {trialSettings.autoExpire ? (
                            <ToggleRight className="w-6 h-6 text-white" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-gray-600" />
                          )}
                        </button>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Save className="w-4 h-4 mr-2" />
                          Save Settings
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Trial Users Table */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Trial Users</h3>
                      <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Trial User
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trial Period</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Usage</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {trialUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm">
                                  <div>{formatDate(user.startDate)} - {formatDate(user.endDate)}</div>
                                  <div className="text-gray-500">
                                    {Math.ceil((new Date(user.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm">
                                  <div>Searches: {user.usage.searches}</div>
                                  <div>Exports: {user.usage.exports}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => extendTrialAccess(user.id, 30)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Extend
                                  </button>
                                  <button className="text-red-600 hover:text-red-800">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Settings Section */}
            {activeSection === 'business' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <BusinessSettings updateCompanyLogo={updateCompanyLogo} />
              </div>
            )}

            {/* Subscription Management Section */}
            {activeSection === 'subscription' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <SubscriptionManagement />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editUserData.phone}
                  onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editUserData.role}
                  onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editUserData.department}
                  onChange={(e) => setEditUserData({...editUserData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editUserData.location}
                  onChange={(e) => setEditUserData({...editUserData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mr-4" />
                <div>
                  <p className="text-gray-900 font-medium">Are you sure you want to delete this user?</p>
                  <p className="text-sm text-gray-600 mt-1">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">{userToDelete.name}</p>
                <p className="text-sm text-gray-600">{userToDelete.email}</p>
                <p className="text-sm text-gray-600">{userToDelete.role} • {userToDelete.department}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;