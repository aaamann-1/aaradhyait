import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { getCompanyInfo, type CompanyInfo } from '../../services/public/companyInfoService'

const defaultInfo: CompanyInfo = {
  companyName: 'Aaradhya IT Solution',
  supportEmail: 'aaradhyait@gmail.com',
  salesEmail: 'devsharmagoa@gmail.com',
  primaryPhone: '7875419620',
  whatsapp: '7875419620',
  supportPhone1: '9146192728', 
  supportPhone2: '9146192729', 
  supportPhone3: '9146192730',
  salesPhone1: '9960972729', 
  salesPhone2: '9021058353',
  address1: 'Flat No.404, 4th Floor, Crossroads Elite',
  address2: 'Fatorda, Near Arlem Circle, Margao, Goa',
  city: '', state: '', pin: '',
  youtube: '', instagram: '', facebook: '',
  customSocials: '',
  logoPath: '',
  hoursWeekday: '', hoursWeekdayOpen: true,
  hoursSaturday: '', hoursSaturdayOpen: true,
  hoursSunday: '', hoursSundayOpen: false,
}

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.69.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.948C23.728 2.695 21.305.273 16.949.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const Footer = () => {
  const [info, setInfo] = useState<CompanyInfo>(defaultInfo)

  useEffect(() => {
    getCompanyInfo()
      .then(data => setInfo(prev => ({ ...prev, ...data })))
      .catch(() => {})
  }, [])

  const whatsappDigits = info.whatsapp.replace(/[^\d]/g, '')
  const primaryDigits = info.primaryPhone.replace(/[^\d]/g, '')
  const addressLine = [info.address1, info.address2].filter(Boolean).join(', ')

  const mobilePhones = [info.primaryPhone, info.whatsapp].filter(Boolean)
  const supportPhones = [info.supportPhone1, info.supportPhone2, info.supportPhone3].filter(Boolean)
  const salesPhones = [info.salesPhone1, info.salesPhone2].filter(Boolean)

  const allEmails = [info.supportEmail, info.salesEmail].filter(Boolean)

  const fixedSocials = [
    { key: 'youtube', url: info.youtube, label: 'YouTube', icon: <YoutubeIcon /> },
    { key: 'instagram', url: info.instagram, label: 'Instagram', icon: <InstagramIcon /> },
    { key: 'facebook', url: info.facebook, label: 'Facebook', icon: <FacebookIcon /> },
  ].filter(link => link.url && link.url.trim() !== '')

  let customLinks: { label: string; url: string }[] = []
  try {
    if (info.customSocials) customLinks = JSON.parse(info.customSocials)
  } catch {}

  const allSocials = [
    ...fixedSocials,
    ...customLinks.filter(l => l.url && l.url.trim() !== '').map(l => ({
      key: l.label,
      url: l.url,
      label: l.label,
      icon: <LinkIcon />,
    })),
  ]

  const PhoneGroup = ({ label, phones }: { label: string; phones: string[] }) => {
    if (!phones || phones.length === 0) return null
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          {label}
        </div>
        <div className="flex items-center gap-2 flex-wrap pl-3.5">
          <Phone size={13} className="shrink-0 text-blue-400/80" />
          {phones.map((phone, i) => (
            <span key={i} className="flex items-center gap-2 text-sm text-gray-300">
              <a
                href={`tel:+${phone.replace(/[^\d]/g, '')}`}
                className="hover:text-blue-400 font-mono transition-colors"
              >
                {phone}
              </a>
              {i < phones.length - 1 && <span className="text-gray-600 font-normal">/</span>}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <footer className="bg-slate-950 text-gray-300 border-t border-gray-800/80 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">

          {/* Company Branding Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3.5 group">
              <img 
                src={info.logoPath || "https://larjotmzhxdmqzktyafh.supabase.co/storage/v1/object/public/company-assets/Aaradhya_logo.png"} 
                alt={info.companyName || 'Logo'} 
                className="w-12 h-12 object-contain transition-transform group-hover:scale-105" 
              />
              <span className="font-bold text-2xl tracking-tight">
                <span className="text-red-500">Aaradhya</span>{' '}
                <span className="text-blue-400">IT Solution</span>
              </span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              Your trusted partner in retail automation, Marg ERP, and enterprise hardware solutions.
              Empowering Goa's businesses with cutting-edge technology and reliable support since 2014.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs"
              >
                <MessageCircle size={17} />
                WhatsApp Us
              </a>
              <a
                href={`tel:+${primaryDigits}`}
                className="flex items-center gap-2 bg-gray-900 border border-gray-700 hover:border-blue-500 hover:text-blue-400 text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                <Phone size={17} className="text-blue-400" />
                Call Us
              </a>
            </div>

            {allSocials.length > 0 && (
              <div className="pt-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Follow Us
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  {allSocials.map(link => (
                    <a
                      key={link.key}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      title={link.label}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-xs"
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Column (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5 pb-2 border-b border-gray-800">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', path: '/' },
                { label: 'Products & Hardware', path: '/products' },
                { label: 'Marg ERP Solutions', path: '/marg-erp' },
                { label: 'About Our Company', path: '/about' },
                { label: 'Contact & Support', path: '/contact' },
              ].map(link => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-gray-300 hover:text-blue-400 transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information Column (4 cols) */}
          <div className="lg:col-span-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5 pb-2 border-b border-gray-800">
              Contact Numbers
            </h3>
            
            {/* Phone List */}
            <div className="space-y-4 mb-6">
              <PhoneGroup label="Mobile" phones={mobilePhones} />
              <PhoneGroup label="Support Desk" phones={supportPhones} />
              <PhoneGroup label="Sales & Business" phones={salesPhones} />
            </div>

            {/* Email & Location */}
            <div className="space-y-3 pt-4 border-t border-gray-800/80">
              {allEmails.map((email, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <Mail size={15} className="shrink-0 text-blue-400" />
                  <a href={`mailto:${email}`} className="hover:text-blue-400 transition-colors truncate">
                    {email}
                  </a>
                </div>
              ))}
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <MapPin size={15} className="mt-1 shrink-0 text-blue-400" />
                <span className="leading-relaxed text-gray-400">{addressLine}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Aaradhya IT Solution. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="hover:text-gray-200 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-gray-700">•</span>
            <span className="hover:text-gray-200 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer