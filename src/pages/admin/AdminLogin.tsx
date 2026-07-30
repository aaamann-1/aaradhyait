import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Lock, User, ArrowRight } from 'lucide-react'
import { loginAdmin } from '../../services/admin/authService'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError('Please enter both username and password.')
      return
    }
    setLoading(true)
    try {
      const data = await loginAdmin(form.username, form.password)
      if (data.token) {
        // ISSUE 1 FIX: Use purely sessionStorage for the token to auto-logout on tab close
        sessionStorage.setItem('adminToken', data.token)
        
        // Keep name/avatar in localStorage for visual persistence across app loads
        localStorage.setItem('adminName', data.user?.fullName || data.name || 'Admin')
        localStorage.setItem('adminAvatar', data.user?.avatarPath || '')
        
        navigate('/admin')
      } else {
        setError(data.message || 'Invalid username or password.')
      }
    } catch (err) {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-red-600">Aaradhya IT Solutions</h1>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-2">Admin Portal</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">Sign In to Dashboard</h2>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="username" value={form.username} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter your username" className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter your password" className="w-full pl-11 pr-11 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><Eye size={18} /></button>
            </div>
          </div>
          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
          <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            {loading ? 'Signing In...' : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
export default AdminLogin