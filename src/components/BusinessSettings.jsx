import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Upload, 
  FileText, 
  DollarSign, 
  Settings, 
  Save, 
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Calendar,
  FileImage,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const BusinessSettings = ({ updateCompanyLogo }) => {
  const [formData, setFormData] = useState({
    // Company Information
    companyName: '',
    address: '',
    contactNumber: '',
    email: '',
    website: '',
    
    // Business Identification & Tax Details
    cin: '',
    gstNumber: '',
    pan: '',
    taxId: '',
    
    // Financial Settings
    defaultCurrency: 'INR',
    fiscalYearStart: 'April',
    
    // Other Business Details
    registrationNumber: '',
    complianceDetails: '',
    notes: ''
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const logoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const currencies = [
    { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load existing logo on component mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      setLogoPreview(savedLogo);
    }
  }, []);

  // Validation functions
  const validateGST = (gst) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateCIN = (cin) => {
    const cinRegex = /^[LUL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
    return cinRegex.test(cin);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, logo: 'Logo file size should be less than 5MB' }));
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, logo: 'Please upload a valid image file (JPEG, PNG, GIF, WebP)' }));
        return;
      }

      setLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoDataUrl = e.target.result;
        setLogoPreview(logoDataUrl);
        // Update the header logo immediately
        if (updateCompanyLogo) {
          updateCompanyLogo(logoDataUrl);
        }
      };
      reader.readAsDataURL(file);
      
      setErrors(prev => ({ ...prev, logo: '' }));
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (updateCompanyLogo) {
      updateCompanyLogo(null);
    }
    setErrors(prev => ({ ...prev, logo: '' }));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format.`);
        return false;
      }
      return true;
    });

    setDocuments(prev => [...prev, ...validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toLocaleDateString()
    }))]);
  };

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';

    // Format validations
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.contactNumber && !validatePhone(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid phone number';
    }
    if (formData.gstNumber && !validateGST(formData.gstNumber)) {
      newErrors.gstNumber = 'Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)';
    }
    if (formData.pan && !validatePAN(formData.pan)) {
      newErrors.pan = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }
    if (formData.cin && !validateCIN(formData.cin)) {
      newErrors.cin = 'Please enter a valid CIN number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveStatus('error');
      return;
    }

    setIsLoading(true);
    setSaveStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the data to your backend
      console.log('Saving business settings:', {
        ...formData,
        logo,
        documents
      });

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving business settings:', error);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
                <p className="text-gray-600 mt-1">Manage your company information and business configuration</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <div className={`mt-4 p-3 rounded-lg flex items-center ${
              saveStatus === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {saveStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {saveStatus === 'success' 
                ? 'Business settings saved successfully!' 
                : 'Please fix the errors and try again.'}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.companyName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter complete address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.contactNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+91 9876543210"
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="company@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.company.com"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Camera className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Company Logo"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </button>
                      {logoPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="flex items-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 200x200px, Max 5MB (JPEG, PNG, GIF, WebP)
                    </p>
                    {errors.logo && (
                      <p className="text-red-500 text-xs mt-1">{errors.logo}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Identification & Tax Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Business Identification & Tax Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CIN (Corporate Identification Number)
                </label>
                <input
                  type="text"
                  name="cin"
                  value={formData.cin}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cin ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="L12345AB2023PLC123456"
                />
                {errors.cin && (
                  <p className="text-red-500 text-xs mt-1">{errors.cin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.gstNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="22AAAAA0000A1Z5"
                />
                {errors.gstNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.pan ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="ABCDE1234F"
                />
                {errors.pan && (
                  <p className="text-red-500 text-xs mt-1">{errors.pan}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Identification Number
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tax identification number"
                />
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Financial Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <select
                  name="defaultCurrency"
                  value={formData.defaultCurrency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Fiscal Year Start
                </label>
                <select
                  name="fiscalYearStart"
                  value={formData.fiscalYearStart}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {months.map(month => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Document Upload Section - Full Width */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center mb-6">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Document Upload</h2>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                ref={documentInputRef}
                onChange={handleDocumentUpload}
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, Word, Images (JPEG, PNG, GIF) - Max 10MB per file
              </p>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Uploaded Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center flex-1 min-w-0">
                        <FileImage className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.size)} • {doc.uploadDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Other Business Details - Full Width */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center mb-6">
            <Settings className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Other Business Details</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter registration number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compliance Details
              </label>
              <textarea
                name="complianceDetails"
                value={formData.complianceDetails}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter compliance details"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any additional business information or notes"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;