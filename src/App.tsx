import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

// Public Pages
import Home from './pages/public/Home'
import Products from './pages/public/Products'
import ProductDetail from './pages/public/ProductDetail'
import MargErp from './pages/public/MargERP'
import About from './pages/public/About'
import Contact from './pages/public/Contact'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminInquiries from './pages/admin/AdminInquiries'
import AdminSettings from './pages/admin/AdminSettings'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminEmployees from './pages/admin/Employees'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'

// Protected Route
import ProtectedRoute from './components/admin/ProtectedRoute'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/marg-erp" element={<MargErp />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/inquiries" element={<AdminInquiries />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App