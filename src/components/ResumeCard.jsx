import React, { useMemo } from 'react';
import { Download, Eye, User, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';
import { api } from '../api';

const ResumeCard = React.memo(({ candidate, onView, onDownload }) => {
  const handleDownload = async () => {
    try {
      const resumeId = candidate['Resume ID'];
      if (resumeId) {
        await api.downloadResume(resumeId);
      } else {
        console.error('Resume ID not found');
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  // Handle different field name formats with fallbacks
  const name = candidate.Name || candidate.name || candidate['Candidate Name'] || '';
  const email = candidate.Email || candidate.email || '';
  const phone = candidate.Phone || candidate.phone || candidate['Phone Number'] || '';
  const location = candidate.Location || candidate.location || '';
  const experience_years = candidate['Experience (Years)'] || candidate.experience_years || candidate.experience || '';
  const skills = candidate.Skills || candidate.skills || '';
  const current_role = candidate['Role Applied For'] || candidate.current_role || candidate.role || candidate.position || '';
  const education = candidate.Education || candidate.education || '';
  const resume_file = candidate['Resume Upload Link'] || candidate.resume_file || candidate.cv_file_path || '';
  const currentCTC = candidate['Current CTC'] || candidate.current_ctc || candidate.currentCTC || '';
  const expectedCTC = candidate['Expected CTC'] || candidate.expected_ctc || candidate.expectedCTC || '';
  
  // Debug: Log candidate data to console (remove in production)
  console.log('Candidate data:', candidate);

  // Memoize skills processing to prevent repeated parsing
  const processedSkills = useMemo(() => {
    if (!skills) return [];
    
    const skillsArray = Array.isArray(skills) 
      ? skills 
      : skills.toString().split(',').map(s => s.trim()).filter(s => s);
    
    return skillsArray;
  }, [skills]);

  return (
    <div className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {name || 'Unknown Candidate'}
            </h3>
            <p className="text-xs text-gray-600">
              {current_role || 'No role specified'}
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onView(candidate)}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Download Resume"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-2">
        {email && (
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Mail className="w-3 h-3" />
            <span className="truncate">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Phone className="w-3 h-3" />
            <span>{phone}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location}</span>
          </div>
        )}
      </div>

      {/* Experience & Education */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {experience_years && (
          <div className="flex items-center space-x-1 text-xs">
            <Calendar className="w-3 h-3 text-gray-500" />
            <span className="text-gray-700">{experience_years}y exp.</span>
          </div>
        )}
        {education && (
          <div className="flex items-center space-x-1 text-xs">
            <Award className="w-3 h-3 text-gray-500" />
            <span className="text-gray-700 truncate">{education}</span>
          </div>
        )}
      </div>

      {/* CTC Information */}
      {(currentCTC || expectedCTC) && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          {currentCTC && (
            <div className="text-xs">
              <span className="text-gray-700">Current: {currentCTC}</span>
            </div>
          )}
          {expectedCTC && (
            <div className="text-xs">
              <span className="text-gray-700">Expected: {expectedCTC}</span>
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      {processedSkills.length > 0 && (
        <div className="mb-2">
          <h4 className="text-xs font-medium text-gray-700 mb-1">Skills</h4>
          <div className="flex flex-wrap gap-1">
            {processedSkills.slice(0, 4).map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="px-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {processedSkills.length > 4 && (
              <span className="px-1 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                +{processedSkills.length - 4}
              </span>
            )}
          </div>
        </div>
      )}


    </div>
  );
});

ResumeCard.displayName = 'ResumeCard';

export default ResumeCard;