// src/pages/Admin/AdminTaskDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Shared/Navbar';
import { UrgencyBadge, StatusBadge, SkillChip, ScoreBar, Spinner } from '../../components/Shared/UI';
import MapView from '../../components/Shared/MapView';
import api from '../../utils/api';

export default function AdminTaskDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [data, setData]             = useState(null);
  const [recommendations, setRecs]  = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [assigning, setAssigning]   = useState(false);
  const [selectedVols, setSelectedVols] = useState([]);
  const [activeTab, setActiveTab]   = useState('overview'); // overview | recommendations | assigned

  useEffect(() => {
    api.get(`/admin/task/${id}`).then(r => {
      setData(r.data.task);
      setAssignments(r.data.assignments);
    }).finally(() => setLoading(false));
  }, [id]);

  const loadRecommendations = async () => {
    setLoadingRecs(true);
    setActiveTab('recommendations');
    try {
      const res = await api.get(`/admin/task/${id}/recommendations`);
      setRecs(res.data);
    } catch (err) {
      alert('Failed to load recommendations');
    } finally {
      setLoadingRecs(false);
    }
  };

  const toggleSelect = (volId) =>
    setSelectedVols(prev => prev.includes(volId) ? prev.filter(v => v !== volId) : [...prev, volId]);

  const handleAutoAssign = async () => {
    setAssigning(true);
    try {
      const res = await api.post(`/admin/task/${id}/assign`, { autoAssign: true });
      setData(res.data.task);
      alert(`✅ Auto-assigned ${res.data.task.assignedVolunteers.length} volunteer(s)!`);
      // Reload assignments
      const taskRes = await api.get(`/admin/task/${id}`);
      setAssignments(taskRes.data.assignments);
      setActiveTab('assigned');
    } catch (err) {
      alert(err.response?.data?.message || 'Auto-assign failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleManualAssign = async () => {
    if (!selectedVols.length) return alert('Select at least one volunteer');
    setAssigning(true);
    try {
      const res = await api.post(`/admin/task/${id}/assign`, { volunteerIds: selectedVols });
      setData(res.data.task);
      setSelectedVols([]);
      const taskRes = await api.get(`/admin/task/${id}`);
      setAssignments(taskRes.data.assignments);
      setActiveTab('assigned');
      alert(`✅ ${selectedVols.length} volunteer(s) assigned!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <><Navbar /><Spinner size="lg" /></>;
  if (!data)   return <><Navbar /><div className="text-center py-20 text-gray-400">Task not found</div></>;

  const assignedIds = data.assignedVolunteers?.map(v => (v._id || v).toString()) || [];
  const remaining   = data.volunteersNeeded - assignedIds.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-blue-600 mb-4 flex items-center gap-1">
          ← Back to tasks
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{data.category}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">{data.title}</h1>
              <p className="text-sm text-gray-600">{data.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <UrgencyBadge level={data.urgencyLevel} />
              <StatusBadge status={data.status} />
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
            <div className="text-center bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Location</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">📍 {data.location?.city}</p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Deadline</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">📅 {new Date(data.deadline).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Volunteers Needed</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">👥 {assignedIds.length} / {data.volunteersNeeded}</p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Still Needed</p>
              <p className={`text-sm font-semibold mt-0.5 ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {remaining > 0 ? `⚠️ ${remaining} more` : '✅ Fully staffed'}
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Required skills</p>
            <div className="flex flex-wrap gap-1.5">
              {data.requiredSkills?.map(s => <SkillChip key={s} skill={s} />)}
            </div>
          </div>

          {/* Assignment progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>Assignment progress</span>
              <span>{Math.round((assignedIds.length / data.volunteersNeeded) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${assignedIds.length >= data.volunteersNeeded ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, (assignedIds.length / data.volunteersNeeded) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {remaining > 0 && (
          <div className="flex gap-3 mb-5 flex-wrap">
            <button onClick={loadRecommendations}
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700">
              🧠 Get AI Recommendations
            </button>
            <button onClick={handleAutoAssign} disabled={assigning}
              className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-60">
              {assigning ? '⏳ Assigning...' : '⚡ Auto-Assign Best Matches'}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl border border-gray-100 p-1 w-fit">
          {[
            { key: 'overview',         label: 'Overview' },
            { key: 'recommendations',  label: `🧠 Recommendations ${recommendations.length > 0 ? `(${recommendations.length})` : ''}` },
            { key: 'assigned',         label: `Assigned (${assignments.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3">Task Location</h2>
            <MapView task={data} />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            {loadingRecs ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm text-gray-500">🧠 Running matching algorithm...</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <p className="text-gray-400">Click "Get AI Recommendations" to find matching volunteers</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Manual assign button */}
                {selectedVols.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                    <p className="text-sm text-blue-700 font-medium">{selectedVols.length} volunteer(s) selected</p>
                    <button onClick={handleManualAssign} disabled={assigning}
                      className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-60">
                      {assigning ? 'Assigning...' : `Assign Selected (${selectedVols.length})`}
                    </button>
                  </div>
                )}

                {recommendations.map((r, idx) => {
                  const isAssigned  = assignedIds.includes(r.volunteer._id.toString());
                  const isSelected  = selectedVols.includes(r.volunteer._id);

                  return (
                    <div key={r.volunteer._id}
                      className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                        isAssigned ? 'border-green-200 bg-green-50' :
                        isSelected ? 'border-blue-400 shadow-md' :
                        'border-gray-100 hover:border-blue-200'
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Rank */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0
                            ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-blue-400'}`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{r.volunteer.name}</p>
                            <p className="text-xs text-gray-500">{r.volunteer.location?.city} · {r.volunteer.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Final score */}
                          <div className="text-center">
                            <p className={`text-2xl font-bold ${r.finalScore >= 80 ? 'text-green-600' : r.finalScore >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                              {r.finalScore}
                            </p>
                            <p className="text-xs text-gray-400">Match</p>
                          </div>

                          {isAssigned ? (
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-xl font-medium">✓ Assigned</span>
                          ) : (
                            <button onClick={() => toggleSelect(r.volunteer._id)}
                              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                              }`}>
                              {isSelected ? '✓ Selected' : 'Select'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {r.volunteer.skills?.map(s => (
                          <span key={s} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            data.requiredSkills?.includes(s)
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-500'
                          }`}>{s}</span>
                        ))}
                      </div>

                      {/* Score breakdown */}
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                        <p className="text-xs text-gray-400 mb-2 font-medium">Score Breakdown</p>
                        <ScoreBar label="Skills (40%)"       score={r.scores.skill} />
                        <ScoreBar label="Availability (20%)" score={r.scores.availability} />
                        <ScoreBar label="Distance (20%)"     score={r.scores.distance} />
                        <ScoreBar label="Reliability (10%)"  score={r.scores.reliability} />
                        <ScoreBar label="Urgency (10%)"      score={r.scores.urgency} />
                      </div>

                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                        <span>🎯 Reliability: <strong>{r.volunteer.reliabilityScore}%</strong></span>
                        <span>·</span>
                        <span>✅ Available: {r.volunteer.availability?.join(', ') || 'Flexible'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assigned' && (
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400">No volunteers assigned yet.</p>
                <button onClick={loadRecommendations}
                  className="mt-3 bg-blue-600 text-white text-sm px-5 py-2 rounded-xl hover:bg-blue-700">
                  Get AI Recommendations →
                </button>
              </div>
            ) : (
              assignments.map(a => (
                <div key={a._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
                        {a.volunteer?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{a.volunteer?.name}</p>
                        <p className="text-xs text-gray-500">{a.volunteer?.email} · {a.volunteer?.phone}</p>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {a.volunteer?.skills?.map(s => <SkillChip key={s} skill={s} />)}
                  </div>

                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-4">
                    <span>📍 {a.volunteer?.location?.city}</span>
                    <span>🎯 Reliability: {a.volunteer?.reliabilityScore}%</span>
                    {a.matchScore > 0 && <span>🧠 Match: {a.matchScore}%</span>}
                    <span>Assigned: {new Date(a.assignedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
