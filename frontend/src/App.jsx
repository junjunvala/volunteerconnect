// src/App.jsx - Main router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';

// Volunteer pages
import VolunteerDashboard from './pages/Volunteer/VolunteerDashboard';
import VolunteerProfile   from './pages/Volunteer/VolunteerProfile';
import VolunteerTasks     from './pages/Volunteer/VolunteerTasks';
import TaskDetailVolunteer from './pages/Volunteer/TaskDetailVolunteer';
import BrowseTasks        from './pages/Volunteer/BrowseTasks';

// Admin pages
import AdminDashboard     from './pages/Admin/AdminDashboard';
import CreateTask         from './pages/Admin/CreateTask';
import AdminTasks         from './pages/Admin/AdminTasks';
import AdminTaskDetail    from './pages/Admin/AdminTaskDetail';
import AnalyticsDashboard from './pages/Admin/AnalyticsDashboard';

// Route guards
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"/></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Volunteer routes */}
          <Route path="/volunteer" element={<ProtectedRoute role="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
          <Route path="/volunteer/profile" element={<ProtectedRoute role="volunteer"><VolunteerProfile /></ProtectedRoute>} />
          <Route path="/volunteer/tasks"   element={<ProtectedRoute role="volunteer"><VolunteerTasks /></ProtectedRoute>} />
          <Route path="/volunteer/task/:id" element={<ProtectedRoute role="volunteer"><TaskDetailVolunteer /></ProtectedRoute>} />
          <Route path="/volunteer/browse"   element={<ProtectedRoute role="volunteer"><BrowseTasks /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin"              element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/create-task"  element={<ProtectedRoute role="admin"><CreateTask /></ProtectedRoute>} />
          <Route path="/admin/tasks"        element={<ProtectedRoute role="admin"><AdminTasks /></ProtectedRoute>} />
          <Route path="/admin/task/:id"     element={<ProtectedRoute role="admin"><AdminTaskDetail /></ProtectedRoute>} />
          <Route path="/admin/analytics"    element={<ProtectedRoute role="admin"><AnalyticsDashboard /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
