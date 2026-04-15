// src/pages/Admin/CreateTask.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Shared/Navbar';
import api from '../../utils/api';
import { SKILLS, CATEGORIES } from '../../utils/helpers';

export default function CreateTask() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: { address: '', city: '', lat: '', lng: '' },
    requiredSkills: [],
    volunteersNeeded: 5,
    urgencyLevel: 'Medium',
    deadline: '',
    category: 'Other',
  });
  const [loading, setLoading]       = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [error, setError]           = useState('');

  const toggleSkill = (s) =>
    setForm(f => ({
      ...f,
      requiredSkills: f.requiredSkills.includes(s)
        ? f.requiredSkills.filter(x => x !== s)
        : [...f.requiredSkills, s],
    }));

  // AI urgency prediction
  const predictUrgency = async () => {
    if (!form.description || form.description.length < 10) return;
    setPredicting(true);
    try {
      const res = await api.post('/match/predict-urgency', { description: form.description });
      setAiPrediction(res.data);
    } catch (err) {
      console.log('Prediction failed:', err.message);
    } finally {
      setPredicting(false);
    }
  };

  // AI volunteer count suggestion
  const suggestCount = async () => {
    try {
      const res = await api.post('/match/suggest-count', {
        category: form.category,
        description: form.description,
      });
      setForm(f => ({ ...f, volunteersNeeded: res.data.default }));
    } catch (err) {
      console.log('Suggestion failed:', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = {
        ...form,
        location: {
          ...form.location,
          lat: parseFloat(form.location.lat) || 23.0225,
          lng: parseFloat(form.location.lng) || 72.5714,
        },
      };
      const res = await api.post('/admin/task/create', payload);
      navigate(`/admin/task/${res.data.task._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  // Gujarat cities with coordinates
  const citySuggestions = [
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'Surat',     lat: 21.1702, lng: 72.8311 },
    { name: 'Vadodara',  lat: 22.3072, lng: 73.1812 },
    { name: 'Rajkot',    lat: 22.3039, lng: 70.8022 },
    { name: 'Gandhinagar', lat: 23.2156, lng: 72.6369 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Volunteer Task</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in the details — AI will help match the best volunteers.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-700">Task Info</h2>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Task Title *</label>
              <input required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Flood Relief Food Distribution"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Category</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.category}
                onChange={e => { setForm({...form, category: e.target.value}); suggestCount(); }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-600">Description *</label>
                <button type="button" onClick={predictUrgency} disabled={predicting}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  {predicting ? '⏳ Analyzing...' : '🤖 AI: Predict urgency'}
                </button>
              </div>
              <textarea required rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the task, situation, and what volunteers will do..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
              {/* AI prediction result */}
              {aiPrediction && (
                <div className={`mt-2 p-3 rounded-xl text-sm flex items-center justify-between ${
                  aiPrediction.level === 'High'   ? 'bg-red-50 text-red-700' :
                  aiPrediction.level === 'Medium' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-green-50 text-green-700'
                }`}>
                  <span>🤖 AI suggests: <strong>{aiPrediction.level}</strong> urgency ({aiPrediction.confidence}% confidence)</span>
                  <button type="button"
                    onClick={() => setForm({...form, urgencyLevel: aiPrediction.level})}
                    className="text-xs underline ml-2">
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <h2 className="font-semibold text-gray-700">Location</h2>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Address</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street / Area"
                value={form.location.address}
                onChange={e => setForm({...form, location: {...form.location, address: e.target.value}})}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">City *</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {citySuggestions.map(c => (
                  <button key={c.name} type="button"
                    onClick={() => setForm({...form, location: {...form.location, city: c.name, lat: c.lat, lng: c.lng}})}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      form.location.city === c.name
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>
                    {c.name}
                  </button>
                ))}
              </div>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Or type city name"
                value={form.location.city}
                onChange={e => setForm({...form, location: {...form.location, city: e.target.value}})}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">Latitude *</label>
                <input type="number" step="any" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="23.0225"
                  value={form.location.lat}
                  onChange={e => setForm({...form, location: {...form.location, lat: e.target.value}})}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">Longitude *</label>
                <input type="number" step="any" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="72.5714"
                  value={form.location.lng}
                  onChange={e => setForm({...form, location: {...form.location, lng: e.target.value}})}
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Required Skills *</h2>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <button key={s} type="button" onClick={() => toggleSkill(s)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    form.requiredSkills.includes(s)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-700">Task Settings</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-gray-600">Volunteers Needed *</label>
                  <button type="button" onClick={suggestCount}
                    className="text-xs text-blue-500 hover:underline">🤖 Suggest</button>
                </div>
                <input type="number" min="1" max="500" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.volunteersNeeded}
                  onChange={e => setForm({...form, volunteersNeeded: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Urgency Level *</label>
                <div className="flex gap-1.5">
                  {['Low','Medium','High'].map(u => (
                    <button key={u} type="button"
                      onClick={() => setForm({...form, urgencyLevel: u})}
                      className={`flex-1 text-xs py-2.5 rounded-xl border font-medium transition-all ${
                        form.urgencyLevel === u
                          ? u === 'High' ? 'bg-red-500 text-white border-red-500'
                          : u === 'Medium' ? 'bg-yellow-500 text-white border-yellow-500'
                          : 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Deadline *</label>
              <input type="datetime-local" required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.deadline}
                min={new Date().toISOString().slice(0, 16)}
                onChange={e => setForm({...form, deadline: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" disabled={loading || !form.requiredSkills.length}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Creating task...' : '🚀 Create Task & Find Volunteers'}
          </button>
        </form>
      </div>
    </div>
  );
}
