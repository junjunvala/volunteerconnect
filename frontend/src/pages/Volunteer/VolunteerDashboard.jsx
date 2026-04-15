// src/pages/Volunteer/VolunteerDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Shared/Navbar';
import { StatCard, TaskCard, Spinner, EmptyState, StatusBadge } from '../../components/Shared/UI';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function VolunteerDashboard() {
  const { user }                         = useAuth();
  const [assignments, setAssignments]    = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile]            = useState(null);
  const [loading, setLoading]            = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/volunteer/tasks'),
      api.get('/volunteer/notifications'),
      api.get('/volunteer/profile'),
    ]).then(([tasksRes, notifRes, profRes]) => {
      setAssignments(tasksRes.data);
      setNotifications(notifRes.data.slice(0, 5));
      setProfile(profRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const counts = {
    total:      assignments.length,
    pending:    assignments.filter(a => a.status === 'Pending').length,
    active:     assignments.filter(a => ['Accepted','In Progress'].includes(a.status)).length,
    completed:  assignments.filter(a => a.status === 'Completed').length,
  };

  const unread = notifications.filter(n => !n.isRead).length;

  if (loading) return <><Navbar /><Spinner size="lg" /></>;

  const isProfileComplete = profile?.skills?.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile incomplete banner */}
        {!isProfileComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Complete your profile to get matched</p>
                <p className="text-xs text-yellow-700">Add your skills and availability so NGOs can find you.</p>
              </div>
            </div>
            <Link to="/volunteer/profile" className="bg-yellow-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-yellow-600">
              Set up profile →
            </Link>
          </div>
        )}

        {/* Welcome header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-sm text-gray-500 mt-0.5">Here's your volunteer activity overview</p>
          </div>
          <Link to="/volunteer/browse"
            className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 hidden sm:block">
            Browse Tasks
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Total Assigned" value={counts.total}     color="blue" />
          <StatCard icon="⏳" label="Pending"        value={counts.pending}   color="yellow" />
          <StatCard icon="🔥" label="Active"         value={counts.active}    color="purple" />
          <StatCard icon="✅" label="Completed"      value={counts.completed} color="green" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent tasks */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">My Tasks</h2>
              <Link to="/volunteer/tasks" className="text-sm text-blue-600 hover:underline">View all →</Link>
            </div>
            {assignments.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No tasks assigned yet"
                desc="Browse available tasks and wait to be matched."
                action={<Link to="/volunteer/browse" className="bg-blue-600 text-white text-sm px-5 py-2 rounded-xl hover:bg-blue-700 inline-block">Browse Tasks</Link>}
              />
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 4).map(a => (
                  <Link key={a._id} to={`/volunteer/task/${a._id}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-gray-800 text-sm">{a.task?.title}</p>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-xs text-gray-500">📍 {a.task?.location?.city} · 📅 {new Date(a.task?.deadline).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Reliability score */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">Your Reliability Score</h3>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3"
                      strokeDasharray={`${profile?.reliabilityScore || 80} 100`} strokeLinecap="round"/>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
                    {profile?.reliabilityScore || 80}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {(profile?.reliabilityScore || 80) >= 85 ? '⭐ Excellent' :
                     (profile?.reliabilityScore || 80) >= 70 ? '👍 Good' : '📈 Improving'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Based on task acceptance & completion</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-lg font-bold text-gray-700">{profile?.totalCompleted || 0}</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-lg font-bold text-gray-700">{profile?.totalAssigned || 0}</p>
                  <p className="text-xs text-gray-400">Assigned</p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Notifications</h3>
                {unread > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unread} new</span>}
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No notifications yet</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n._id} className={`p-3 rounded-xl text-xs ${n.isRead ? 'bg-gray-50' : 'bg-blue-50 border border-blue-100'}`}>
                      <p className="font-medium text-gray-700">{n.title}</p>
                      <p className="text-gray-500 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
