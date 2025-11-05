import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import {
  Users,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  User,
  IndianRupee,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ConvertCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');

  const [employee, setEmployee] = useState({
    department: '',
    designation: '',
    grade: '',
    location: '',
    date_of_joining: '',
    manager_id: ''
  });

  const [salary, setSalary] = useState({
    basic: '',
    hra: '',
    special_allowance: '',
    other_allowances: '',
    deductions_other: '',
    effective_date: ''
  });

  const [compliance, setCompliance] = useState({
    pf_applicable: true,
    esic_applicable: true,
    pt_state: 'MH',
    pt_month: new Date().getMonth() + 1
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.getCandidatesList({ page: '1', per_page: '100', status: 'Approved' });
        if (data.success) {
          setCandidates(data.data || []);
        } else {
          setError(data.error || 'Failed to load candidates');
        }
      } catch (e) {
        setError(e.message || 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    // Ensure we only show Approved candidates regardless of API filtering
    const approved = (c) => (c.status || '').toLowerCase() === 'approved';
    const base = candidates.filter(approved);
    if (!term) return base;
    return base.filter(c =>
      (c.name || '').toLowerCase().includes(term) ||
      ((c.candidate_id || c.id || '')).toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term)
    );
  }, [candidates, searchTerm]);

  const selectedCandidate = useMemo(() => {
    return candidates.find(c => (c.candidate_id === selectedCandidateId) || (c.id === selectedCandidateId)) || null;
  }, [candidates, selectedCandidateId]);

  useEffect(() => {
    // Prefill designation and location from candidate if available
    if (selectedCandidate) {
      setEmployee(prev => ({
        ...prev,
        designation: prev.designation || selectedCandidate.current_designation || '',
        location: prev.location || selectedCandidate.current_location || ''
      }));
    }
  }, [selectedCandidate]);

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setSalary(prev => ({ ...prev, [name]: value }));
  };

  const handleComplianceChange = (e) => {
    const { name, type, checked, value } = e.target;
    setCompliance(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCandidateId) {
      setError('Please select a candidate');
      return;
    }
    if (!employee.date_of_joining) {
      setError('Please select a date of joining');
      return;
    }

    try {
      setLoading(true);
      const conversionData = {
        candidate_id: selectedCandidateId,
        department: employee.department,
        designation: employee.designation,
        grade: employee.grade,
        location: employee.location,
        date_of_joining: employee.date_of_joining,
        manager_id: employee.manager_id,
        salary: {
          basic: Number(salary.basic || 0),
          hra: Number(salary.hra || 0),
          special_allowance: Number(salary.special_allowance || 0),
          other_allowances: Number(salary.other_allowances || 0),
          deductions_other: Number(salary.deductions_other || 0),
          effective_date: salary.effective_date || new Date().toISOString().slice(0,10)
        },
        compliance: {
          pf_applicable: !!compliance.pf_applicable,
          esic_applicable: !!compliance.esic_applicable,
          pt_state: (compliance.pt_state || 'MH'),
          pt_month: Number(compliance.pt_month || (new Date().getMonth() + 1))
        }
      };

      const resp = await api.convertCandidateToEmployee(conversionData);
      if (resp.success) {
        setSuccess(`Converted successfully. Employee: ${resp.employee_id}`);
        // Optional: reset minimal fields
        setSelectedCandidateId('');
      } else {
        setError(resp.error || 'Conversion failed');
      }
    } catch (e) {
      setError(e.message || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 lg:p-6 xl:p-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-4 lg:px-6 xl:px-8 py-4 lg:py-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Convert Candidate to Employee</h2>
              <p className="text-base text-gray-600">Select a candidate and enter employment details</p>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 xl:px-8 py-6">
          {/* Candidate selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search candidate</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select candidate</label>
            <p className="text-xs text-gray-500 mb-2">Only candidates with status "Approved" are listed.</p>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">-- Select --</option>
              {filteredCandidates.map(c => (
                <option key={c.candidate_id || c.id} value={c.candidate_id || c.id}>
                  {c.name || 'Unknown'}
                </option>
              ))}
            </select>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center space-x-2 mb-3">
                  <Building className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">Employment Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Department</label>
                    <input name="department" value={employee.department} onChange={handleEmployeeChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Designation</label>
                    <input name="designation" value={employee.designation} onChange={handleEmployeeChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Grade</label>
                    <input name="grade" value={employee.grade} onChange={handleEmployeeChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Location</label>
                    <input name="location" value={employee.location} onChange={handleEmployeeChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Date of Joining</label>
                    <input type="date" name="date_of_joining" value={employee.date_of_joining} onChange={handleEmployeeChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Manager ID</label>
                    <input name="manager_id" value={employee.manager_id} onChange={handleEmployeeChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center space-x-2 mb-3">
                  <IndianRupee className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">Salary Structure</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Basic</label>
                    <input type="number" name="basic" value={salary.basic} onChange={handleSalaryChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">HRA</label>
                    <input type="number" name="hra" value={salary.hra} onChange={handleSalaryChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Special Allowance</label>
                    <input type="number" name="special_allowance" value={salary.special_allowance} onChange={handleSalaryChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Other Allowances</label>
                    <input type="number" name="other_allowances" value={salary.other_allowances} onChange={handleSalaryChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Other Deductions</label>
                    <input type="number" name="deductions_other" value={salary.deductions_other} onChange={handleSalaryChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Effective Date</label>
                    <input type="date" name="effective_date" value={salary.effective_date} onChange={handleSalaryChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-3">
                <Briefcase className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Compliance</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input id="pf_applicable" type="checkbox" name="pf_applicable" checked={compliance.pf_applicable} onChange={handleComplianceChange} />
                  <label htmlFor="pf_applicable" className="text-sm">PF Applicable</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input id="esic_applicable" type="checkbox" name="esic_applicable" checked={compliance.esic_applicable} onChange={handleComplianceChange} />
                  <label htmlFor="esic_applicable" className="text-sm">ESIC Applicable</label>
                </div>
                <div>
                  <label className="block text-sm font-medium">PT State</label>
                  <input name="pt_state" value={compliance.pt_state} onChange={handleComplianceChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium">PT Month</label>
                  <input type="number" min="1" max="12" name="pt_month" value={compliance.pt_month} onChange={handleComplianceChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 border border-red-200 bg-red-50 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center p-3 border border-emerald-200 bg-emerald-50 rounded-lg text-emerald-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2 rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-md"
              >
                {loading ? 'Converting...' : 'Convert to Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConvertCandidate;