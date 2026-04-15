// src/pages/Admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Shared/Navbar';
import { StatCard, UrgencyBadge, StatusBadge, Spinner } from '../../components/Shared/UI';
import { MultiTaskMap } from '../../components/Shared/MapView';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user }            = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/admin/tasks'),
    ]).then(([analyticsRes, tasksRes]) => {
      setAnalytics(analyticsRes.data);
      setTasks(tasksRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <><Navbar /><Spinner size="lg" /></>;

  const s = analytics?.stats || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {user?.organizationName || 'Admin'} · Resource Allocation Dashboard
            </p>
          </div>
          <Link to="/admin/create-task"
            className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2">
            + Create Task
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Total Tasks"       value={s.totalTasks || 0}       color="blue"   />
          <StatCard icon="✅" label="Completed"         value={s.completedTasks || 0}   color="green"  />
          <StatCard icon="🔥" label="Active Tasks"      value={s.activeTasks || 0}      color="purple" />
          <StatCard icon="🚨" label="High Urgency Open" value={s.highUrgencyTasks || 0} color="red"    />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="👥" label="Total Volunteers"   value={s.totalVolunteers || 0}   color="blue"   />
          <StatCard icon="🟢" label="Active Volunteers"  value={s.activeVolunteers || 0}  color="green"  />
          <StatCard icon="🎯" label="Assignments Made"   value={s.totalAssignments || 0}  color="purple" />
          <StatCard icon="📈" label="Completion Rate"    value={`${s.completionRate || 0}%`} color="yellow" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent tasks */}
          <div className="lg:col-span-2 space-y-5">
            {/* Map */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-700">Tasks on Map</h2>
                <Link to="/admin/tasks" className="text-xs text-blue-600 hover:underline">View all →</Link>
              </div>
              <MultiTaskMap tasks={tasks} />
            </div>

            {/* Recent tasks list */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-700">Recent Tasks</h2>
                <Link to="/admin/tasks" className="text-xs text-blue-600 hover:underline">View all →</Link>
              </div>
              <div className="space-y-3">
                {analytics?.recentTasks?.slice(0, 5).map(t => (
                  <Link key={t._id} to={`/admin/task/${t._id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{t.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(t.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <UrgencyBadge level={t.urgencyLevel} />
                      <StatusBadge status={t.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Top volunteers */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Top Volunteers</h2>
              <div className="space-y-3">
                {analytics?.topVolunteers?.map((v, i) => (
                  <div key={v._id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white
                      ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{v.name}</p>
                      <p className="text-xs text-gray-400">{v.totalCompleted} tasks done</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${v.reliabilityScore >= 85 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {v.reliabilityScore}%
                      </p>
                      <p className="text-xs text-gray-400">reliability</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgency breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-4">Tasks by Urgency</h2>
              {analytics?.urgencyBreakdown?.map(u => (
                <div key={u._id} className="flex items-center gap-3 mb-3">
                  <UrgencyBadge level={u._id} />
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${u._id === 'High' ? 'bg-red-500' : u._id === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${(u.count / (s.totalTasks || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 w-4">{u.count}</span>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <h2 className="font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/admin/create-task" className="block bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2.5 rounded-xl transition-colors">
                  + Create New Task
                </Link>
                <Link to="/admin/tasks" className="block bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2.5 rounded-xl transition-colors">
                  📋 Manage Tasks
                </Link>
                <Link to="/admin/analytics" className="block bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2.5 rounded-xl transition-colors">
                  📊 Full Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
