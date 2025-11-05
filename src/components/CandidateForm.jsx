import React, { useState, useEffect } from 'react';
import { 
  Upload, User, Mail, Phone, Award, Calendar, CheckCircle, AlertCircle, X, 
  Building, MapPin, GraduationCap, IndianRupee, Clock, FileText, Star,
  ChevronRight, ChevronLeft, Save, Send, Plus, Trash2
} from 'lucide-react';
import { api } from '../api';

const CandidateForm = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    
    // Professional Information
    currentCompany: '',
    currentDesignation: '',
    roleAppliedFor: '',
    totalExperienceYears: '',
    totalExperienceMonths: '',
    relevantExperience: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    
    // Location Information
    currentLocation: '',
    preferredLocation: '',
    willingToRelocate: false,
    
    // Skills & Education
    skills: [],
    education: '',
    certifications: '',
    
    // Additional Information
    resume: null,
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const tabs = [
    { id: 0, name: 'Personal', icon: User, fields: ['name', 'email', 'phone', 'address', 'dateOfBirth'] },
    { id: 1, name: 'Professional', icon: Building, fields: ['currentCompany', 'currentDesignation', 'roleAppliedFor', 'totalExperienceYears', 'totalExperienceMonths', 'relevantExperience'] },
    { id: 2, name: 'Compensation', icon: IndianRupee, fields: ['currentCTC', 'expectedCTC', 'noticePeriod'] },
    { id: 3, name: 'Location', icon: MapPin, fields: ['currentLocation', 'preferredLocation', 'willingToRelocate'] },
    { id: 4, name: 'Skills & Education', icon: GraduationCap, fields: ['skills', 'education', 'certifications'] },
    { id: 5, name: 'Additional', icon: FileText, fields: ['resume', 'portfolioUrl', 'linkedinUrl', 'githubUrl', 'additionalNotes'] }
  ];

  const experienceYearOptions = [
    { value: '', label: 'Select Years' },
    ...Array.from({ length: 36 }, (_, i) => ({ value: i.toString(), label: `${i} year${i !== 1 ? 's' : ''}` }))
  ];

  const experienceMonthOptions = [
    { value: '', label: 'Select Months' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: i.toString(), label: `${i} month${i !== 1 ? 's' : ''}` }))
  ];

  const noticePeriodOptions = [
    { value: '', label: 'Select Notice Period' },
    { value: 'immediate', label: 'Immediate' },
    { value: '15-days', label: '15 days' },
    { value: '1-month', label: '1 month' },
    { value: '2-months', label: '2 months' },
    { value: '3-months', label: '3 months' }
  ];

  const educationOptions = [
    { value: '', label: 'Select Education Level' },
    { value: 'high-school', label: 'High School' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelors', label: "Bachelor's Degree" },
    { value: 'masters', label: "Master's Degree" },
    { value: 'phd', label: 'PhD' }
  ];

  // Calculate completion percentage for each tab
  const getTabCompletion = (tabIndex) => {
    const tab = tabs[tabIndex];
    const requiredFields = tab.fields;
    let completedFields = 0;

    requiredFields.forEach(field => {
      if (field === 'skills') {
        if (formData.skills.length > 0) completedFields++;
      } else if (field === 'resume') {
        if (formData.resume) completedFields++;
      } else if (field === 'willingToRelocate') {
        completedFields++; // Boolean field is always considered complete
      } else if (formData[field] && formData[field].toString().trim()) {
        completedFields++;
      }
    });

    return Math.round((completedFields / requiredFields.length) * 100);
  };

  // Calculate overall completion
  const getOverallCompletion = () => {
    const totalCompletion = tabs.reduce((sum, _, index) => sum + getTabCompletion(index), 0);
    return Math.round(totalCompletion / tabs.length);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, resume: 'File size should be less than 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, resume: file }));
      setErrors(prev => ({ ...prev, resume: '' }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
      setErrors(prev => ({ ...prev, skills: '' }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const validateCurrentTab = () => {
    const newErrors = {};
    const currentTabFields = tabs[activeTab].fields;

    currentTabFields.forEach(field => {
      if (field === 'skills' && formData.skills.length === 0) {
        newErrors.skills = 'Please add at least one skill';
      } else if (field === 'email' && formData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
      } else if (field === 'phone' && formData.phone) {
        const phoneRegex = /^[+]?[\d\s\-\(\)]{7,15}$/;
        if (!phoneRegex.test(formData.phone)) {
          newErrors.phone = 'Please enter a valid phone number';
        }
      } else if (field !== 'willingToRelocate' && field !== 'resume' && field !== 'portfolioUrl' && 
                 field !== 'linkedinUrl' && field !== 'githubUrl' && field !== 'additionalNotes' && 
                 field !== 'dateOfBirth' && field !== 'certifications') {
        if (!formData[field] || !formData[field].toString().trim()) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextTab = () => {
    if (validateCurrentTab() && activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const prevTab = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all tabs
    let allValid = true;
    for (let i = 0; i < tabs.length; i++) {
      setActiveTab(i);
      if (!validateCurrentTab()) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      setToastMessage('Please fill in all required fields');
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'skills') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'resume' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (key !== 'resume') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await api.submitCandidate(formDataToSend);
      
      if (response.success) {
        setToastMessage('Candidate profile submitted successfully!');
        setShowToast(true);
        
        // Reset form
        setFormData({
          name: '', email: '', phone: '', address: '', dateOfBirth: '',
          currentCompany: '', currentDesignation: '', roleAppliedFor: '',
          totalExperienceYears: '', totalExperienceMonths: '', relevantExperience: '', currentCTC: '',
          expectedCTC: '', noticePeriod: '', currentLocation: '',
          preferredLocation: '', willingToRelocate: false, skills: [],
          education: '', certifications: '', resume: null,
          portfolioUrl: '', linkedinUrl: '', githubUrl: '', additionalNotes: ''
        });
        setActiveTab(0);
      } else {
        setToastMessage(response.error || 'Failed to submit candidate profile');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('An error occurred while submitting the form');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const renderPersonalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your phone number"
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your complete address"
          />
        </div>
        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
      </div>
    </div>
  );

  const renderProfessionalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Company *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="currentCompany"
              value={formData.currentCompany}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.currentCompany ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your current company"
            />
          </div>
          {errors.currentCompany && <p className="mt-1 text-sm text-red-600">{errors.currentCompany}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Designation *
          </label>
          <input
            type="text"
            name="currentDesignation"
            value={formData.currentDesignation}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.currentDesignation ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your current designation"
          />
          {errors.currentDesignation && <p className="mt-1 text-sm text-red-600">{errors.currentDesignation}</p>}
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Applied For *
              </label>
              <input
                type="text"
                name="roleAppliedFor"
                value={formData.roleAppliedFor}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.roleAppliedFor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter the role you're applying for"
              />
              {errors.roleAppliedFor && <p className="mt-1 text-sm text-red-600">{errors.roleAppliedFor}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Experience Years *
              </label>
              <select
                name="totalExperienceYears"
                value={formData.totalExperienceYears}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.totalExperienceYears ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {experienceYearOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.totalExperienceYears && <p className="mt-1 text-sm text-red-600">{errors.totalExperienceYears}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Experience Months *
              </label>
              <select
                name="totalExperienceMonths"
                value={formData.totalExperienceMonths}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.totalExperienceMonths ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {experienceMonthOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.totalExperienceMonths && <p className="mt-1 text-sm text-red-600">{errors.totalExperienceMonths}</p>}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relevant Experience *
          </label>
          <textarea
            name="relevantExperience"
            value={formData.relevantExperience}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.relevantExperience ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your relevant work experience..."
          />
          {errors.relevantExperience && <p className="mt-1 text-sm text-red-600">{errors.relevantExperience}</p>}
        </div>
      </div>
    </div>
  );

  const renderCompensationTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current CTC (LPA) *
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="number"
              name="currentCTC"
              value={formData.currentCTC}
              onChange={handleInputChange}
              step="0.1"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.currentCTC ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter current CTC in LPA"
            />
          </div>
          {errors.currentCTC && <p className="mt-1 text-sm text-red-600">{errors.currentCTC}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected CTC (LPA) *
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="number"
              name="expectedCTC"
              value={formData.expectedCTC}
              onChange={handleInputChange}
              step="0.1"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expectedCTC ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter expected CTC in LPA"
            />
          </div>
          {errors.expectedCTC && <p className="mt-1 text-sm text-red-600">{errors.expectedCTC}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notice Period *
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              name="noticePeriod"
              value={formData.noticePeriod}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.noticePeriod ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {noticePeriodOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          {errors.noticePeriod && <p className="mt-1 text-sm text-red-600">{errors.noticePeriod}</p>}
        </div>
      </div>
    </div>
  );

  const renderLocationTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.currentLocation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your current location"
            />
          </div>
          {errors.currentLocation && <p className="mt-1 text-sm text-red-600">{errors.currentLocation}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="preferredLocation"
              value={formData.preferredLocation}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.preferredLocation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your preferred work location"
            />
          </div>
          {errors.preferredLocation && <p className="mt-1 text-sm text-red-600">{errors.preferredLocation}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="willingToRelocate"
          name="willingToRelocate"
          checked={formData.willingToRelocate}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="willingToRelocate" className="text-sm font-medium text-gray-700">
          I am willing to relocate for the right opportunity
        </label>
      </div>
    </div>
  );

  const renderSkillsEducationTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills *
        </label>
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a skill and press Enter"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {errors.skills && <p className="mt-1 text-sm text-red-600">{errors.skills}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Highest Education Level *
        </label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <select
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.education ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {educationOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications
        </label>
        <div className="relative">
          <Award className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            name="certifications"
            value={formData.certifications}
            onChange={handleInputChange}
            rows={3}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="List your certifications..."
          />
        </div>
      </div>
    </div>
  );

  const renderAdditionalTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resume Upload
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="resume" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {formData.resume ? formData.resume.name : 'Upload your resume'}
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                PDF, DOC, DOCX up to 5MB
              </span>
            </label>
            <input
              id="resume"
              name="resume"
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </div>
        </div>
        {errors.resume && <p className="mt-1 text-sm text-red-600">{errors.resume}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio URL
          </label>
          <input
            type="url"
            name="portfolioUrl"
            value={formData.portfolioUrl}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://your-portfolio.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://github.com/yourusername"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any additional information you'd like to share..."
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderPersonalTab();
      case 1: return renderProfessionalTab();
      case 2: return renderCompensationTab();
      case 3: return renderLocationTab();
      case 4: return renderSkillsEducationTab();
      case 5: return renderAdditionalTab();
      default: return renderPersonalTab();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 lg:py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Registration</h1>
          <p className="text-gray-600">Complete your profile to get started</p>
          
          {/* Overall Progress */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{getOverallCompletion()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getOverallCompletion()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const completion = getTabCompletion(index);
              const isActive = activeTab === index;
              const isCompleted = completion === 100;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex-1 min-w-0 px-4 py-4 text-center border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-transparent hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="relative">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      {isCompleted && (
                        <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <span className="text-xs font-medium truncate">{tab.name}</span>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {tabs[activeTab].name} Information
              </h2>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${getTabCompletion(activeTab)}%` }}
                />
              </div>
            </div>
            
            {renderTabContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={prevTab}
              disabled={activeTab === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <div className="flex space-x-3">
              {activeTab < tabs.length - 1 ? (
                <button
                  type="button"
                  onClick={nextTab}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {toastMessage.includes('success') ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{toastMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowToast(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateForm;