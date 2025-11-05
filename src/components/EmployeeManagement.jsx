import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, Upload, Download, Edit3, Trash2 } from 'lucide-react';
import api from '../api';
import EmployeeDetailsModal from './EmployeeDetailsModal';

function formatDateInput(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  grade: '',
  location: '',
  date_of_joining: '',
  manager_id: '',
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [employeeProfile, setEmployeeProfile] = useState(null);

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const an = (a.name || '').toLowerCase();
      const bn = (b.name || '').toLowerCase();
      return an.localeCompare(bn);
    });
  }, [employees]);

  async function loadEmployees() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getEmployees();
      const list = res?.employees || res?.data || [];
      setEmployees(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function onViewDetails(emp) {
    setDetailsLoading(true);
    setError(null);
    try {
      const res = await api.getEmployeeDetails(emp.employee_id);
      const profile = res?.data || res;
      setEmployeeProfile(profile);
      setShowDetails(true);
    } catch (err) {
      setError(err?.message || 'Failed to load employee details');
    } finally {
      setDetailsLoading(false);
    }
  }

  function onAddNew() {
    setForm({ ...emptyForm });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(true);
  }

  function onEdit(emp) {
    setForm({
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || '',
      designation: emp.designation || '',
      grade: emp.grade || '',
      location: emp.location || '',
      date_of_joining: formatDateInput(emp.date_of_joining),
      manager_id: emp.manager_id || '',
    });
    setIsEditing(true);
    setEditingId(emp.employee_id);
    setShowForm(true);
  }

  async function onDelete(emp) {
    if (!window.confirm(`Delete employee ${emp.name}?`)) return;
    try {
      const res = await api.deleteEmployee(emp.employee_id);
      if (res?.success === false) throw new Error(res?.message || 'Delete failed');
      setMessage('Employee deleted');
      await loadEmployees();
    } catch (err) {
      setError(err?.message || 'Failed to delete employee');
    }
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        ...form,
        // Normalize date
        date_of_joining: form.date_of_joining ? new Date(form.date_of_joining).toISOString() : '',
      };
      let res;
      if (isEditing && editingId) {
        res = await api.updateEmployee(editingId, payload);
      } else {
        res = await api.createEmployee(payload);
      }
      if (res?.success === false) throw new Error(res?.message || 'Save failed');
      setMessage(isEditing ? 'Employee updated' : 'Employee created');
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await loadEmployees();
    } catch (err) {
      setError(err?.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  }

  async function onImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.importEmployees(file);
      if (res?.success === false) throw new Error(res?.message || 'Import failed');
      setMessage('Employees imported successfully');
      await loadEmployees();
    } catch (err) {
      setError(err?.message || 'Failed to import employees');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  async function onExport() {
    setError(null);
    setMessage(null);
    try {
      const res = await api.exportEmployees();
      if (res?.success && res.blob) {
        const url = window.URL.createObjectURL(res.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees_export.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setMessage('Employees exported');
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      setError(err?.message || 'Failed to export employees');
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-indigo-600" />
          Employee Management
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer">
            <Upload className="w-4 h-4" /> Import
            <input
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={onImportFile}
              disabled={importing}
            />
          </label>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            <UserPlus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {(error || message) && (
        <div className={`mb-4 px-4 py-3 rounded ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {error || message}
        </div>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="bg-white border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Department</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.department}
              onChange={(e) => updateField('department', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Designation</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.designation}
              onChange={(e) => updateField('designation', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Grade</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.grade}
              onChange={(e) => updateField('grade', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Location</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date of Joining</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={form.date_of_joining}
              onChange={(e) => updateField('date_of_joining', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Manager ID</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.manager_id}
              onChange={(e) => updateField('manager_id', e.target.value)}
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
              {saving ? 'Saving…' : (isEditing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joining</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-4 py-3 text-center text-gray-500" colSpan="7">Loading…</td>
                </tr>
              ) : sortedEmployees.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-center text-gray-500" colSpan="7">No employees found</td>
                </tr>
              ) : (
                sortedEmployees.map((emp) => (
                  <tr key={emp.employee_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-indigo-700">
                      <button className="hover:underline" onClick={() => onViewDetails(emp)}>{emp.employee_id}</button>
                    </td>
                    <td className="px-4 py-3 text-sm text-indigo-700">
                      <button className="hover:underline" onClick={() => onViewDetails(emp)}>{emp.name}</button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{emp.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{emp.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{emp.designation}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDateInput(emp.date_of_joining)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <button
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                          onClick={() => onEdit(emp)}
                        >
                          <Edit3 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(emp)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <EmployeeDetailsModal
        open={showDetails}
        onClose={() => { setShowDetails(false); setEmployeeProfile(null); }}
        profile={employeeProfile}
      />
    </div>
  );
}