// src/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import Navbar from '../components/Shared/Navbar';

export default function LandingPage() {
  const features = [
    { icon: '🧠', title: 'AI Matching', desc: 'Smart algorithm matches volunteers to tasks based on skills, location, and availability.' },
    { icon: '🗺️', title: 'Real-time Map', desc: 'View task locations on an interactive map. Find help where it\'s needed most.' },
    { icon: '📊', title: 'Analytics', desc: 'Track impact with detailed dashboards showing completion rates and volunteer stats.' },
    { icon: '⚡', title: 'Instant Alerts', desc: 'Volunteers get notified immediately when matched to a task. No delays.' },
    { icon: '🏆', title: 'Reliability Score', desc: 'AI-powered reliability scoring rewards consistent, dependable volunteers.' },
    { icon: '📱', title: 'Mobile Friendly', desc: 'Fully responsive design works perfectly on any device, anywhere.' },
  ];

  const stats = [
    { label: 'Volunteers Matched', value: '2,400+' },
    { label: 'Tasks Completed',    value: '890+'   },
    { label: 'NGOs Onboarded',     value: '50+'    },
    { label: 'Cities Covered',     value: '30+'    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
            <span>🤖</span> AI-Powered Volunteer Coordination
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
            The Right Volunteer,<br />
            <span className="text-blue-200">In the Right Place.</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            VolunteerConnect AI uses smart matching algorithms to connect NGOs with the most qualified volunteers — instantly, accurately, and at scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register?role=volunteer"
              className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              🙋 Join as Volunteer
            </Link>
            <Link to="/register?role=admin"
              className="bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-400 border border-blue-400 transition-colors">
              🏢 Register NGO
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-700 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-white">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-blue-200 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Why VolunteerConnect AI?</h2>
          <p className="text-gray-500 text-center mb-10">Built for maximum social impact with minimum coordination effort.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { step: '1', icon: '📝', title: 'NGO creates task',    desc: 'Define skills, location, urgency, and number of volunteers needed.' },
              { step: '2', icon: '🧠', title: 'AI matches best fit', desc: 'Algorithm scores volunteers by skills, distance & reliability.' },
              { step: '3', icon: '✅', title: 'Volunteer completes', desc: 'Volunteer accepts, shows up, marks complete. Impact tracked.' },
            ].map(s => (
              <div key={s.step} className="relative">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                  {s.icon}
                </div>
                <div className="absolute top-3 left-1/2 w-8 h-0.5 bg-blue-200 hidden sm:block" style={{ transform: 'translateX(22px)' }} />
                <h3 className="font-semibold text-gray-800">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-12 px-4 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Ready to make an impact?</h2>
        <p className="text-blue-200 mb-6">Join thousands of volunteers and NGOs already using VolunteerConnect AI.</p>
        <Link to="/register" className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 inline-block">
          Get Started Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
        <p>🤝 VolunteerConnect AI — Smart Resource Allocation for Social Impact</p>
        <p className="text-gray-600 text-xs mt-1">Built for hackathon demo · Powered by React + Node.js + MongoDB</p>
      </footer>
    </div>
  );
}
