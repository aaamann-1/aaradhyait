import { useState, useEffect } from 'react'
import { MessageSquare, Search, Filter, CheckCircle, Trash2 } from 'lucide-react'
import { getInquiries, updateInquiryStatus, deleteInquiry } from '../../services/admin/inquiriesService'

const tabs = ['All', 'New', 'Seen', 'Replied', 'Resolved']

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Seen: 'bg-yellow-100 text-yellow-800',
  Replied: 'bg-green-100 text-green-800',
  Resolved: 'bg-gray-100 text-gray-700',
}

const methodColors: Record<string, string> = {
  WhatsApp: 'bg-green-100 text-green-800',
  Phone: 'bg-blue-100 text-blue-800',
  Website: 'bg-purple-100 text-purple-800',
}

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const data = await getInquiries()
        setInquiries(data || [])
      } catch (error) {
        console.error('Error fetching inquiries:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInquiries()
  }, [])

  const filtered = inquiries.filter(i => {
    const matchTab = activeTab === 'All' || i.status === activeTab
    const matchSearch = i.product.toLowerCase().includes(search.toLowerCase()) ||
      i.message.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const selectedInquiry = inquiries.find(i => i.id === selected)

  // Auto mark as Seen when selected
  const handleSelect = async (id: number) => {
    if (id === selected) { setSelected(null); return }
    setSelected(id)
    const inq = inquiries.find(i => i.id === id)
    if (inq && inq.status === 'New') {
      try {
        await updateInquiryStatus(id, 'Seen')
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'Seen' } : i))
      } catch (e) { console.error(e) }
    }
  }

  // Mark as Replied
  const handleWhatsApp = async (inq: any) => {
    if (inq.status === 'New' || inq.status === 'Seen') {
      try {
        await updateInquiryStatus(inq.id, 'Replied')
        setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: 'Replied' } : i))
      } catch (e) { console.error(e) }
    }
    window.open(
      `https://wa.me/919876543210?text=Hi, regarding your inquiry about ${encodeURIComponent(inq.product)}`,
      '_blank'
    )
  }

  const handleCall = async (inq: any) => {
    if (inq.status === 'New' || inq.status === 'Seen') {
      try {
        await updateInquiryStatus(inq.id, 'Replied')
        setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: 'Replied' } : i))
      } catch (e) { console.error(e) }
    }
    window.location.href = 'tel:+919876543210'
  }

  // Mark as Resolved
  const handleResolve = async (inq: any) => {
    try {
      await updateInquiryStatus(inq.id, 'Resolved')
      setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: 'Resolved' } : i))
    } catch (e) { console.error(e) }
  }

  // Delete inquiry
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return
    try {
      await deleteInquiry(id)
      setInquiries(prev => prev.filter(i => i.id !== id))
      if (selected === id) setSelected(null)
    } catch (e) { console.error(e) }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Product', 'Method', 'Status', 'Message', 'Time']
    const rows = inquiries.map(i => [
      i.id,
      `"${i.product}"`,
      i.method,
      i.status,
      `"${i.message.replace(/"/g, '""')}"`,
      `"${i.time}"`
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inquiries_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiry Logs</h1>
          <p className="text-gray-500 text-base mt-1">All customer inquiries in one place.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Filter size={17} />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search inquiries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelected(null) }}
            className={`shrink-0 px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {tab}
            {tab === 'All' ? (
              <span className="ml-1.5 text-xs opacity-80">({inquiries.length})</span>
            ) : (
              <span className="ml-1.5 text-xs opacity-80">
                ({inquiries.filter(i => i.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Inquiry List */}
        <div className="lg:col-span-2 space-y-3.5">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-base font-medium">No inquiries found.</p>
            </div>
          ) : (
            filtered.map(inquiry => (
              <div
                key={inquiry.id}
                onClick={() => handleSelect(inquiry.id)}
                className={`bg-white rounded-2xl border shadow-sm p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selected === inquiry.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base truncate">{inquiry.product}</p>
                   <p className="text-xs text-gray-500 mt-0.5 font-medium">
  {inquiry.id} · {new Date(inquiry.time).toLocaleString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  })}
</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${methodColors[inquiry.method] || 'bg-gray-100'}`}>
                      {inquiry.method}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[inquiry.status] || 'bg-gray-100'}`}>
                      {inquiry.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{inquiry.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="hidden lg:block">
          {selectedInquiry ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedInquiry.product}</h3>
              <p className="text-xs text-gray-500 mb-5 font-medium">{selectedInquiry.id} · {selectedInquiry.time}</p>

              <div className="space-y-3.5 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[selectedInquiry.status] || 'bg-gray-100'}`}>
                    {selectedInquiry.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Method</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${methodColors[selectedInquiry.method] || 'bg-gray-100'}`}>
                    {selectedInquiry.method}
                  </span>
                </div>
                {selectedInquiry.full_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Name</span>
                    <span className="text-gray-900 font-semibold">{selectedInquiry.full_name}</span>
                  </div>
                )}
                {selectedInquiry.phone_no && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Phone</span>
                    <span className="text-gray-900 font-semibold">{selectedInquiry.phone_no}</span>
                  </div>
                )}
                {selectedInquiry.business_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Business</span>
                    <span className="text-gray-900 font-semibold">{selectedInquiry.business_name}</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedInquiry.message}</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => handleWhatsApp(selectedInquiry)}
                  className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm"
                >
                  Reply on WhatsApp
                </button>
                <button
                  onClick={() => handleCall(selectedInquiry)}
                  className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Call Customer
                </button>
                {selectedInquiry.status !== 'Resolved' && (
                  <button
                    onClick={() => handleResolve(selectedInquiry)}
                    className="flex items-center justify-center gap-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold py-3 rounded-xl transition-colors"
                  >
                    <CheckCircle size={17} />
                    Mark as Resolved
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-3 rounded-xl transition-colors"
                >
                  <Trash2 size={17} />
                  Delete Inquiry
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center sticky top-6">
              <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Select an inquiry to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminInquiries