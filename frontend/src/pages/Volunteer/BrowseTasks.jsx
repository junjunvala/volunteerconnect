// src/pages/Volunteer/BrowseTasks.jsx
import { useEffect, useState } from 'react';
import Navbar from '../../components/Shared/Navbar';
import { UrgencyBadge, SkillChip, Spinner, EmptyState } from '../../components/Shared/UI';
import { MultiTaskMap } from '../../components/Shared/MapView';
import api from '../../utils/api';

export default function BrowseTasks() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [urgency, setUrgency] = useState('All');
  const [view, setView]       = useState('grid'); // 'grid' or 'map'

  useEffect(() => {
    api.get('/volunteer/browse')
      .then(r => setTasks(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = urgency === 'All' ? tasks : tasks.filter(t => t.urgencyLevel === urgency);

  if (loading) return <><Navbar /><Spinner size="lg" /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Browse Open Tasks</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} tasks available across Gujarat</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('grid')}
              className={`p-2 rounded-lg text-sm ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-500 border border-gray-200'}`}>
              ⊞ Grid
            </button>
            <button onClick={() => setView('map')}
              className={`p-2 rounded-lg text-sm ${view === 'map' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-500 border border-gray-200'}`}>
              🗺 Map
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['All','High','Medium','Low'].map(u => (
            <button key={u} onClick={() => setUrgency(u)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                urgency === u
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}>
              {u === 'All' ? '📋 All' : u === 'High' ? '🔴 High' : u === 'Medium' ? '🟡 Medium' : '🟢 Low'}
            </button>
          ))}
        </div>

        {/* Map view */}
        {view === 'map' && (
          <div className="mb-6">
            <MultiTaskMap tasks={filtered} />
          </div>
        )}

        {/* Grid view */}
        {filtered.length === 0 ? (
          <EmptyState icon="🔍" title="No tasks found" desc="Check back later for new opportunities." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(task => (
              <div key={task._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{task.title}</h3>
                  <UrgencyBadge level={task.urgencyLevel} />
                </div>

                <p className="text-xs text-gray-500 mb-3 line-clamp-3">{task.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {task.requiredSkills?.slice(0, 3).map(s => <SkillChip key={s} skill={s} />)}
                  {task.requiredSkills?.length > 3 && (
                    <span className="text-xs text-gray-400 self-center">+{task.requiredSkills.length - 3}</span>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>📍 {task.location?.city}</span>
                  <span>👥 {task.volunteersNeeded} needed</span>
                </div>

                <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                  <span>📅 Deadline: {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{task.category}</span>
                </div>

                {/* Urgency indicator at bottom */}
                {task.urgencyLevel === 'High' && (
                  <div className="mt-3 bg-red-50 text-red-600 text-xs text-center py-1.5 rounded-lg font-medium badge-pulse">
                    ⚡ Urgent — Response needed ASAP
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
