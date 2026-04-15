// src/pages/Volunteer/TaskDetailVolunteer.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Shared/Navbar';
import { UrgencyBadge, StatusBadge, SkillChip, Spinner } from '../../components/Shared/UI';
import MapView from '../../components/Shared/MapView';
import api from '../../utils/api';

export default function TaskDetailVolunteer() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [data, setData]     = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/volunteer/tasks'),
      api.get('/volunteer/profile'),
    ]).then(([tasksRes, profRes]) => {
      const assignment = tasksRes.data.find(a => a._id === id);
      setData(assignment);
      setProfile(profRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    try {
      await api.put(`/volunteer/task/${id}/status`, { status });
      setData(prev => ({ ...prev, status }));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <><Navbar /><Spinner size="lg" /></>;
  if (!data)   return <><Navbar /><div className="text-center py-20 text-gray-400">Assignment not found</div></>;

  const { task, status, matchScore, assignedAt } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-blue-600 mb-4 flex items-center gap-1">
          ← Back
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="text-xl font-bold text-gray-800">{task?.title}</h1>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <UrgencyBadge level={task?.urgencyLevel} />
              <StatusBadge status={status} />
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">{task?.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Location</p>
              <p className="font-medium text-gray-700">📍 {task?.location?.city || task?.location?.address}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Deadline</p>
              <p className="font-medium text-gray-700">📅 {new Date(task?.deadline).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Volunteers Needed</p>
              <p className="font-medium text-gray-700">👥 {task?.volunteersNeeded}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Required skills</p>
            <div className="flex flex-wrap gap-1.5">
              {task?.requiredSkills?.map(s => <SkillChip key={s} skill={s} />)}
            </div>
          </div>

          {/* Match score breakdown */}
          {matchScore > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-blue-700 mb-2">🧠 AI Match Score: {matchScore}%</p>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${matchScore}%` }} />
              </div>
              <p className="text-xs text-blue-500 mt-1.5">Based on your skills, location & availability</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {status === 'Pending' && (
              <>
                <button onClick={() => updateStatus('Accepted')}
                  className="flex-1 bg-green-600 text-white font-medium py-2.5 rounded-xl hover:bg-green-700 text-sm">
                  ✓ Accept Task
                </button>
                <button onClick={() => updateStatus('Rejected')}
                  className="flex-1 bg-red-50 text-red-600 font-medium py-2.5 rounded-xl hover:bg-red-100 border border-red-200 text-sm">
                  ✗ Reject
                </button>
              </>
            )}
            {status === 'Accepted' && (
              <button onClick={() => updateStatus('In Progress')}
                className="flex-1 bg-indigo-600 text-white font-medium py-2.5 rounded-xl hover:bg-indigo-700 text-sm">
                ▶ Start Task
              </button>
            )}
            {status === 'In Progress' && (
              <button onClick={() => updateStatus('Completed')}
                className="flex-1 bg-green-600 text-white font-medium py-2.5 rounded-xl hover:bg-green-700 text-sm">
                ✓ Mark as Completed
              </button>
            )}
            {(status === 'Completed' || status === 'Rejected') && (
              <div className={`flex-1 text-center py-2.5 rounded-xl text-sm font-medium ${
                status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
              }`}>
                {status === 'Completed' ? '✅ Task Completed!' : '❌ Task Rejected'}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Task Location</h2>
          <MapView task={task} volunteerLocation={profile?.location} />
          {task?.location?.address && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              📍 {task.location.address}{task.location.city ? `, ${task.location.city}` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
