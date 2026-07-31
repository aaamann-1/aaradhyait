import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Phone, Users, Clock, Shield, Award } from 'lucide-react'
import { getStats } from '../../services/public/statsService'
import { getEmployees } from '../../services/public/employeesService'

// Animated counter hook
const useCounter = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started || target === 0) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [started, target, duration])

  return { count, ref }
}

// Stat card with animated counter
const StatCard = ({ value, label, icon, suffix = '' }: { value: number, label: string, icon: React.ReactNode, suffix?: string }) => {
  const { count, ref } = useCounter(value)
  return (
    <div ref={ref} className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100/80 shadow-xs">
      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
        {icon}
      </div>
      <div className="text-3xl font-extrabold text-gray-900 mb-1">{count}{suffix}</div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
    </div>
  )
}

const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

const About = () => {
  const [stats, setStats] = useState<any>(null)
  const [team, setTeam] = useState<any[]>([])

  // Team carousel refs
  const scrollRef = useRef<HTMLDivElement>(null)
  const isPaused = useRef(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await getEmployees()
        setTeam(data)
      } catch (error) {
        console.error('Error fetching team:', error)
      }
    }
    fetchTeam()
  }, [])

  // Auto-scroll team carousel
  useEffect(() => {
    const container = scrollRef.current
    if (!container || team.length === 0) return

    const interval = setInterval(() => {
      if (isPaused.current) return

      const card = container.querySelector('.team-card') as HTMLElement
      const cardWidth = card ? card.offsetWidth + 24 : 280

      const maxScroll = container.scrollWidth - container.clientWidth

      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' })
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [team])

  return (
    <div className="bg-white text-gray-800">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block bg-blue-500/20 text-blue-300 font-semibold text-xs tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-blue-400/30 mb-4">
              About Us
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6">
              Goa's Most Trusted <span className="text-blue-400">IT Solutions</span> Partner
            </h1>
            <p className="text-blue-100 text-base sm:text-lg leading-relaxed font-medium">
              Since 2014, Aaradhya IT Solutions has been empowering retail, pharma, and FMCG businesses
              across Goa with cutting-edge software and hardware solutions — backed by local expertise and
              round-the-clock support.
            </p>
          </div>
        </div>
      </section>

      {/* Key Stats Bar */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats ? (
              <>
                <StatCard value={stats.businessesServed} label="Businesses Served" icon={<Users size={22} />} suffix="+" />
                <StatCard value={stats.yearsExperience} label="Years Experience" icon={<Clock size={22} />} suffix="+" />
                <StatCard value={stats.totalProducts} label="Products" icon={<Award size={22} />} suffix="+" />
                <div className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100/80 shadow-xs">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <Shield size={22} />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 mb-1">24/7</div>
                  <div className="text-sm font-medium text-gray-600">Customer Support</div>
                </div>
              </>
            ) : (
              <>
                <StatCard value={2000} label="Businesses Served" icon={<Users size={22} />} suffix="+" />
<StatCard value={14} label="Years Experience" icon={<Clock size={22} />} suffix="+" />
<StatCard value={8} label="Products" icon={<Award size={22} />} suffix="+" />
                <div className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100/80 shadow-xs">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <Shield size={22} />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 mb-1">24/7</div>
                  <div className="text-sm font-medium text-gray-600">Customer Support</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest block mb-2">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
                Built for Goa's Businesses
              </h2>
              <div className="space-y-4 text-gray-600 text-base leading-relaxed">
                <p>
                  Aaradhya IT Solutions was founded in 2014 with a simple mission — to bring world-class
                  IT infrastructure to the small and medium businesses of Goa that were being left behind
                  by large enterprise vendors.
                </p>
                <p>
                  We started with billing software for local pharmacies and retail shops. Over the years,
                  we've grown into a full-spectrum IT solutions provider — handling everything from ERP
                  deployments and POS systems to hardware supply, networking, and annual maintenance contracts.
                </p>
                <p>
                  Today, we serve over 500 businesses across Panaji, Margao, Vasco, Mapusa, Ponda and
                  beyond — and we're just getting started.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Our Mission', desc: 'To make enterprise-grade IT accessible and affordable for every business in Goa.', color: 'bg-blue-600' },
                { title: 'Our Vision', desc: 'To be the most trusted technology partner for every retail and pharma business in India.', color: 'bg-indigo-600' },
                { title: 'Our Values', desc: 'Integrity, innovation, and genuine care for every client we serve.', color: 'bg-blue-700' },
                { title: 'Our Promise', desc: '24/7 support, onsite assistance, and solutions tailored to your business.', color: 'bg-blue-500' },
              ].map(item => (
                <div key={item.title} className={`${item.color} text-white rounded-2xl p-6 shadow-md hover:scale-[1.02] transition-transform duration-200`}>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-blue-100 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest block mb-2">The People</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Meet Our Team</h2>
          </div>
          <div
            ref={scrollRef}
            onMouseEnter={() => (isPaused.current = true)}
            onMouseLeave={() => (isPaused.current = false)}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          >
            {team.map(member => (
              <div
                key={member.employee_id}
                className="team-card bg-slate-50 rounded-2xl p-6 border border-gray-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-64 shrink-0"
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center bg-blue-600 text-white font-extrabold text-xl shadow-md">
                  {member.photo_path ? (
                    <img src={member.photo_path} alt={member.full_name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(member.full_name)
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-0.5">{member.full_name}</h3>
                <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider mb-3">{member.designation}</p>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {member.experience_years ? `${member.experience_years}+ years of experience.` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews */}
      <section className="py-16 sm:py-24 bg-slate-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest block mb-2">Reviews</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">What Our Clients Say</h2>
          </div>
          <div className="elfsight-app-49367418-ffda-40bc-b3b2-dac7f5616d04" data-elfsight-app-lazy></div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Let's Work Together
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto text-sm sm:text-base">
            Get in touch with our team today for a free consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/917875419620"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/80 hover:border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
            >
              <Phone size={18} />
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

export default About