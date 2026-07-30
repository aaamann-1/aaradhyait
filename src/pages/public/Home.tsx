import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  MessageCircle, 
  Phone, 
  Shield, 
  Clock, 
  Users, 
  Package, 
  Star, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2,
  Monitor,
  Printer,
  Store,
  Wrench
} from 'lucide-react'
import { getStats } from '../../services/public/statsService'
import { getProducts } from '../../services/public/productsService'

import scannerImg from '../../assets/scanner.png' 

const services = [
  { 
    icon: <Monitor className="w-7 h-7 text-blue-600 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6" />, 
    title: 'ERP & Billing Software', 
    description: 'For retail, FMCG & pharma businesses across Goa.',
  },
  { 
    icon: <Printer className="w-7 h-7 text-blue-600 transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6" />, 
    title: 'Barcode & Label Printers', 
    description: 'Fast, reliable hardware for high-volume environments.',
  },
  { 
    icon: <Store className="w-7 h-7 text-blue-600 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6" />, 
    title: 'POS Systems', 
    description: 'Mobile & desktop point of sale solutions.',
  },
  { 
    icon: <Wrench className="w-7 h-7 text-blue-600 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" />, 
    title: 'AMC & Support', 
    description: 'Annual maintenance & 24/7 technical support.',
  },
]

const StatCard = ({ value, label, suffix = '' }: { value: number, label: string, suffix?: string }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!value) return
    const delay = setTimeout(() => {
      let start = 0
      const duration = 2000
      const step = value / (duration / 16)
      const timer = setInterval(() => {
        start += step
        if (start >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)
      return () => clearInterval(timer)
    }, 300)
    return () => clearInterval(delay)
  }, [value])

  return (
    <div className="text-center transform transition-transform duration-300 hover:scale-105">
      <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
        {count}{suffix}
      </div>
      <div className="text-sm md:text-base text-blue-200 font-medium mt-1">
        {label}
      </div>
    </div>
  )
}

const Home = () => {
  const [stats, setStats] = useState<any>(null)
  const [bestSellers, setBestSellers] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, productsData] = await Promise.all([
          getStats(),
          getProducts()
        ])
        setStats(statsData)
        setBestSellers(productsData?.slice(0, 3) || [])
      } catch (error) {
        console.error('Error fetching home data:', error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="bg-white text-gray-800 text-base md:text-lg leading-relaxed overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white z-10 pb-24 pt-10 md:pt-16 lg:pb-32 overflow-hidden">
        
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/25 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse duration-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Area */}
            <div className="lg:col-span-7 z-10 transition-all duration-700 transform translate-y-0 opacity-100">
              
              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-400/30 backdrop-blur-md rounded-full px-4 py-2 text-sm md:text-base text-blue-200 mb-6 shadow-lg shadow-blue-950/50 font-medium hover:border-blue-400/60 transition-all cursor-default animate-fade-in">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <Sparkles size={16} className="text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Trusted IT Partner Since 2014 · Goa</span>
              </div>

              {/* Animated Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 animate-fade-in-up transform transition-all duration-700 hover:translate-x-1 cursor-default">
  <span className="block">
    Powering FMCG (Fast Moving Consumer Goods) &amp;{' '}
  </span>
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-white bg-[length:200%_auto] animate-gradient inline-block">
    Pharma Businesses
  </span>{' '}
  <span className="block mt-2 sm:mt-0">
    Across Goa &amp; North Kannada
  </span>
</h1>

              <p className="text-blue-100 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl opacity-90 animate-fade-in">
                Software and hardware solutions built for the way you work. 
                From ERP and billing to POS systems and AMC support — we have got you covered.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <Link 
                  to="/products" 
                  className="group relative inline-flex items-center justify-center gap-2 bg-white text-blue-900 font-bold text-lg px-7 py-3.5 rounded-xl shadow-xl hover:shadow-blue-400/30 hover:bg-blue-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <span>Browse Products</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>

                <a 
                  href="https://wa.me/917875419620" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg px-7 py-3.5 rounded-xl shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <MessageCircle size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>WhatsApp Us</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 pt-6 border-t border-blue-800/50 flex flex-wrap items-center gap-8 text-sm sm:text-base text-blue-200 font-medium">
                <div className="flex items-center gap-2.5 transition-transform hover:scale-105">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>Authorised Marg ERP Partner</span>
                </div>
                <div className="flex items-center gap-2.5 transition-transform hover:scale-105">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>On-Site Goa Support</span>
                </div>
              </div>

            </div>

            {/* Right Showcase Area */}
            <div className="lg:col-span-5 relative flex items-center justify-center pt-2 lg:pt-0">
              
              <div className="absolute w-72 h-72 sm:w-[380px] sm:h-[380px] bg-blue-400/30 rounded-full blur-[100px] pointer-events-none animate-pulse" />

              <div className="relative z-20 transition-all duration-700 hover:scale-105 filter drop-shadow-[0_30px_45px_rgba(0,0,0,0.7)] -mt-4 sm:-mt-6 -mb-24 lg:-mb-36 sm:-mr-2">
                
                {/* Immersive Sweeping Laser Line */}
                <div className="absolute top-[36%] left-6 right-6 h-0.5 bg-red-500 shadow-[0_0_20px_#ef4444,0_0_10px_#ff0000] z-30 animate-pulse pointer-events-none" />

                <img 
                  src={scannerImg} 
                  alt="Wasp Barcode Scanner" 
                  className="w-full max-w-xs sm:max-w-md mx-auto object-contain transform rotate-[-3deg] hover:rotate-0 transition-transform duration-700 hover:scale-105"
                />

                {/* Floating Tech Badge */}
                <div className="absolute bottom-12 -left-3 bg-slate-900/90 border border-blue-500/50 backdrop-blur-xl text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce duration-[3000ms]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span>High-Speed Laser Scanning</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Presentational Stats Display */}
        <div className="mt-24 border-t border-blue-800/60 bg-blue-900/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard value={2000} label="Businesses Served" suffix="+" />
<StatCard value={14} label="Years Experience" suffix="+" />
<StatCard value={stats?.totalProducts ?? 9} label="Products" suffix="+" />
              <div className="text-center transform transition-transform duration-300 hover:scale-105">
                <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">24/7</div>
                <div className="text-sm md:text-base text-blue-200 font-medium mt-1">
                  Customer Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="pt-24 pb-16 md:pb-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-bold text-sm sm:text-base uppercase tracking-wider mb-2 animate-pulse">What We Offer</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Our Services</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-base sm:text-lg">
              End-to-end IT solutions designed for retail, pharma and FMCG businesses.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div 
                key={service.title} 
                className="group bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden"
              >
                {/* Subtle Hover Gradient Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  {service.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-2.5 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-blue-600 font-bold text-sm sm:text-base uppercase tracking-wider mb-2">Top Picks</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Best Sellers</h2>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-base group">
              <span>View All</span>
              <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bestSellers.map((product) => (
              <Link 
                key={product.id} 
                to={`/products/${product.id}`} 
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-52 flex items-center justify-center overflow-hidden relative">
                  {product.image_path ? (
                    <img
                      src={product.image_path}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      <Package size={30} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                    <h3 className="font-bold text-gray-900 text-lg md:text-xl mt-3 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                    <p className="text-sm md:text-base text-gray-600 line-clamp-2">{product.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-5 text-blue-600 text-sm md:text-base font-bold group-hover:translate-x-2 transition-transform duration-300">
                    <span>View Details</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-bold text-sm sm:text-base uppercase tracking-wider mb-2">Why Us</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">What Makes Us Different</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Users size={26} className="group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />, title: 'Local Expertise', desc: 'Deep understanding of the Goa business landscape.' },
              { icon: <Shield size={26} className="group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300" />, title: 'Secure Assets', desc: 'Enterprise-grade cybersecurity in every solution.' },
              { icon: <Clock size={26} className="group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />, title: '24/7 Support', desc: 'On-site and remote assistance across Goa.' },
              { icon: <Star size={26} className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />, title: 'Custom Build', desc: 'Tailored hardware and software for your workflow.' },
            ].map((item) => (
              <div 
                key={item.title} 
                className="group bg-white/80 backdrop-blur-md rounded-2xl p-7 border border-blue-100/60 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-all duration-500 shadow-md">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-bold text-sm sm:text-base uppercase tracking-wider mb-2">Reviews</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">What Our Clients Say</h2>
          </div>
          <div className="elfsight-app-49367418-ffda-40bc-b3b2-dac7f5616d04" data-elfsight-app-lazy />
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-16 sm:py-20 relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Ready to Transform Your Business?</h2>
          <p className="text-blue-100 text-base md:text-xl mb-8 max-w-xl mx-auto opacity-90">Talk to our team today and get a free consultation for your IT needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/917875419620" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-bold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl">
              <MessageCircle size={20} className="hover:rotate-12 transition-transform" />
              WhatsApp Us
            </a>
            <a href="tel:+919146192757" className="inline-flex items-center justify-center gap-2 border-2 border-white/80 text-white font-bold text-base md:text-lg px-8 py-4 rounded-xl hover:bg-white/10 hover:border-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl">
              <Phone size={20} className="hover:animate-bounce" />
              Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home