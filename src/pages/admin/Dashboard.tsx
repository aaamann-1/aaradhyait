import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, MoreHorizontal, Bell, Calendar, Edit, Trash2,
  Megaphone, Download, HeadphonesIcon, Loader2, ChevronDown
} from 'lucide-react'
import { getDashboardData } from '../../services/admin/dashboardService'
import { exportInquiriesCSV, exportProductsCSV } from '../../services/admin/reportsService'
import { getNewInquiriesCount } from '../../services/admin/inquiriesService'
const Dashboard = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exportOpen, setExportOpen] = useState(false)
  const [newInquiriesCount, setNewInquiriesCount] = useState(0)
  const [exporting, setExporting] = useState<'inquiries' | 'products' | null>(null)

  // Add state for adminName so it can update dynamically
  const [adminName, setAdminName] = useState(localStorage.getItem('adminName') || 'Admin')

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })

  const statusColors: Record<string, string> = {
    New: 'bg-yellow-400 text-white',
    Seen: 'bg-gray-200 text-gray-700',
    Replied: 'bg-green-100 text-green-800',
    Resolved: 'bg-blue-100 text-blue-800',
  }

  // Listen for the 'storage' event triggered by AdminSidebar (when it fetches from DB) or AdminSettings
  useEffect(() => {
    const syncName = () => {
      setAdminName(localStorage.getItem('adminName') || 'Admin')
    }

    window.addEventListener('storage', syncName)
    // Cleanup listener on unmount
    return () => window.removeEventListener('storage', syncName)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardData()
        setData(result)
      } catch (error) {
        console.error('Dashboard error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getNewInquiriesCount()
        setNewInquiriesCount(count)
      } catch (error) {
        console.error('Failed to fetch new inquiries count:', error)
      }
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  // Close export dropdown when clicking outside
  useEffect(() => {
    if (!exportOpen) return
    const handler = () => setExportOpen(false)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportOpen])

  const handleExport = async (type: 'inquiries' | 'products') => {
    setExporting(type)
    setExportOpen(false)
    try {
      if (type === 'inquiries') await exportInquiriesCSV()
      else await exportProductsCSV()
    } catch (e) {
      console.error('Export failed', e)
    } finally {
      setExporting(null)
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">

      {/* Top Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-base mt-0.5">Welcome back, {adminName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-gray-600 text-sm font-medium">
            <Calendar size={17} />
            {today}
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => navigate('/admin/inquiries?filter=New')}
          >
            <Bell size={22} className="text-gray-600" />
            {newInquiriesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {newInquiriesCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Inquiries', value: data?.stats?.totalInquiries || 0, sub: '+12% ↑', subColor: 'text-green-600', border: 'border-l-4 border-green-500' },
            { label: 'Active Products', value: data?.stats?.totalProducts || 0, sub: 'In Stock', subColor: 'text-yellow-600', border: 'border-l-4 border-yellow-500' },
            { label: 'Avg. Rating', value: data?.stats?.avgRating || '0.0', sub: '★', subColor: 'text-yellow-500', border: 'border-l-4 border-blue-500' },
            { label: 'Experience', value: data?.stats?.experience || '10+', sub: 'Years', subColor: 'text-gray-500', border: 'border-l-4 border-gray-400' },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-xl p-5 shadow-sm ${stat.border}`}>
              <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                <span className={`text-sm font-semibold mb-1 ${stat.subColor}`}>{stat.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Recent Inquiries */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Recent Inquiries</h2>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <span>Product</span>
                <span>Method</span>
                <span>Time</span>
                <span>Status</span>
              </div>
              {data?.recentInquiries?.map((inq: any, i: number) => (
                <div key={i} className="grid grid-cols-4 px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/75 transition-colors items-center">
                  <span className="text-sm text-gray-900 font-medium truncate pr-2">{inq.product}</span>
                  <span className="text-sm text-gray-600">{inq.method}</span>
                  <span className="text-sm text-gray-600">{inq.time}</span>
                  <span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[inq.status]}`}>
                      {inq.status?.toUpperCase()}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {data?.recentInquiries?.map((inq: any, i: number) => (
                <div key={i} className="px-4 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-gray-900 truncate flex-1 pr-2">{inq.product}</p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColors[inq.status]}`}>
                      {inq.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{inq.method} · {inq.time}</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 mt-auto border-t border-gray-50">
              <Link
                to="/admin/inquiries"
                className="block w-full text-center text-blue-600 text-sm font-semibold py-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                View All Inquiries
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Quick Actions</h2>

            <div className="flex-1 flex flex-col justify-center space-y-3">

              {/* Add New Product */}
              <Link
                to="/admin/products"
                className="group flex items-center gap-3.5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-xl transition-colors text-sm"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 shrink-0">
                  <Plus size={18} />
                </span>
                Add New Product
              </Link>

              {/* Post Announcement */}
              <button
                onClick={() => navigate('/admin/announcements')}
                className="group flex items-center gap-3.5 w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700 hover:text-blue-600 font-semibold py-4 px-4 rounded-xl transition-colors text-sm"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 shrink-0 transition-colors">
                  <Megaphone size={18} />
                </span>
                Post Announcement
              </button>

              {/* Export Reports — dropdown */}
              <div className="relative" onMouseDown={e => e.stopPropagation()}>
                <button
                  onClick={() => setExportOpen(o => !o)}
                  disabled={exporting !== null}
                  className="group flex items-center gap-3.5 w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700 hover:text-blue-600 font-semibold py-4 px-4 rounded-xl transition-colors text-sm disabled:opacity-60"
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 shrink-0 transition-colors">
                    {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  </span>
                  <span className="flex-1 text-left">
                    {exporting ? `Exporting ${exporting}...` : 'Export Reports'}
                  </span>
                  {!exporting && <ChevronDown size={16} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />}
                </button>

                {exportOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
                    <button
                      onClick={() => handleExport('inquiries')}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
                    >
                      📋 Export Inquiries CSV
                    </button>
                    <button
                      onClick={() => handleExport('products')}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors border-t border-gray-100"
                    >
                      📦 Export Products CSV
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Recently Added Produc .ts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recently Added Products</h2>
            <Link to="/admin/products" className="text-blue-600 text-sm font-semibold hover:underline">View All</Link>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-5 px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <span>Preview</span>
              <span className="col-span-2">Product Name</span>
              <span>Category</span>
              <span>Actions</span>
            </div>
            {data?.recentProducts?.map((product: any, i: number) => (
              <div key={i} className="grid grid-cols-5 px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/75 transition-colors items-center">
                <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {product.image_path
                    ? <img src={product.image_path} alt={product.name} className="w-full h-full object-cover" />
                    : <span className="text-gray-400 text-xs">No img</span>
                  }
                </div>
                <div className="col-span-2 pr-4">
                  <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                </div>
                <div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${product.type === 'Hardware' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {product.type?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-green-600 hover:text-green-800 transition-colors p-1">
                    <Edit size={17} />
                  </button>
                  <button className="text-red-500 hover:text-red-700 transition-colors p-1">
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {data?.recentProducts?.map((product: any, i: number) => (
              <div key={i} className="px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {product.image_path
                    ? <img src={product.image_path} alt={product.name} className="w-full h-full object-cover" />
                    : <span className="text-gray-400 text-xs">No img</span>
                  }
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${product.type === 'Hardware' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                  {product.type?.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button className="text-green-600 hover:text-green-800 p-1.5">
                    <Edit size={16} />
                  </button>
                  <button className="text-red-500 hover:text-red-700 p-1.5">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard