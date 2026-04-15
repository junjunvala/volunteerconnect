// src/pages/Volunteer/VolunteerTasks.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Shared/Navbar';
import { StatusBadge, UrgencyBadge, SkillChip, Spinner, EmptyState } from '../../components/Shared/UI';
import api from '../../utils/api';

export default function VolunteerTasks() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('All');

  useEffect(() => {
    api.get('/volunteer/tasks')
      .then(r => setAssignments(r.data))
      .finally(() => setLoading(false));
  }, []);

  const statusFilters = ['All','Pending','Accepted','In Progress','Completed','Rejected'];

  const filtered = filter === 'All'
    ? assignments
    : assignments.filter(a => a.status === filter);

  const updateStatus = async (assignmentId, status) => {
    try {
      await api.put(`/volunteer/task/${assignmentId}/status`, { status });
      setAssignments(prev => prev.map(a =>
        a._id === assignmentId ? { ...a, status } : a
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <><Navbar /><Spinner size="lg" /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">My Tasks</h1>
        <p className="text-sm text-gray-500 mb-6">Manage your assigned volunteer tasks</p>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {statusFilters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}>
              {f}
              {f !== 'All' && (
                <span className="ml-1.5 text-xs opacity-70">
                  {assignments.filter(a => a.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No tasks here"
            desc={filter === 'All' ? "You haven't been assigned to any tasks yet." : `No ${filter.toLowerCase()} tasks.`}
            action={<Link to="/volunteer/browse" className="bg-blue-600 text-white text-sm px-5 py-2 rounded-xl hover:bg-blue-700 inline-block">Browse Tasks</Link>}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map(a => (
              <div key={a._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{a.task?.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Assigned {new Date(a.assignedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={a.status} />
                    <UrgencyBadge level={a.task?.urgencyLevel} />
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{a.task?.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {a.task?.requiredSkills?.map(s => <SkillChip key={s} skill={s} />)}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span>📍 {a.task?.location?.city || a.task?.location?.address}</span>
                  <span>📅 Deadline: {new Date(a.task?.deadline).toLocaleDateString('en-IN')}</span>
                  <span>👥 {a.task?.volunteersNeeded} needed</span>
                </div>

                {/* Match score */}
                {a.matchScore > 0 && (
                  <div className="mb-3 text-xs text-gray-500 flex items-center gap-2">
                    <span>Match score:</span>
                    <div className="flex-1 max-w-24 bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${a.matchScore >= 80 ? 'bg-green-500' : a.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-400'}`}
                        style={{ width: `${a.matchScore}%` }} />
                    </div>
                    <span className="font-semibold text-gray-700">{a.matchScore}%</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/volunteer/task/${a._id}`}
                    className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                    View Details →
                  </Link>

                  {a.status === 'Pending' && (
                    <>
                      <button onClick={() => updateStatus(a._id, 'Accepted')}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                        ✓ Accept
                      </button>
                      <button onClick={() => updateStatus(a._id, 'Rejected')}
                        className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200">
                        ✗ Reject
                      </button>
                    </>
                  )}

                  {a.status === 'Accepted' && (
                    <button onClick={() => updateStatus(a._id, 'In Progress')}
                      className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
                      ▶ Start Task
                    </button>
                  )}

                  {a.status === 'In Progress' && (
                    <button onClick={() => updateStatus(a._id, 'Completed')}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                      ✓ Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
