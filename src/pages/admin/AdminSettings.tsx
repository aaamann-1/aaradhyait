import { useState, useEffect } from 'react'
import {  User, Save, Camera, Shield, Building2, BellRing, Settings2, ChevronRight, Loader2, CheckCircle, XCircle, Clock, Plus, Trash2 } from 'lucide-react'

type Tab = 'profile' | 'security' | 'company' | 'notifications' | 'system'

import API_URL from "../../config/api"
const API_BASE = `${API_URL}/api/admin`

const getToken = () => sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken') || ''

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
})

const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-base font-bold transition-all ${type === 'success' ? 'bg-teal-600 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
    {message}
  </div>
)

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <div onClick={() => onChange(!value)} className={`w-14 h-8 rounded-full relative cursor-pointer transition-colors ${value ? 'bg-teal-500' : 'bg-gray-200'}`}>
    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all ${value ? 'right-1' : 'left-1'}`} />
  </div>
)

interface CustomSocial { label: string; url: string }

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '', role: '', avatarPath: '' })
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const [company, setCompany] = useState({
    companyName: '',
    supportEmail: '', salesEmail: '',
    primaryPhone: '', whatsapp: '',
    supportPhone1: '', supportPhone2: '', supportPhone3: '',
    salesPhone1: '', salesPhone2: '',
    address1: '', address2: '', city: '', state: '', pin: '',
    youtube: '', instagram: '', facebook: '',
    customSocials: '',
    logoPath: '',
    hoursWeekday: '', hoursWeekdayOpen: true,
    hoursSaturday: '', hoursSaturdayOpen: true,
    hoursSunday: '', hoursSundayOpen: false,
  })
  const [logoUploading, setLogoUploading] = useState(false)
  const [customSocials, setCustomSocials] = useState<CustomSocial[]>([])

  const [notifications, setNotifications] = useState({
    newInquiry: true, customerReviews: true
  })

  const [backupList, setBackupList] = useState<any[]>([])
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<any | null>(null)

  const [system, setSystem] = useState({
    maintenanceMode: false, language: 'English - India', timezone: 'IST - UTC+5:30',
    googleMapsKey: '', cloudStorage: 'AWS S3', autoBackup: true, backupFrequency: 'Daily'
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/settings/upload-logo`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData
      })
      const data = await res.json()
      if (res.ok) { setCompany(prev => ({ ...prev, logoPath: data.url })); showToast('Logo uploaded!', 'success') }
      else showToast('Upload failed', 'error')
    } catch { showToast('Upload failed', 'error') }
    finally { setLogoUploading(false) }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/settings/upload-logo`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData
      })
      const data = await res.json()
      if (res.ok) { setProfile(prev => ({ ...prev, avatarPath: data.url })); showToast('Photo uploaded!', 'success') }
      else showToast('Upload failed', 'error')
    } catch { showToast('Upload failed', 'error') }
    finally { setAvatarUploading(false) }
  }

  useEffect(() => {
    const fetchTabData = async () => {
      setLoading(true)
      try {
        if (activeTab === 'profile') {
          const res = await fetch(`${API_BASE}/settings/profile`, { headers: authHeaders() })
          const data = await res.json()
          if (res.ok) setProfile(data)
        } else if (activeTab === 'company') {
          const res = await fetch(`${API_BASE}/settings/company`, { headers: authHeaders() })
          const data = await res.json()
          if (res.ok) {
            setCompany(data)
            try {
              setCustomSocials(data.customSocials ? JSON.parse(data.customSocials) : [])
            } catch { setCustomSocials([]) }
          }
        } else if (activeTab === 'notifications') {
          const res = await fetch(`${API_BASE}/settings/notifications`, { headers: authHeaders() })
          const data = await res.json()
          if (res.ok) setNotifications(data)
        } else if (activeTab === 'system') {
          const res = await fetch(`${API_BASE}/settings/system`, { headers: authHeaders() })
          const data = await res.json()
          if (res.ok) setSystem(data)
          const r2 = await fetch(`${API_BASE}/settings/backups`, { headers: authHeaders() })
          const d2 = await r2.json()
          setBackupList(d2.data || [])
        }
      } catch { showToast('Failed to load settings', 'error') }
      finally { setLoading(false) }
    }
    fetchTabData()
  }, [activeTab])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeTab === 'profile') {
        const res = await fetch(`${API_BASE}/settings/profile`, {
          method: 'PUT', headers: authHeaders(), body: JSON.stringify(profile)
        })
        const data = await res.json()
        if (res.ok) showToast('Profile saved successfully!', 'success')
        else showToast(data.message || 'Failed to save', 'error')

      } else if (activeTab === 'security') {
        if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
          showToast('Please fill in all password fields', 'error'); setSaving(false); return
        }
        const res = await fetch(`${API_BASE}/settings/password`, {
          method: 'PUT', headers: authHeaders(), body: JSON.stringify(password)
        })
        const data = await res.json()
        if (res.ok) { showToast('Password updated successfully!', 'success'); setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
        else showToast(data.message || 'Failed to update password', 'error')

      } else if (activeTab === 'company') {
        const payload = { ...company, customSocials: JSON.stringify(customSocials) }
        const res = await fetch(`${API_BASE}/settings/company`, {
          method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (res.ok) showToast('Company info saved successfully!', 'success')
        else showToast(data.message || 'Failed to save', 'error')

      } else if (activeTab === 'notifications') {
        const res = await fetch(`${API_BASE}/settings/notifications`, {
          method: 'PUT', headers: authHeaders(), body: JSON.stringify(notifications)
        })
        const data = await res.json()
        if (res.ok) showToast('Notification preferences saved!', 'success')
        else showToast(data.message || 'Failed to save', 'error')

      } else if (activeTab === 'system') {
        const res = await fetch(`${API_BASE}/settings/system`, {
          method: 'PUT', headers: authHeaders(), body: JSON.stringify(system)
        })
        const data = await res.json()
        if (res.ok) showToast('System config saved successfully!', 'success')
        else showToast(data.message || 'Failed to save', 'error')
      }
    } catch { showToast('Something went wrong', 'error') }
    finally { setSaving(false) }
  }

  const handleBackupNow = async () => {
    setBackupLoading(true)
    try {
      const res = await fetch(`${API_BASE}/settings/backups`, { method: 'POST', headers: authHeaders() })
      const data = await res.json()
      if (res.ok) {
        showToast('Backup created successfully!', 'success')
        const r2 = await fetch(`${API_BASE}/settings/backups`, { headers: authHeaders() })
        const d2 = await r2.json()
        setBackupList(d2.data || [])
      } else {
        showToast(data.message || 'Backup failed', 'error')
      }
    } catch { showToast('Backup failed', 'error') }
    finally { setBackupLoading(false) }
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Admin Profile', icon: <User size={18} /> },
    { id: 'security' as Tab, label: 'Security & Password', icon: <Shield size={18} /> },
    { id: 'company' as Tab, label: 'Company Information', icon: <Building2 size={18} /> },
    { id: 'notifications' as Tab, label: 'Notification Preferences', icon: <BellRing size={18} /> },
    { id: 'system' as Tab, label: 'System Configuration', icon: <Settings2 size={18} /> },
  ]

  return (
    <div className="flex-1 bg-gray-50 min-h-screen text-base">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1 font-medium">
            <span>Home</span><span>&gt;</span>
            <span className="text-gray-800 font-semibold">Settings</span>
            {activeTab !== 'profile' && (
              <><span>&gt;</span>
                <span className="text-teal-600 font-semibold">{tabs.find(t => t.id === activeTab)?.label}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Settings Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {profile.avatarPath ? (
              <img src={profile.avatarPath} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-gray-600" />
            )}
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl text-base transition-colors bg-teal-600 hover:bg-teal-700 text-white shadow-sm disabled:opacity-60">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-fit space-y-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-semibold transition-all text-left ${activeTab === tab.id ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className={activeTab === tab.id ? 'text-teal-600' : 'text-gray-400'}>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto text-teal-500" />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex items-center justify-center">
                <Loader2 size={36} className="animate-spin text-teal-500" />
              </div>
            ) : (
              <>
                {/* Admin Profile */}
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <h2 className="font-bold text-gray-900 text-xl mb-1">Admin Profile</h2>
                    <p className="text-base text-gray-500 mb-6">Manage your personal account credentials</p>
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-teal-600 shrink-0 shadow-sm">
                        {profile.avatarPath ? (
                          <img src={profile.avatarPath} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-2xl">{profile.fullName?.charAt(0) || 'A'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-base font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-100 cursor-pointer transition-colors shadow-sm">
                          {avatarUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                          {avatarUploading ? 'Uploading...' : 'Change Photo'}
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={avatarUploading} />
                        </label>
                        <button onClick={() => setProfile(prev => ({ ...prev, avatarPath: '' }))} className="text-red-500 text-base font-semibold hover:underline px-2 py-1">Remove</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { label: 'Full Name', key: 'fullName', type: 'text' },
                        { label: 'Email Address', key: 'email', type: 'email' },
                        { label: 'Phone Number', key: 'phone', type: 'tel' },
                        { label: 'Role', key: 'role', type: 'text' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="block text-base font-semibold text-gray-700 mb-2">{field.label}</label>
                          <input type={field.type} value={profile[field.key as keyof typeof profile]}
                            onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                            className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security */}
                {activeTab === 'security' && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <h2 className="font-bold text-gray-900 text-xl mb-6">Security & Password</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">Current Password</label>
                        <input type="password" value={password.currentPassword}
                          onChange={e => setPassword({ ...password, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          className="w-full sm:w-2/3 px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">New Password</label>
                          <input type="password" value={password.newPassword}
                            onChange={e => setPassword({ ...password, newPassword: e.target.value })}
                            placeholder="Enter new password"
                            className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Confirm New Password</label>
                          <input type="password" value={password.confirmPassword}
                            onChange={e => setPassword({ ...password, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                        <div className="flex items-center gap-4">
                          <Shield size={22} className="text-teal-600" />
                          <div>
                            <p className="text-base font-bold text-gray-900">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Protect your account with an extra layer of security</p>
                          </div>
                        </div>
                        <div className="w-14 h-8 bg-teal-500 rounded-full relative cursor-pointer shadow-sm">
                          <div className="w-6 h-6 bg-white rounded-full absolute right-1 top-1 shadow" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Information */}
                {activeTab === 'company' && (
                  <div className="space-y-6">
                    {/* Business Identity */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                      <div className="flex items-center gap-2.5 mb-6">
                        <Building2 size={22} className="text-teal-600" />
                        <h2 className="font-bold text-gray-900 text-xl">Business Identity</h2>
                      </div>
                      <div className="flex items-center gap-6 mb-8 p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                        <div className="w-24 h-24 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center bg-white shrink-0 shadow-sm">
                          {company.logoPath ? (
                            <img src={company.logoPath} alt="Company Logo" className="w-full h-full object-contain p-2" />
                          ) : (
                            <Building2 size={36} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900 mb-1">Company Logo</p>
                          <p className="text-sm text-gray-500 mb-4">Recommended: 200x200px, PNG or JPG</p>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-base font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm">
                              {logoUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                              {logoUploading ? 'Uploading...' : 'Upload Logo'}
                              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={logoUploading} />
                            </label>
                            {company.logoPath && (
                              <button onClick={() => setCompany(prev => ({ ...prev, logoPath: '' }))} className="text-red-500 text-base font-semibold hover:underline">Remove</button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">Company Name</label>
                        <input type="text" value={company.companyName}
                          onChange={e => setCompany({ ...company, companyName: e.target.value })}
                          className="w-full sm:w-1/2 px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                      <h2 className="font-bold text-gray-900 text-xl mb-6">Contact Details</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { label: 'Support Email', key: 'supportEmail' },
                          { label: 'Sales Email', key: 'salesEmail' },
                          { label: 'Primary Phone', key: 'primaryPhone' },
                          { label: 'WhatsApp Business', key: 'whatsapp' },
                          { label: 'Support Phone 1', key: 'supportPhone1' },
                          { label: 'Support Phone 2', key: 'supportPhone2' },
                          { label: 'Support Phone 3', key: 'supportPhone3' },
                          { label: 'Sales Phone 1', key: 'salesPhone1' },
                          { label: 'Sales Phone 2', key: 'salesPhone2' },
                        ].map(field => (
                          <div key={field.key}>
                            <label className="block text-base font-semibold text-gray-700 mb-2">{field.label}</label>
                            <input value={company[field.key as keyof typeof company] as string}
                              onChange={e => setCompany({ ...company, [field.key]: e.target.value })}
                              className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Registered Address */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                      <h2 className="font-bold text-gray-900 text-xl mb-6">Registered Address</h2>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Address Line 1</label>
                          <input value={company.address1} onChange={e => setCompany({ ...company, address1: e.target.value })}
                            className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Address Line 2</label>
                          <input value={company.address2} onChange={e => setCompany({ ...company, address2: e.target.value })}
                            className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {[{ label: 'City', key: 'city' }, { label: 'State', key: 'state' }, { label: 'PIN Code', key: 'pin' }].map(field => (
                            <div key={field.key}>
                              <label className="block text-base font-semibold text-gray-700 mb-2">{field.label}</label>
                              <input value={company[field.key as keyof typeof company] as string}
                                onChange={e => setCompany({ ...company, [field.key]: e.target.value })}
                                className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                      <div className="flex items-center gap-2.5 mb-6">
                        <Clock size={22} className="text-teal-600" />
                        <h2 className="font-bold text-gray-900 text-xl">Business Hours</h2>
                      </div>
                      <div className="space-y-5">
                        {[
                          { label: 'Monday - Friday', hoursKey: 'hoursWeekday', openKey: 'hoursWeekdayOpen' },
                          { label: 'Saturday', hoursKey: 'hoursSaturday', openKey: 'hoursSaturdayOpen' },
                          { label: 'Sunday', hoursKey: 'hoursSunday', openKey: 'hoursSundayOpen' },
                        ].map(row => {
                          const isOpen = company[row.openKey as keyof typeof company] as boolean
                          return (
                            <div key={row.hoursKey} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] items-center gap-6">
                              <label className="text-base font-semibold text-gray-700">{row.label}</label>
                              <input
                                value={company[row.hoursKey as keyof typeof company] as string}
                                onChange={e => setCompany({ ...company, [row.hoursKey]: e.target.value })}
                                disabled={!isOpen}
                                placeholder={isOpen ? 'e.g. 9:00 AM - 7:00 PM' : 'Closed'}
                                className={`w-full px-4.5 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500 ${isOpen ? 'border-gray-200 text-gray-900' : 'border-gray-100 bg-gray-50 text-red-400'}`}
                              />
                              <div className="flex items-center gap-3">
                                <Toggle value={isOpen} onChange={v => setCompany({ ...company, [row.openKey]: v })} />
                                <span className={`text-base font-bold ${isOpen ? 'text-teal-600' : 'text-red-500'}`}>
                                  {isOpen ? 'Open' : 'Closed'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Social Profiles */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                      <h2 className="font-bold text-gray-900 text-xl mb-6">Social Profiles</h2>
                      <div className="space-y-4">
                        {[
                          { label: 'YT', key: 'youtube', placeholder: 'https://youtube.com/@...' },
                          { label: 'IG', key: 'instagram', placeholder: 'https://instagram.com/...' },
                          { label: 'FB', key: 'facebook', placeholder: 'https://facebook.com/...' },
                        ].map(field => (
                          <div key={field.key} className="flex items-center gap-4">
                            <span className="text-sm font-bold w-10 text-gray-500 uppercase">{field.label}</span>
                            <input placeholder={field.placeholder}
                              value={company[field.key as keyof typeof company] as string}
                              onChange={e => setCompany({ ...company, [field.key]: e.target.value })}
                              className="flex-1 px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                          </div>
                        ))}

                        {/* Custom Social Links */}
                        {customSocials.length > 0 && (
                          <div className="pt-4 border-t border-gray-100 space-y-4">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Additional Links</p>
                            {customSocials.map((social, i) => (
                              <div key={i} className="flex items-center gap-4">
                                <input
                                  placeholder="Platform name"
                                  value={social.label}
                                  onChange={e => {
                                    const updated = [...customSocials]
                                    updated[i] = { ...updated[i], label: e.target.value }
                                    setCustomSocials(updated)
                                  }}
                                  className="w-40 px-3.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <input
                                  placeholder="https://..."
                                  value={social.url}
                                  onChange={e => {
                                    const updated = [...customSocials]
                                    updated[i] = { ...updated[i], url: e.target.value }
                                    setCustomSocials(updated)
                                  }}
                                  className="flex-1 px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button
                                  onClick={() => setCustomSocials(customSocials.filter((_, idx) => idx !== i))}
                                  className="p-3 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => setCustomSocials([...customSocials, { label: '', url: '' }])}
                          className="flex items-center gap-2 text-teal-600 text-base font-bold hover:underline mt-4"
                        >
                          <Plus size={18} />
                          Add another link
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                    <h2 className="font-bold text-gray-900 text-xl mb-2">Notification Preferences</h2>
                    <p className="text-base text-gray-500 mb-6">Choose what notifications you want to receive</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                        <div>
                          <p className="text-base font-bold text-gray-900">New Inquiries & Leads</p>
                          <p className="text-sm text-gray-500">Receive notifications when customers submit new contact queries or WhatsApp leads.</p>
                        </div>
                        <Toggle value={notifications.newInquiry} onChange={v => setNotifications({ ...notifications, newInquiry: v })} />
                      </div>

                      <div className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                        <div>
                          <p className="text-base font-bold text-gray-900">Customer Reviews & Feedback</p>
                          <p className="text-sm text-gray-500">Get notified when customers leave reviews or ratings on products.</p>
                        </div>
                        <Toggle value={notifications.customerReviews} onChange={v => setNotifications({ ...notifications, customerReviews: v })} />
                      </div>
                    </div>
                  </div>
                )}

                {/* System Configuration */}
                {activeTab === 'system' && (
                  <div className="space-y-6">
                    {/* General Configuration */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                      <h2 className="font-bold text-gray-900 text-xl mb-6">System Configuration</h2>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                          <div>
                            <p className="text-base font-bold text-gray-900">Maintenance Mode</p>
                            <p className="text-sm text-gray-500">Temporarily close public access to the storefront website.</p>
                          </div>
                          <Toggle value={system.maintenanceMode} onChange={v => setSystem({ ...system, maintenanceMode: v })} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">Language</label>
                            <select value={system.language} onChange={e => setSystem({ ...system, language: e.target.value })}
                              className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                              <option>English - India</option>
                              <option>English - US</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">Timezone</label>
                            <select value={system.timezone} onChange={e => setSystem({ ...system, timezone: e.target.value })}
                              className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                              <option>IST - UTC+5:30</option>
                              <option>UTC</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Google Maps API Key (Store Locator)</label>
                          <input type="text" value={system.googleMapsKey} onChange={e => setSystem({ ...system, googleMapsKey: e.target.value })}
                            placeholder="AIzaSy..."
                            className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                      </div>
                    </div>

                    {/* Backups & Restore */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="font-bold text-gray-900 text-xl mb-1">Database Backups</h2>
                          <p className="text-base text-gray-500">Create point-in-time recovery points for your product catalog & settings</p>
                        </div>
                        <button onClick={handleBackupNow} disabled={backupLoading}
                          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-base shadow-sm transition-colors disabled:opacity-50">
                          {backupLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                          {backupLoading ? 'Creating Backup...' : 'Backup Now'}
                        </button>
                      </div>

                      {backupList.length > 0 ? (
                        <div className="space-y-3 mt-4">
                          {backupList.map(b => (
                            <div key={b.backup_id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50/50 transition-colors">
                              <div>
                                <p className="text-base font-bold text-gray-900">Backup #{b.backup_id}</p>
                                <p className="text-sm text-gray-500">Created: {new Date(b.backed_up_at).toLocaleString('en-IN')}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <button onClick={() => setConfirmRestore(b)} disabled={restoringId === b.backup_id}
                                  className="text-sm font-bold text-teal-700 hover:underline px-4 py-2 border border-teal-200 bg-teal-50/50 rounded-xl disabled:opacity-50 transition-colors">
                                  {restoringId === b.backup_id ? <Loader2 size={16} className="animate-spin" /> : 'Restore'}
                                </button>
                                <button onClick={async () => {
                                  if (!window.confirm('Delete this backup?')) return
                                  await fetch(`${API_BASE}/settings/backups/${b.backup_id}`, { method: 'DELETE', headers: authHeaders() })
                                  setBackupList(prev => prev.filter(x => x.backup_id !== b.backup_id))
                                  showToast('Backup deleted', 'success')
                                }} className="text-sm font-bold text-red-500 hover:underline px-4 py-2 border border-red-200 rounded-xl transition-colors">Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-base text-gray-400 text-center py-6">No backups yet. Click "Backup Now" to create one.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Restore Confirm Modal */}
      {confirmRestore && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Restore Backup?</h3>
            <p className="text-base text-gray-600 mb-3">
              This will <span className="font-bold text-red-600">replace all current products and categories</span> with data from Backup #{confirmRestore.backup_id}.
            </p>
            <p className="text-sm text-gray-400 mb-6">Created: {new Date(confirmRestore.backed_up_at).toLocaleString('en-IN')}</p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setConfirmRestore(null)} className="px-5 py-2.5 text-base border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold">Cancel</button>
              <button onClick={async () => {
                setRestoringId(confirmRestore.backup_id); setConfirmRestore(null)
                try {
                  const res = await fetch(`${API_BASE}/settings/backups/${confirmRestore.backup_id}/restore`, { method: 'POST', headers: authHeaders() })
                  const data = await res.json()
                  if (res.ok) showToast('Data restored successfully!', 'success')
                  else showToast(data.message || 'Restore failed', 'error')
                } catch { showToast('Restore failed', 'error') }
                finally { setRestoringId(null) }
              }} className="px-5 py-2.5 text-base bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm">Yes, Restore</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSettings