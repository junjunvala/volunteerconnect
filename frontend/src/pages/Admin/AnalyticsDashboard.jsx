// src/pages/Admin/AnalyticsDashboard.jsx
import { useEffect, useState } from 'react';
import Navbar from '../../components/Shared/Navbar';
import { StatCard, Spinner } from '../../components/Shared/UI';
import api from '../../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];
const STATUS_COLORS = {
  Open: '#3b82f6', Active: '#8b5cf6', Completed: '#22c55e', Cancelled: '#9ca3af',
};

export default function AnalyticsDashboard() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Navbar /><Spinner size="lg" /></>;

  const s = data?.stats || {};

  // Format urgency data for pie chart
  const urgencyData = data?.urgencyBreakdown?.map(u => ({
    name: u._id, value: u.count,
  })) || [];

  // Format category data for bar chart
  const categoryData = data?.categoryBreakdown?.map(c => ({
    name: c._id?.replace(' ', '\n') || 'Other',
    tasks: c.count,
  })) || [];

  // Mock trend data (in real app, this comes from backend)
  const trendData = [
    { month: 'Jan', tasks: 8,  volunteers: 24, completed: 6  },
    { month: 'Feb', tasks: 12, volunteers: 31, completed: 10 },
    { month: 'Mar', tasks: 15, volunteers: 40, completed: 13 },
    { month: 'Apr', tasks: 10, volunteers: 35, completed: 9  },
    { month: 'May', tasks: 20, volunteers: 55, completed: 17 },
    { month: 'Jun', tasks: 25, volunteers: 70, completed: 22 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide impact metrics and insights</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Total Tasks"      value={s.totalTasks || 0}           color="blue"   />
          <StatCard icon="✅" label="Completed"        value={s.completedTasks || 0}        color="green"  />
          <StatCard icon="👥" label="Total Volunteers" value={s.totalVolunteers || 0}        color="purple" />
          <StatCard icon="📈" label="Completion Rate"  value={`${s.completionRate || 0}%`}  color="yellow" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🔥" label="Active Tasks"    value={s.activeTasks || 0}        color="purple" sub="ongoing" />
          <StatCard icon="🚨" label="High Urgency"    value={s.highUrgencyTasks || 0}   color="red"    sub="needs attention" />
          <StatCard icon="🎯" label="Assignments"     value={s.totalAssignments || 0}   color="blue"   sub="total" />
          <StatCard icon="⏱️" label="Avg Response"   value={`${s.avgResponseTime || 0}m`} color="green" sub="minutes" />
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Urgency breakdown pie */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Tasks by Urgency</h2>
            {urgencyData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={urgencyData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {urgencyData.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {urgencyData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-sm text-gray-600">{d.name}</span>
                      <span className="ml-auto font-bold text-gray-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-10">No data yet</p>
            )}
          </div>

          {/* Category bar chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Tasks by Category</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-10">No data yet</p>
            )}
          </div>
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Monthly Activity Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tasks"      stroke="#3b82f6"  strokeWidth={2} dot={{ r: 4 }} name="Tasks Created" />
              <Line type="monotone" dataKey="volunteers" stroke="#8b5cf6"  strokeWidth={2} dot={{ r: 4 }} name="Volunteers Active" />
              <Line type="monotone" dataKey="completed"  stroke="#22c55e"  strokeWidth={2} dot={{ r: 4 }} name="Tasks Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top volunteers table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Top Performing Volunteers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Rank</th>
                  <th className="text-left px-5 py-3">Volunteer</th>
                  <th className="text-left px-5 py-3">Skills</th>
                  <th className="text-center px-5 py-3">Completed</th>
                  <th className="text-center px-5 py-3">Assigned</th>
                  <th className="text-center px-5 py-3">Reliability</th>
                </tr>
              </thead>
              <tbody>
                {data?.topVolunteers?.map((v, i) => (
                  <tr key={v._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <span className={`w-7 h-7 inline-flex items-center justify-center rounded-lg font-bold text-white text-xs
                        ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-blue-400'}`}>
                        #{i+1}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">{v.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {v.skills?.slice(0,2).map(s => (
                          <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {v.skills?.length > 2 && <span className="text-gray-400 text-xs">+{v.skills.length-2}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center font-semibold text-green-600">{v.totalCompleted}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{v.totalAssigned}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`font-bold text-base ${v.reliabilityScore >= 85 ? 'text-green-600' : v.reliabilityScore >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {v.reliabilityScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
