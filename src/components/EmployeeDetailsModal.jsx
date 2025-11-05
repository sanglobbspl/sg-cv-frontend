import React, { useEffect, useState } from 'react';
import { X, User, Briefcase, Building, Calendar, DollarSign, FileText, Activity, BarChart3 } from 'lucide-react';
import CandidateWorkflow from './CandidateWorkflow';
import CandidateLifecycle from './CandidateLifecycle';

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`py-3 px-3 border-b-2 font-medium text-sm transition-colors ${
      active ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
    }`}
  >
    <div className="flex items-center space-x-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  </button>
);

export default function EmployeeDetailsModal({ open, onClose, profile }) {
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (open) setActiveTab('details');
  }, [open]);

  if (!open) return null;

  const employee = profile?.employee || {};
  const salary = profile?.salary_structures || [];
  const compliance = profile?.payroll_compliances || [];
  const workflow = profile?.workflow || null;
  const candidate = workflow?.candidate || null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <User className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">{employee.name || 'Employee Profile'}</h2>
              </div>
              <div className="mt-1 text-sm text-gray-600 flex items-center space-x-4">
                <span className="inline-flex items-center"><FileText className="w-4 h-4 mr-1 text-gray-500" />{employee.employee_id}</span>
                {employee.designation && (
                  <span className="inline-flex items-center"><Briefcase className="w-4 h-4 mr-1 text-gray-500" />{employee.designation}</span>
                )}
                {employee.department && (
                  <span className="inline-flex items-center"><Building className="w-4 h-4 mr-1 text-gray-500" />{employee.department}</span>
                )}
                {employee.date_of_joining && (
                  <span className="inline-flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-500" />{new Date(employee.date_of_joining).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Tabs */}
          <div className="mt-4 flex space-x-6">
            <TabButton active={activeTab==='details'} onClick={() => setActiveTab('details')} icon={User} label="Details" />
            <TabButton active={activeTab==='salary'} onClick={() => setActiveTab('salary')} icon={DollarSign} label="Salary" />
            <TabButton active={activeTab==='compliance'} onClick={() => setActiveTab('compliance')} icon={FileText} label="Compliance" />
            <TabButton active={activeTab==='workflow'} onClick={() => setActiveTab('workflow')} icon={Activity} label="Workflow" />
            <TabButton active={activeTab==='lifecycle'} onClick={() => setActiveTab('lifecycle')} icon={BarChart3} label="Lifecycle" />
          </div>
        </div>

        {/* Content */}
        <div className="h-[70vh] overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Personal & Job</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="font-medium">{employee.email || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Phone</span><span className="font-medium">{employee.phone || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Department</span><span className="font-medium">{employee.department || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Designation</span><span className="font-medium">{employee.designation || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Location</span><span className="font-medium">{employee.location || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Manager ID</span><span className="font-medium">{employee.manager_id || '-'}</span></div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Latest Salary Snapshot</h3>
                {salary && salary.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {Object.entries(salary[0]).map(([k,v]) => (
                      <div key={k} className="flex justify-between"><span className="text-gray-600">{k}</span><span className="font-medium">{String(v || '')}</span></div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No salary records</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Salary Structures</h3>
              {salary && salary.length > 0 ? (
                <div className="space-y-3">
                  {salary.map((row, idx) => (
                    <div key={idx} className="p-3 rounded border">
                      <div className="text-sm grid grid-cols-2 gap-2">
                        {Object.entries(row).map(([k,v]) => (
                          <div key={k} className="flex justify-between"><span className="text-gray-600">{k}</span><span className="font-medium">{String(v || '')}</span></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No salary structures</p>
              )}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Payroll Compliance</h3>
              {compliance && compliance.length > 0 ? (
                <div className="space-y-3">
                  {compliance.map((row, idx) => (
                    <div key={idx} className="p-3 rounded border">
                      <div className="text-sm grid grid-cols-2 gap-2">
                        {Object.entries(row).map(([k,v]) => (
                          <div key={k} className="flex justify-between"><span className="text-gray-600">{k}</span><span className="font-medium">{String(v || '')}</span></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No payroll compliance records</p>
              )}
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-6">
              {candidate ? (
                <CandidateWorkflow candidate={candidate} />
              ) : (
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-gray-600">No candidate workflow data linked.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <div className="space-y-6">
              {candidate ? (
                <CandidateLifecycle candidate={candidate} />
              ) : (
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-gray-600">No lifecycle data available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}