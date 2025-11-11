import React, { useEffect, useMemo, useState } from 'react';
import { Award, BarChart3, PlusCircle, Edit3, Trash2, Search, ListPlus, XCircle, Target } from 'lucide-react';
import api from '../api';

const emptyEval = {
  employee_id: '',
  period: '',
  period_type: 'monthly',
  kpi_score: '',
  goals_achieved: '',
  behavior_rating: '',
  overall_score: '',
  manager_email: '',
  comments: '',
  manager_comments: '',
  hr_comments: '',
  final_approver_comments: '',
  key_points: [],
};

export default function PerformanceEvaluation() {
  const [employees, setEmployees] = useState([]);
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyEval });
  const [keyPointInput, setKeyPointInput] = useState('');
  // Goals modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalAssignedAt, setGoalAssignedAt] = useState(() => {
    const d = new Date();
    const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tz.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  });
  const [goalDueAt, setGoalDueAt] = useState('');
  const [goalKpi, setGoalKpi] = useState('');
  const [goalWeightage, setGoalWeightage] = useState('');
  const [goalPriority, setGoalPriority] = useState('medium');
  const [goalKeyPoints, setGoalKeyPoints] = useState([]);
  const [goalKeyPointInput, setGoalKeyPointInput] = useState('');
  const [goalSelectedIds, setGoalSelectedIds] = useState([]);
  const [goalSearch, setGoalSearch] = useState('');
  const [assignedGoals, setAssignedGoals] = useState([]);
  // Current user role for workflow actions
  const [userRole, setUserRole] = useState('');
  // Period helper state
  const current = new Date();
  const defaultFY = current.getMonth() + 1 >= 4 ? current.getFullYear() : current.getFullYear() - 1;
  const [fiscalYear, setFiscalYear] = useState(defaultFY);
  const [quarterSel, setQuarterSel] = useState('Q1');
  const [halfSel, setHalfSel] = useState('H1');
  const isHrOrAdmin = (userRole === 'hr' || userRole === 'admin');

  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await api.getEmployees();
        const list = res?.employees || res?.data || [];
        setEmployees(Array.isArray(list) ? list : []);
      } catch (err) {
        // Only HR/Admin can access employees endpoint; suppress error for other roles
        setEmployees([]);
      }
    }
    // Load employees list only for HR/Admin roles
    if (userRole === 'hr' || userRole === 'admin') {
      loadEmployees();
    }
  }, [userRole]);

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        setUserRole((parsed?.role || '').toLowerCase());
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = employeeQuery.toLowerCase();
    return employees.filter(e => (e.name || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q));
  }, [employees, employeeQuery]);

  async function loadHistory(empId) {
    setLoadingHistory(true);
    setError(null);
    setMessage(null);
    try {
      // For employee/manager/director, backend filters appropriately when employee_id is omitted
      const res = await (empId ? api.getPerformanceHistory(empId) : api.getPerformanceHistory());
      const list = res?.data || res?.evaluations || [];
      setHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || 'Failed to load performance history');
    } finally {
      setLoadingHistory(false);
    }
  }

  // Auto-load history for non-HR/Admin roles (employee/manager/director) without requiring employee selection
  useEffect(() => {
    if (userRole && userRole !== 'hr' && userRole !== 'admin') {
      loadHistory(selectedEmployee || undefined);
      loadAssignedGoals(selectedEmployee || undefined);
    }
  }, [userRole]);

  useEffect(() => {
    // keep assigned goals view in sync when user changes selected employee
    loadAssignedGoals(selectedEmployee || undefined);
  }, [selectedEmployee]);

  function selectEmployee(empId) {
    setSelectedEmployee(empId);
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
    setForm({ ...emptyEval, employee_id: empId });
    loadHistory(empId);
    loadAssignedGoals(empId);
  }

  function onAddNew() {
    if (!selectedEmployee) {
      setError('Select an employee first');
      return;
    }
    setForm({ ...emptyEval, employee_id: selectedEmployee });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(true);
  }

  function onAddGoalClick() {
    // Preselect chosen employee if any
    const pre = selectedEmployee ? [selectedEmployee] : [];
    setGoalSelectedIds(pre);
    // Reset form fields but keep assignedAt default and clear others
    setGoalDueAt('');
    setGoalKpi('');
    setGoalKeyPoints([]);
    setGoalKeyPointInput('');
    setShowGoalModal(true);
  }

  function toggleGoalSelection(id) {
    setGoalSelectedIds(prev => (
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    ));
  }

  function addGoalKeyPoint() {
    const val = (goalKeyPointInput || '').trim();
    if (!val) return;
    setGoalKeyPoints(prev => [...prev, val]);
    setGoalKeyPointInput('');
  }

  function removeGoalKeyPoint(idx) {
    setGoalKeyPoints(prev => prev.filter((_, i) => i !== idx));
  }

  function persistGoals(assignments) {
    try {
      const key = 'employee_goals_assignments';
      const existingRaw = localStorage.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = Array.isArray(existing) ? [...existing, ...assignments] : assignments;
      localStorage.setItem(key, JSON.stringify(merged));
    } catch (_) {
      // ignore localStorage errors
    }
  }

  function loadAssignedGoals(empId) {
    try {
      const key = 'employee_goals_assignments';
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const filtered = Array.isArray(list)
        ? (empId ? list.filter(g => String(g.employee_id) === String(empId)) : list)
        : [];
      // sort by assigned_at desc
      filtered.sort((a, b) => String(b.assigned_at || '').localeCompare(String(a.assigned_at || '')));
      setAssignedGoals(filtered);
    } catch (_) {
      setAssignedGoals([]);
    }
  }

  function onSubmitGoals() {
    setError(null);
    setMessage(null);
    if (goalSelectedIds.length === 0) {
      setError('Select at least one employee to assign goals');
      return;
    }
    if (!goalAssignedAt) {
      setError('Assignment time is required');
      return;
    }
    if (!goalDueAt) {
      setError('Last date (due) is required');
      return;
    }
    if (!goalPriority) {
      setError('Priority is required');
      return;
    }
    const assignmentId = `${Date.now()}`;
    const payloadBase = {
      id: assignmentId,
      assigned_at: goalAssignedAt,
      due_at: goalDueAt,
      kpi: goalKpi,
      weightage: goalWeightage,
      priority: goalPriority,
      status: 'assigned',
      key_points: goalKeyPoints,
    };
    const assignments = goalSelectedIds.map(empId => {
      const emp = employees.find(e => String(e.employee_id) === String(empId)) || {};
      return {
        ...payloadBase,
        employee_id: empId,
        assignee_name: emp.name || '',
        assignee_email: emp.email || '',
      };
    });
    persistGoals(assignments);
    setShowGoalModal(false);
    setMessage(`Goal assigned to ${goalSelectedIds.length} ${goalSelectedIds.length === 1 ? 'employee' : 'employees'}`);
    // refresh assigned goals section
    loadAssignedGoals(selectedEmployee || undefined);
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Keep helper in sync when changing period type
  useEffect(() => {
    if (form.period_type === 'quarterly') {
      const period = `${fiscalYear}-${quarterSel}`;
      setForm(prev => ({ ...prev, period }));
    } else if (form.period_type === 'half_yearly') {
      const period = `${fiscalYear}-${halfSel}`;
      setForm(prev => ({ ...prev, period }));
    } else if (form.period_type === 'yearly') {
      const period = `${fiscalYear}`;
      setForm(prev => ({ ...prev, period }));
    }
    // monthly: leave period free-text
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.period_type]);

  function onEdit(evalRow) {
    setForm({
      employee_id: evalRow.employee_id || selectedEmployee || '',
      period: evalRow.period || '',
      period_type: evalRow.period_type || 'monthly',
      kpi_score: evalRow.kpi_score ?? '',
      goals_achieved: evalRow.goals_achieved ?? '',
      behavior_rating: evalRow.behavior_rating ?? '',
      overall_score: evalRow.overall_score ?? '',
      manager_email: evalRow.manager_email || '',
      comments: evalRow.comments || '',
      manager_comments: evalRow.manager_comments || '',
      hr_comments: evalRow.hr_comments || '',
      final_approver_comments: evalRow.final_approver_comments || '',
      key_points: (() => {
        const raw = evalRow.key_points;
        if (!raw) return [];
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
          // Fallback: split by semicolons/newlines
          return String(raw)
            .split(/\n|;/)
            .map(s => s.trim())
            .filter(Boolean);
        }
      })(),
    });
    setIsEditing(true);
    setEditingId(evalRow.evaluation_id);
    setShowForm(true);
  }

  function addKeyPoint() {
    const val = (keyPointInput || '').trim();
    if (!val) return;
    setForm(prev => ({ ...prev, key_points: [...(prev.key_points || []), val] }));
    setKeyPointInput('');
  }

  function removeKeyPoint(idx) {
    setForm(prev => ({
      ...prev,
      key_points: (prev.key_points || []).filter((_, i) => i !== idx)
    }));
  }

  async function onDelete(evalRow) {
    if (!window.confirm(`Delete evaluation for ${evalRow.period}?`)) return;
    setError(null);
    setMessage(null);
    try {
      const res = await api.deletePerformance(evalRow.evaluation_id);
      if (res?.success === false) throw new Error(res?.message || 'Delete failed');
      setMessage('Evaluation deleted');
      await loadHistory(selectedEmployee);
    } catch (err) {
      setError(err?.message || 'Failed to delete evaluation');
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.employee_id) {
      setError('Employee is required');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        ...form,
        kpi_score: form.kpi_score === '' ? null : Number(form.kpi_score),
        goals_achieved: form.goals_achieved === '' ? null : Number(form.goals_achieved),
        behavior_rating: form.behavior_rating === '' ? null : Number(form.behavior_rating),
        overall_score: form.overall_score === '' ? null : Number(form.overall_score),
        // Send key_points as array; backend will normalize to JSON string
        key_points: Array.isArray(form.key_points) ? form.key_points : [],
      };
      let res;
      if (isEditing && editingId) {
        res = await api.updatePerformance(editingId, payload);
      } else {
        res = await api.createPerformance(payload);
      }
      if (res?.success === false) throw new Error(res?.message || 'Save failed');
      setMessage(isEditing ? 'Evaluation updated' : 'Evaluation added');
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      setForm({ ...emptyEval, employee_id: selectedEmployee });
      await loadHistory(selectedEmployee);
    } catch (err) {
      setError(err?.message || 'Failed to save evaluation');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Award className="w-6 h-6 text-indigo-600" />
          Performance Evaluation
        </h2>
        {(userRole === 'hr' || userRole === 'admin') && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border rounded px-2 py-1">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                className="ml-2 outline-none"
                placeholder="Filter employees…"
                value={employeeQuery}
                onChange={(e) => setEmployeeQuery(e.target.value)}
              />
            </div>
            <button
              onClick={onAddGoalClick}
              className="inline-flex items-center gap-2 px-3 py-2 rounded border text-gray-800 bg-white hover:bg-gray-50"
              title="Add Goal"
            >
              <Target className="w-4 h-4" /> Add Goal
            </button>
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              <PlusCircle className="w-4 h-4" /> Add Evaluation
            </button>
          </div>
        )}
      </div>
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <Target className="w-5 h-5 text-indigo-600" /> Assign Goal
              </div>
              <button className="px-2 py-1 rounded border text-gray-700 hover:bg-gray-50" onClick={() => setShowGoalModal(false)}>Close</button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm text-gray-600 mb-2">Select employees</label>
                <div className="flex items-center bg-white border rounded px-2 py-1 mb-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input className="ml-2 outline-none w-full" placeholder="Search…" value={goalSearch} onChange={(e) => setGoalSearch(e.target.value)} />
                </div>
                <div className="max-h-64 overflow-y-auto divide-y border rounded">
                  {employees.filter(e => {
                    const q = goalSearch.toLowerCase();
                    return (e.name || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q);
                  }).map(e => (
                    <label key={e.employee_id} className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${goalSelectedIds.includes(e.employee_id) ? 'bg-indigo-50' : ''}`}>
                      <input type="checkbox" checked={goalSelectedIds.includes(e.employee_id)} onChange={() => toggleGoalSelection(e.employee_id)} />
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{e.name}</span>
                        <span className="block text-xs text-gray-500">{e.email}</span>
                      </span>
                    </label>
                  ))}
                  {employees.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No employees available</div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Assignment time</label>
                  <input type="datetime-local" className="w-full border rounded px-3 py-2" value={goalAssignedAt} onChange={(e) => setGoalAssignedAt(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Last date (due)</label>
                  <input type="datetime-local" className="w-full border rounded px-3 py-2" value={goalDueAt} onChange={(e) => setGoalDueAt(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">KPI</label>
                  <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g., Close 10 qualified leads per month" value={goalKpi} onChange={(e) => setGoalKpi(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Weightage</label>
                  <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g., 20" value={goalWeightage} onChange={(e) => setGoalWeightage(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Priority</label>
                  <select className="w-full border rounded px-3 py-2" value={goalPriority} onChange={(e) => setGoalPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">Key Points <ListPlus className="w-4 h-4 text-gray-500" /></label>
                  <div className="flex items-center gap-2 mb-2">
                    <input className="flex-1 border rounded px-3 py-2" placeholder="Add clear steps or milestones" value={goalKeyPointInput} onChange={(e) => setGoalKeyPointInput(e.target.value)} />
                    <button type="button" className="px-3 py-2 rounded bg-gray-800 text-white hover:bg-gray-900" onClick={addGoalKeyPoint}>Add</button>
                  </div>
                  {goalKeyPoints.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {goalKeyPoints.map((kp, idx) => (
                        <span key={`${kp}-${idx}`} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-indigo-50 text-indigo-700 border">
                          {kp}
                          <button type="button" className="text-indigo-700 hover:text-indigo-900" onClick={() => removeGoalKeyPoint(idx)}>
                            <XCircle className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
              <button className="px-3 py-2 rounded border text-gray-700 hover:bg-gray-50" onClick={() => setShowGoalModal(false)}>Cancel</button>
              <button className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={onSubmitGoals}>Assign Goal</button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded bg-red-50 text-red-700">{error}</div>
      )}
      {message && (
        <div className="mb-4 px-4 py-3 rounded bg-green-50 text-green-700">{message}</div>
      )}

      <div className={`grid grid-cols-1 ${isHrOrAdmin ? 'md:grid-cols-3' : ''} gap-4 mb-6`}>
        {isHrOrAdmin && (
          <div className="md:col-span-1 bg-white border rounded p-4">
            <div className="text-sm text-gray-600 mb-2">Select Employee</div>
            <div className="max-h-72 overflow-y-auto divide-y">
              {filteredEmployees.map((e) => (
                <button
                  key={e.employee_id}
                  onClick={() => selectEmployee(e.employee_id)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${selectedEmployee === e.employee_id ? 'bg-indigo-50 text-indigo-700' : ''}`}
                >
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-gray-500">{e.email}</div>
                </button>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="text-sm text-gray-500">No employees match filter</div>
              )}
            </div>
          </div>
        )}

        <div className={`${isHrOrAdmin ? 'md:col-span-2' : ''}`}>
          {showForm && (
            <form onSubmit={onSubmit} className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Employee ID</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.employee_id}
                  onChange={(e) => updateField('employee_id', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Period</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="2025-Q1 or 2025-01"
                  value={form.period}
                  onChange={(e) => updateField('period', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Period Type</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.period_type}
                  onChange={(e) => updateField('period_type', e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half_yearly">Half Yearly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              {form.period_type !== 'monthly' && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Fiscal Year (Apr–Mar)</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={fiscalYear}
                      onChange={(e) => {
                        const fy = parseInt(e.target.value || defaultFY, 10) || defaultFY;
                        setFiscalYear(fy);
                        if (form.period_type === 'quarterly') {
                          updateField('period', `${fy}-${quarterSel}`);
                        } else if (form.period_type === 'half_yearly') {
                          updateField('period', `${fy}-${halfSel}`);
                        } else if (form.period_type === 'yearly') {
                          updateField('period', `${fy}`);
                        }
                      }}
                    />
                  </div>
                  {form.period_type === 'quarterly' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Quarter</label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={quarterSel}
                        onChange={(e) => {
                          const q = e.target.value;
                          setQuarterSel(q);
                          updateField('period', `${fiscalYear}-${q}`);
                        }}
                      >
                        <option value="Q1">Q1 (Apr–Jun)</option>
                        <option value="Q2">Q2 (Jul–Sep)</option>
                        <option value="Q3">Q3 (Oct–Dec)</option>
                        <option value="Q4">Q4 (Jan–Mar)</option>
                      </select>
                    </div>
                  )}
                  {form.period_type === 'half_yearly' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Half</label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={halfSel}
                        onChange={(e) => {
                          const h = e.target.value;
                          setHalfSel(h);
                          updateField('period', `${fiscalYear}-${h}`);
                        }}
                      >
                        <option value="H1">H1 (Apr–Sep)</option>
                        <option value="H2">H2 (Oct–Mar)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">KPI Score</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-3 py-2"
                  value={form.kpi_score}
                  onChange={(e) => updateField('kpi_score', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Goals Achieved</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-3 py-2"
                  value={form.goals_achieved}
                  onChange={(e) => updateField('goals_achieved', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Behavior Rating</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-3 py-2"
                  value={form.behavior_rating}
                  onChange={(e) => updateField('behavior_rating', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Overall Score</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-3 py-2"
                  value={form.overall_score}
                  onChange={(e) => updateField('overall_score', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Manager Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={form.manager_email}
                  onChange={(e) => updateField('manager_email', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">Key Points <ListPlus className="w-4 h-4 text-gray-500" /></label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Add clear, outcome-oriented bullet points"
                    value={keyPointInput}
                    onChange={(e) => setKeyPointInput(e.target.value)}
                  />
                  <button type="button" className="px-3 py-2 rounded bg-gray-800 text-white hover:bg-gray-900" onClick={addKeyPoint}>Add</button>
                </div>
                {(form.key_points || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.key_points.map((kp, idx) => (
                      <span key={`${kp}-${idx}`} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-indigo-50 text-indigo-700 border">
                        {kp}
                        <button type="button" className="text-indigo-700 hover:text-indigo-900" onClick={() => removeKeyPoint(idx)}>
                          <XCircle className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Manager Comments</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="Specific observations, outcomes, and next steps"
                    value={form.manager_comments}
                    onChange={(e) => updateField('manager_comments', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">HR Comments</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="Policy alignment, culture fit, training needs"
                    value={form.hr_comments}
                    onChange={(e) => updateField('hr_comments', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Director Comments</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="Final decision rationale and recommendations"
                    value={form.final_approver_comments}
                    onChange={(e) => updateField('final_approver_comments', e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">General Comments</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  value={form.comments}
                  onChange={(e) => updateField('comments', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded border text-gray-700 hover:bg-gray-50"
                  onClick={() => { setShowForm(false); setIsEditing(false); setEditingId(null); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {saving ? 'Saving…' : (isEditing ? 'Update Evaluation' : 'Add Evaluation')}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-medium">Performance History</div>
              <div className="text-sm text-gray-500">{selectedEmployee ? `Employee: ${selectedEmployee}` : 'Select an employee'}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Goals</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Behavior</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Points</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments (Mgr/HR/Director)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingHistory ? (
                    <tr>
                      <td className="px-4 py-3 text-center text-gray-500" colSpan="8">Loading…</td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td className="px-4 py-3 text-center text-gray-500" colSpan="8">No evaluations found</td>
                    </tr>
                  ) : (
                    history.map((ev, idx) => (
                      <tr key={`${ev.evaluation_id}-${ev.created_at || idx}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{ev.period}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{ev.kpi_score ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{ev.goals_achieved ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{ev.behavior_rating ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{ev.overall_score ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{ev.manager_email || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {(() => {
                            const raw = ev.key_points;
                            if (!raw) return '-';
                            try {
                              const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
                              const list = Array.isArray(arr) ? arr : [];
                              return list.slice(0, 3).join(' • ') || '-';
                            } catch (_) {
                              const list = String(raw)
                                .split(/\n|;/)
                                .map(s => s.trim())
                                .filter(Boolean);
                              return list.slice(0, 3).join(' • ') || '-';
                            }
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {[
                            ev.manager_comments ? `M: ${ev.manager_comments}` : null,
                            ev.hr_comments ? `HR: ${ev.hr_comments}` : null,
                            ev.final_approver_comments ? `F: ${ev.final_approver_comments}` : null,
                            (!ev.manager_comments && !ev.hr_comments && !ev.final_approver_comments) ? (ev.comments || null) : null
                          ].filter(Boolean).map((s, i) => (
                            <span key={i} className="block truncate max-w-xs" title={s}>{s}</span>
                          ))}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="flex flex-wrap items-center gap-2">
                            {ev.manager_reviewed ? (
                              <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border">Mgr Reviewed</span>
                            ) : null}
                            {ev.manager_approved ? (
                              <span className="px-2 py-1 rounded bg-green-50 text-green-700 border">Mgr Approved</span>
                            ) : null}
                            {ev.hr_reviewed ? (
                              <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border">HR Reviewed</span>
                            ) : null}
                            {ev.hr_approved ? (
                              <span className="px-2 py-1 rounded bg-green-50 text-green-700 border">HR Approved</span>
                            ) : null}
                            {ev.final_approver_reviewed ? (
                              <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 border">Director Reviewed</span>
                            ) : null}
                            {ev.final_approver_approved ? (
                              <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 border">Director Approved</span>
                            ) : null}
                            {ev.visible_to_employee ? (
                              <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 border">Visible to Employee</span>
                            ) : (
                              <span className="px-2 py-1 rounded bg-gray-50 text-gray-700 border">Not Visible</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {(userRole === 'hr' || userRole === 'admin' || userRole === 'manager' || userRole === 'director') && (
                              <button
                                className="inline-flex items-center gap-1 px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                                onClick={() => onEdit(ev)}
                              >
                                <Edit3 className="w-4 h-4" /> Edit
                              </button>
                            )}
                            {(userRole === 'hr' || userRole === 'admin') && (
                              <button
                                className="inline-flex items-center gap-1 px-2 py-1 rounded border text-red-600 hover:bg-red-50"
                                onClick={() => onDelete(ev)}
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            )}
                            {userRole === 'manager' && (
                              <>
                                {!ev.manager_reviewed && (
                                  <button
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border text-blue-700 hover:bg-blue-50"
                                    onClick={() => doWorkflow(ev, 'manager', 'review')}
                                  >
                                    Review
                                  </button>
                                )}
                                {!ev.manager_approved && (
                                  <button
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border text-green-700 hover:bg-green-50"
                                    onClick={() => doWorkflow(ev, 'manager', 'approve')}
                                  >
                                    Approve
                                  </button>
                                )}
                              </>
                            )}
                            {userRole === 'hr' && (
                              <>
                                {!ev.hr_reviewed && (
                                  <button
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border text-blue-700 hover:bg-blue-50"
                                    onClick={() => doWorkflow(ev, 'hr', 'review')}
                                  >
                                    Review
                                  </button>
                                )}
                                {!ev.hr_approved && (
                                  <button
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border text-green-700 hover:bg-green-50"
                                    onClick={() => doWorkflow(ev, 'hr', 'approve')}
                                  >
                                    Approve
                                  </button>
                                )}
                              </>
                            )}
                            {(userRole === 'director' || userRole === 'admin') && (
                              <>
                                {!ev.final_approver_reviewed && (
                                  <button
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border text-purple-700 hover:bg-purple-50"
                                    onClick={() => doWorkflow(ev, 'director', 'review')}
                                  >
                                    Director Review
                                  </button>
                                )}
                                {!ev.final_approver_approved && (
                                  <button
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border text-purple-700 hover:bg-purple-50"
                                    onClick={() => doWorkflow(ev, 'director', 'approve')}
                                  >
                                    Director Approve
                                  </button>
                                )}
                                {ev.manager_approved && ev.hr_approved && ev.final_approver_approved && !ev.visible_to_employee && (
                                  <button
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border text-indigo-700 hover:bg-indigo-50"
                                    onClick={() => doWorkflow(ev, 'director', 'send_to_employee')}
                                  >
                                    Send to Employee
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assigned Goals Section */}
          <div className="bg-white border rounded-lg overflow-hidden mt-4">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-medium">Assigned Goals</div>
              <div className="text-sm text-gray-500">
                {selectedEmployee ? `Employee: ${selectedEmployee}` : 'All assigned goals'}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weightage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned At</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Points</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignedGoals.length === 0 ? (
                    <tr>
                      <td className="px-4 py-3 text-center text-gray-500" colSpan="8">No goals assigned</td>
                    </tr>
                  ) : (
                    assignedGoals.map((g) => (
                      <tr key={`${g.id}-${g.employee_id}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{g.kpi || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{g.weightage || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded border text-xs ${
                            g.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                            g.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>{(g.priority || '').toUpperCase() || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="flex flex-col">
                            <span>{g.assignee_name || '-'}</span>
                            <span className="text-xs text-gray-500">{g.assignee_email || ''}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 border">{g.status || 'assigned'}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{g.assigned_at ? new Date(g.assigned_at).toLocaleString() : '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{g.due_at ? new Date(g.due_at).toLocaleString() : '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {Array.isArray(g.key_points) && g.key_points.length > 0 ? g.key_points.slice(0,3).join(' • ') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  async function doWorkflow(ev, role, op) {
    setError(null);
    setMessage(null);
    try {
      const res = await api.updatePerformanceWorkflow(ev.evaluation_id, { role, op });
      if (res?.success === false) throw new Error(res?.error || 'Workflow update failed');
      setMessage(`Action '${op}' recorded for ${role}`);
      await loadHistory(selectedEmployee);
    } catch (err) {
      setError(err?.message || 'Failed to update workflow');
    }
  }
}