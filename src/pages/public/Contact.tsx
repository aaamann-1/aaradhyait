import { useState, useEffect } from 'react'
import { Phone, Mail, MapPin, MessageCircle, Clock, CheckCircle } from 'lucide-react'
import { submitInquiry } from '../../services/public/inquiriesService'
import { getCompanyInfo, type CompanyInfo } from '../../services/public/companyInfoService'

const defaultInfo: CompanyInfo = {
  companyName: 'Aaradhya IT Solutions',
  supportEmail: 'contact@aaradhya-it.com',
  salesEmail: '',
  primaryPhone: '+91 91461 92757',
  whatsapp: '+91 78754 19620',
  supportPhone1: '', supportPhone2: '', supportPhone3: '',
  salesPhone1: '', salesPhone2: '',
  address1: 'Flat No.404, 4th Floor, Crossroads Elite',
  address2: 'Fatorda, Near Arlem Circle, Margao, Goa',
  city: '', state: '', pin: '',
  youtube: '', instagram: '', facebook: '',
  customSocials: '',
  logoPath: '',
  hoursWeekday: '9:00 AM - 7:00 PM', hoursWeekdayOpen: true,
  hoursSaturday: '10:00 AM - 5:00 PM', hoursSaturdayOpen: true,
  hoursSunday: 'Closed', hoursSundayOpen: false,
}

const Contact = () => {
  const [form, setForm] = useState({ name: '', business: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState<CompanyInfo>(defaultInfo)

  useEffect(() => {
    getCompanyInfo()
      .then(data => setInfo(prev => ({ ...prev, ...data })))
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      setError('Name and phone number are required.')
      return
    }
    setLoading(true)
    try {
      await submitInquiry(form)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const phoneDigits = info.primaryPhone.replace(/[^\d]/g, '')
  const whatsappDigits = info.whatsapp.replace(/[^\d]/g, '')
  const addressLine = [info.address1, info.address2].filter(Boolean).join(', ')
  const officeSub = [info.city, info.state].filter(Boolean).join(', ') + (info.pin ? ` — ${info.pin}` : '')

  const businessHours = [
    { day: 'Monday – Friday', hours: info.hoursWeekdayOpen ? info.hoursWeekday : 'Closed' },
    { day: 'Saturday', hours: info.hoursSaturdayOpen ? info.hoursSaturday : 'Closed' },
    { day: 'Sunday', hours: info.hoursSundayOpen ? info.hoursSunday : 'Closed' },
  ]

  return (
    <div className="bg-white text-gray-800">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block bg-blue-500/20 text-blue-300 font-semibold text-xs tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-blue-400/30 mb-4">
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
              Contact <span className="text-blue-400">Us</span>
            </h1>
            <p className="text-blue-100 text-base sm:text-lg leading-relaxed font-medium">
              Have a question or need a quote? Our team is ready to help.
              Reach out via WhatsApp, phone, or fill out the form below.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact Info & Hours */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">Reach Us Directly</h2>
              
              {/* Info Cards */}
              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: <Phone size={20} className="text-blue-600" />,
                    label: 'Phone',
                    value: info.primaryPhone,
                    sub: 'Mon–Sat, 9am–6pm',
                    href: `tel:+${phoneDigits}`
                  },
                  {
                    icon: <MessageCircle size={20} className="text-emerald-600" />,
                    label: 'WhatsApp',
                    value: info.whatsapp,
                    sub: 'Usually replies within minutes',
                    href: `https://wa.me/${whatsappDigits}`
                  },
                  {
                    icon: <Mail size={20} className="text-blue-600" />,
                    label: 'Email',
                    value: info.supportEmail,
                    sub: 'We reply within 24 hours',
                    href: `mailto:${info.supportEmail}`
                  },
                  {
                    icon: <MapPin size={20} className="text-blue-600" />,
                    label: 'Office',
                    value: addressLine,
                    sub: officeSub,
                    href: `https://maps.google.com/?q=${encodeURIComponent(addressLine)}`
                  },
                ].map(item => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="font-bold text-gray-900 text-base">{item.value}</p>
                      {item.sub && <p className="text-sm text-gray-500 mt-0.5 font-medium">{item.sub}</p>}
                    </div>
                  </a>
                ))}
              </div>

              {/* Business Hours */}
              <div className="bg-blue-50/70 rounded-2xl p-6 border border-blue-100/80 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={20} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-base">Business Hours</h3>
                </div>
                <div className="space-y-2.5">
                  {businessHours.map(item => (
                    <div key={item.day} className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">{item.day}</span>
                      <span className={`font-semibold ${item.hours === 'Closed' ? 'text-rose-600' : 'text-gray-900'}`}>
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enquiry Form */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Sent!</h3>
                  <p className="text-gray-600 text-sm max-w-xs font-medium">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', business: '', phone: '', message: '' }) }}
                    className="mt-6 text-blue-600 font-bold text-sm hover:underline"
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send an Enquiry</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
                      <input
                        type="text"
                        name="business"
                        value={form.business}
                        onChange={handleChange}
                        placeholder="Your business or shop name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us what you need..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    {error && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : 'Send Enquiry'}
                    </button>

                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm"
                    >
                      <MessageCircle size={18} />
                      Or Chat on WhatsApp
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Google Maps */}
          <div className="mt-12 rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm">
            <iframe
              title="Aaradhya IT Solutions Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3848.4551271996106!2d73.97288449999999!3d15.2974818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfb30da9653d65%3A0x6d33aa67f8a85991!2sAaradhya%20IT%20Solution!5e0!3m2!1sen!2sin!4v1780377341458!5m2!1sen!2sin"
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact