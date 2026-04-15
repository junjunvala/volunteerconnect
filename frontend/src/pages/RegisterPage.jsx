// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [params]          = useSearchParams();
  const [form, setForm]   = useState({
    name: '', email: '', password: '', phone: '',
    role: params.get('role') || 'volunteer',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'admin' ? '/admin' : '/volunteer/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🤝</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join VolunteerConnect AI</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Role toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {['volunteer','admin'].map(r => (
              <button
                key={r} type="button"
                onClick={() => setForm({...form, role: r})}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  form.role === r ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                {r === 'volunteer' ? '🙋 Volunteer' : '🏢 NGO / Admin'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" required placeholder="Full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            />
            <input
              type="email" required placeholder="Email address"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            />
            <input
              type="password" required placeholder="Password (min 6 chars)" minLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            />
            <input
              type="tel" placeholder="Phone number (optional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            />
            {form.role === 'admin' && (
              <input
                type="text" placeholder="Organization / NGO name" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.organizationName} onChange={e => setForm({...form, organizationName: e.target.value})}
              />
            )}
            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          {form.role === 'volunteer' && (
            <p className="text-xs text-gray-400 text-center mt-3">
              You'll set up your skills and availability on the next page.
            </p>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
