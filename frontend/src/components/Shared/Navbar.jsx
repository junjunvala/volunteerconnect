// src/components/Shared/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function Navbar() {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const location            = useLocation();
  const [notifCount, setNotifCount] = useState(0);
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => {
    if (user?.role === 'volunteer') {
      api.get('/volunteer/notifications')
        .then(r => setNotifCount(r.data.filter(n => !n.isRead).length))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path
    ? 'text-blue-600 font-medium'
    : 'text-gray-600 hover:text-blue-600';

  const volunteerLinks = [
    { to: '/volunteer',         label: 'Dashboard' },
    { to: '/volunteer/tasks',   label: 'My Tasks' },
    { to: '/volunteer/browse',  label: 'Browse Tasks' },
    { to: '/volunteer/profile', label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin',             label: 'Dashboard' },
    { to: '/admin/tasks',       label: 'Tasks' },
    { to: '/admin/create-task', label: 'Create Task' },
    { to: '/admin/analytics',   label: 'Analytics' },
  ];

  const links = user?.role === 'admin' ? adminLinks : volunteerLinks;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? (user.role === 'admin' ? '/admin' : '/volunteer') : '/'} className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <span className="font-bold text-blue-600 text-lg hidden sm:block">VolunteerConnect</span>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium hidden sm:block">AI</span>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              {links.map(l => (
                <Link key={l.to} to={l.to} className={`text-sm ${isActive(l.to)}`}>{l.label}</Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notification bell (volunteer only) */}
                {user.role === 'volunteer' && (
                  <Link to="/volunteer/tasks" className="relative p-2 text-gray-500 hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    {notifCount > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center badge-pulse">
                        {notifCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full px-3 py-1.5 text-sm font-medium"
                  >
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="text-sm text-gray-600 hover:text-blue-600">Login</Link>
                <Link to="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Register</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            {user && (
              <button className="md:hidden p-2 text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {user && menuOpen && (
          <div className="md:hidden pb-3 border-t border-gray-100 pt-2">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                className={`block px-2 py-2 text-sm ${isActive(l.to)}`}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
