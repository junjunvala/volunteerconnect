// src/pages/Volunteer/VolunteerProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Shared/Navbar';
import { PageWrapper } from '../../components/Shared/UI';
import api from '../../utils/api';
import { SKILLS, AVAILABILITY_OPTIONS } from '../../utils/helpers';

export default function VolunteerProfile() {
  const navigate  = useNavigate();
  const [form, setForm] = useState({
    name: '', phone: '', skills: [], availability: [],
    location: { city: '', lat: 0, lng: 0 },
    isAvailable: true,
  });
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    api.get('/volunteer/profile').then(r => {
      const u = r.data;
      setForm({
        name: u.name || '',
        phone: u.phone || '',
        skills: u.skills || [],
        availability: u.availability || [],
        location: u.location || { city: '', lat: 0, lng: 0 },
        isAvailable: u.isAvailable !== false,
      });
    }).finally(() => setFetching(false));
  }, []);

  const toggleSkill = (s) =>
    setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));

  const toggleAvail = (a) =>
    setForm(f => ({ ...f, availability: f.availability.includes(a) ? f.availability.filter(x => x !== a) : [...f.availability, a] }));

  const getGPS = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setForm(f => ({ ...f, location: { ...f.location, lat: pos.coords.latitude, lng: pos.coords.longitude }}));
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/volunteer/profile', form);
      setSaved(true);
      setTimeout(() => navigate('/volunteer'), 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <><Navbar /><div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"/></div></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Your Profile</h1>
        <p className="text-sm text-gray-500 mb-6">This info helps us match you with the right tasks.</p>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 mb-4 text-sm font-medium">
            ✅ Profile saved! Redirecting…
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-700">Basic Info</h2>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Full name</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Phone</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="available" checked={form.isAvailable}
                onChange={e => setForm({...form, isAvailable: e.target.checked})}
                className="w-4 h-4 accent-blue-600" />
              <label htmlFor="available" className="text-sm text-gray-600">I am currently available for tasks</label>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <h2 className="font-semibold text-gray-700">Location</h2>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City (e.g. Ahmedabad)"
              value={form.location.city}
              onChange={e => setForm({...form, location: {...form.location, city: e.target.value}})} />
            <div className="flex gap-2">
              <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Latitude" type="number" step="any"
                value={form.location.lat || ''}
                onChange={e => setForm({...form, location: {...form.location, lat: parseFloat(e.target.value) || 0}})} />
              <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Longitude" type="number" step="any"
                value={form.location.lng || ''}
                onChange={e => setForm({...form, location: {...form.location, lng: parseFloat(e.target.value) || 0}})} />
              <button type="button" onClick={getGPS}
                className="bg-blue-50 text-blue-600 text-xs px-3 rounded-xl hover:bg-blue-100 whitespace-nowrap">
                📍 Auto-detect
              </button>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Skills <span className="text-red-500">*</span></h2>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <button key={s} type="button" onClick={() => toggleSkill(s)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    form.skills.includes(s)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            {form.skills.length === 0 && <p className="text-xs text-red-500 mt-2">Please select at least one skill</p>}
          </div>

          {/* Availability */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Availability</h2>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map(a => (
                <button key={a} type="button" onClick={() => toggleAvail(a)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    form.availability.includes(a)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || form.skills.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Saving...' : 'Save Profile ✓'}
          </button>
        </form>
      </div>
    </div>
  );
}
