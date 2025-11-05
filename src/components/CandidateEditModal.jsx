import React, { useState, useEffect } from 'react';
import { 
  X, Save, User, Mail, Phone, Building, MapPin, 
  IndianRupee, Clock, Award, GraduationCap, FileText 
} from 'lucide-react';

const CandidateEditModal = ({ candidate, isOpen, onClose, onSave }) => {
  console.log('CandidateEditModal rendered with props:', { 
    candidate: candidate ? candidate.name : 'null', 
    candidateId: candidate ? candidate.id : 'null',
    isOpen, 
    hasOnClose: !!onClose, 
    hasOnSave: !!onSave 
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    current_location: '',
    preferred_location: '',
    current_company: '',
    current_designation: '',
    total_experience: '',
    relevant_experience: '',
    current_ctc: '',
    expected_ctc: '',
    notice_period: '',
    skills: '',
    education: '',
    certifications: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('useEffect triggered - candidate:', candidate, 'isOpen:', isOpen);
    if (candidate && isOpen) {
      setFormData({
        name: String(candidate.name || ''),
        email: String(candidate.email || ''),
        phone: String(candidate.phone || ''),
        current_location: String(candidate.current_location || ''),
        preferred_location: String(candidate.preferred_location || ''),
        current_company: String(candidate.current_company || ''),
        current_designation: String(candidate.current_designation || ''),
        total_experience: String(candidate.total_experience || ''),
        relevant_experience: String(candidate.relevant_experience || ''),
        current_ctc: String(candidate.current_ctc || ''),
        expected_ctc: String(candidate.expected_ctc || ''),
        notice_period: String(candidate.notice_period || ''),
        skills: Array.isArray(candidate.skills) ? candidate.skills.join(', ') : String(candidate.skills || ''),
        education: String(candidate.education || ''),
        certifications: String(candidate.certifications || ''),
        notes: String(candidate.notes || '')
      });
      setErrors({});
    }
  }, [candidate, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Ensure all fields are strings before validation
    const name = String(formData.name || '');
    const email = String(formData.email || '');
    const phone = String(formData.phone || '');
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert skills back to array if it's a string
      const updatedData = {
        ...formData,
        skills: typeof formData.skills === 'string' 
          ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
          : formData.skills
      };
      
      console.log('Calling onSave with:', candidate.id, updatedData);
      await onSave(candidate.id, updatedData);
      console.log('onSave completed successfully');
      // Modal will be closed by the parent component on successful save
    } catch (error) {
      console.error('Error updating candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Candidate</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Location
                </label>
                <input
                  type="text"
                  name="current_location"
                  value={formData.current_location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Location
                </label>
                <input
                  type="text"
                  name="preferred_location"
                  value={formData.preferred_location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter preferred location"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-green-600" />
                Professional Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Company
                </label>
                <input
                  type="text"
                  name="current_company"
                  value={formData.current_company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Designation
                </label>
                <input
                  type="text"
                  name="current_designation"
                  value={formData.current_designation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current designation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Experience
                </label>
                <input
                  type="text"
                  name="total_experience"
                  value={formData.total_experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relevant Experience
                </label>
                <input
                  type="text"
                  name="relevant_experience"
                  value={formData.relevant_experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current CTC
                </label>
                <input
                  type="text"
                  name="current_ctc"
                  value={formData.current_ctc}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 12 LPA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected CTC
                </label>
                <input
                  type="text"
                  name="expected_ctc"
                  value={formData.expected_ctc}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 15 LPA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notice Period
                </label>
                <input
                  type="text"
                  name="notice_period"
                  value={formData.notice_period}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 30 days"
                />
              </div>
            </div>
          </div>

          {/* Skills and Education */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills (comma-separated)
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., React, Node.js, Python, AWS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education
              </label>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter education details"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certifications
              </label>
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter certifications"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes about the candidate"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateEditModal;