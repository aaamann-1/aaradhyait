import { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, Loader2, CheckCircle, XCircle, X, Camera, Users } from 'lucide-react'
import {
  getAllEmployeesAdmin,
  createEmployeeAdmin,
  updateEmployeeAdmin,
  deleteEmployeeAdmin
} from '../../services/admin/employeesService'
import API_URL from '../../config/api'

const API_BASE = `${API_URL}/api/admin`
const getToken = () => sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken') || ''

const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${type === 'success' ? 'bg-teal-600 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
    {message}
  </div>
)

const emptyForm = {
  employee_id: null as number | null,
  full_name: '',
  designation: '',
  experience_years: '',
  photo_path: '',
  bio: '',
  is_founder: false,
  is_active: true,
  display_order: 0,
}

const AdminEmployees = () => {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const data = await getAllEmployeesAdmin()
      setEmployees(data)
    } catch {
      showToast('Failed to load employees', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEmployees() }, [])

  const openAddModal = () => {
    setForm({ ...emptyForm, display_order: employees.length })
    setModalOpen(true)
  }

  const openEditModal = (emp: any) => {
    setForm({
      employee_id: emp.employee_id,
      full_name: emp.full_name || '',
      designation: emp.designation || '',
      experience_years: emp.experience_years ?? '',
      photo_path: emp.photo_path || '',
      bio: emp.bio || '',
      is_founder: !!emp.is_founder,
      is_active: emp.is_active !== false,
      display_order: emp.display_order ?? 0,
    })
    setModalOpen(true)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/settings/upload-logo`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData
      })
      const data = await res.json()
      if (res.ok) { setForm(prev => ({ ...prev, photo_path: data.url })); showToast('Photo uploaded!', 'success') }
      else showToast('Upload failed', 'error')
    } catch {
      showToast('Upload failed', 'error')
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.designation.trim()) {
      showToast('Name and designation are required', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        full_name: form.full_name.trim(),
        designation: form.designation.trim(),
        experience_years: form.experience_years === '' ? null : Number(form.experience_years),
        photo_path: form.photo_path || null,
        bio: form.bio || null,
        is_founder: form.is_founder,
        is_active: form.is_active,
        display_order: Number(form.display_order) || 0,
      }
      if (form.employee_id) {
        await updateEmployeeAdmin(form.employee_id, payload)
        showToast('Employee updated!', 'success')
      } else {
        await createEmployeeAdmin(payload)
        showToast('Employee added!', 'success')
      }
      setModalOpen(false)
      fetchEmployees()
    } catch {
      showToast('Failed to save employee', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteEmployeeAdmin(confirmDelete.employee_id)
      showToast('Employee deleted', 'success')
      setEmployees(prev => prev.filter(e => e.employee_id !== confirmDelete.employee_id))
    } catch {
      showToast('Failed to delete employee', 'error')
    } finally {
      setConfirmDelete(null)
    }
  }

  const toggleActive = async (emp: any) => {
    try {
      await updateEmployeeAdmin(emp.employee_id, { is_active: !emp.is_active })
      setEmployees(prev => prev.map(e => e.employee_id === emp.employee_id ? { ...e, is_active: !e.is_active } : e))
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 lg:px-8 py-5 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team / Employees</h1>
          <p className="text-gray-500 text-base mt-1">Manage your team members and roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 font-semibold px-4.5 py-2.5 rounded-xl text-sm transition-colors bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
          >
            <Plus size={17} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-teal-500" />
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <Users size={36} className="text-gray-300 mb-3" />
            <p className="text-gray-500 text-base font-medium">No employees added yet.</p>
            <button onClick={openAddModal} className="mt-3 text-teal-600 text-sm font-semibold hover:underline">
              Add your first team member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(emp => (
              <div key={emp.employee_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-teal-600 text-white font-bold text-lg shrink-0 shadow-inner">
                    {emp.photo_path ? (
                      <img src={emp.photo_path} alt={emp.full_name} className="w-full h-full object-cover" />
                    ) : (
                      emp.full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base truncate">{emp.full_name}</p>
                    <p className="text-teal-600 text-sm font-semibold mt-0.5">{emp.designation}</p>
                    {emp.experience_years ? (
                      <p className="text-xs text-gray-500 font-medium mt-1">{emp.experience_years}+ yrs experience</p>
                    ) : null}
                    {emp.is_founder && (
                      <span className="inline-block mt-2 text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">FOUNDER</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                  <button onClick={() => toggleActive(emp)}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${emp.is_active ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                    {emp.is_active ? 'Visible' : 'Hidden'}
                  </button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEditModal(emp)} className="text-gray-400 hover:text-teal-600 transition-colors p-1">
                      <Pencil size={17} />
                    </button>
                    <button onClick={() => setConfirmDelete(emp)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{form.employee_id ? 'Edit Employee' : 'Add Employee'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-teal-600 shrink-0 shadow-inner">
                  {form.photo_path ? (
                    <img src={form.photo_path} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-lg">{form.full_name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-teal-600 text-sm font-semibold hover:underline cursor-pointer">
                    {photoUploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                    {photoUploading ? 'Uploading...' : 'Upload Photo'}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={photoUploading} />
                  </label>
                  {form.photo_path && (
                    <button onClick={() => setForm(prev => ({ ...prev, photo_path: '' }))} className="text-red-500 text-sm font-semibold hover:underline">Remove</button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-800" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation</label>
                <input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}
                  placeholder="e.g. Senior Developer"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-800" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience (years)</label>
                  <input type="number" min="0" value={form.experience_years}
                    onChange={e => setForm({ ...form, experience_years: e.target.value })}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Order</label>
                  <input type="number" min="0" value={form.display_order}
                    onChange={e => setForm({ ...form, display_order: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-800" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio (optional)</label>
                <textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Short description about the team member..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-800" />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.is_founder}
                    onChange={e => setForm({ ...form, is_founder: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded" />
                  Founder / Leadership
                </label>
                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded" />
                  Visible on website
                </label>
              </div>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors shadow-sm">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Employee?</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              This will permanently remove <span className="font-semibold text-gray-900">{confirmDelete.full_name}</span> from your team.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4.5 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4.5 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-sm">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEmployees