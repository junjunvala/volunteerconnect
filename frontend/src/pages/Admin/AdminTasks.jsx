// src/pages/Admin/AdminTasks.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Shared/Navbar';
import { UrgencyBadge, StatusBadge, SkillChip, Spinner, EmptyState } from '../../components/Shared/UI';
import api from '../../utils/api';

export default function AdminTasks() {
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('All');
  const [urgency, setUrgency] = useState('All');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    api.get('/admin/tasks')
      .then(r => setTasks(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter(t => {
    const matchStatus = status === 'All' || t.status === status;
    const matchUrgency = urgency === 'All' || t.urgencyLevel === urgency;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.location?.city?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchUrgency && matchSearch;
  });

  if (loading) return <><Navbar /><Spinner size="lg" /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">All Tasks</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} tasks</p>
          </div>
          <Link to="/admin/create-task"
            className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700">
            + New Task
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="🔍 Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {['All','Open','Active','Completed','Cancelled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={urgency}
            onChange={e => setUrgency(e.target.value)}
          >
            {['All','High','Medium','Low'].map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No tasks found"
            desc="Try adjusting filters or create a new task."
            action={<Link to="/admin/create-task" className="bg-blue-600 text-white text-sm px-5 py-2 rounded-xl hover:bg-blue-700 inline-block">Create Task</Link>}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map(task => (
              <Link key={task._id} to={`/admin/task/${task._id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-base">{task.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {task.category} · Created {new Date(task.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <UrgencyBadge level={task.urgencyLevel} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {task.requiredSkills?.map(s => <SkillChip key={s} skill={s} />)}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span>📍 {task.location?.city || task.location?.address}</span>
                    <span>📅 {new Date(task.deadline).toLocaleDateString('en-IN')}</span>
                    <span>👥 {task.assignedVolunteers?.length || 0} / {task.volunteersNeeded} assigned</span>
                    <span className="ml-auto text-blue-600 font-medium">View Details →</span>
                  </div>

                  {/* Progress bar for assignments */}
                  {task.volunteersNeeded > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((task.assignedVolunteers?.length || 0) / task.volunteersNeeded) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
