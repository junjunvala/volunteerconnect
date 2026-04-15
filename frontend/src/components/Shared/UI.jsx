// src/components/Shared/UI.jsx - Reusable components

// Stat card for dashboards
export function StatCard({ icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    red:    'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colors[color]}`}>
          {icon}
        </div>
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// Urgency badge
export function UrgencyBadge({ level }) {
  const styles = {
    High:   'bg-red-100 text-red-700 border border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    Low:    'bg-green-100 text-green-700 border border-green-200',
  };
  const dots = { High: '🔴', Medium: '🟡', Low: '🟢' };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${styles[level] || styles.Low}`}>
      <span className="text-xs">{dots[level]}</span> {level}
    </span>
  );
}

// Status badge
export function StatusBadge({ status }) {
  const styles = {
    Open:         'bg-blue-100 text-blue-700',
    Active:       'bg-indigo-100 text-indigo-700',
    Completed:    'bg-green-100 text-green-700',
    Cancelled:    'bg-gray-100 text-gray-500',
    Pending:      'bg-yellow-100 text-yellow-700',
    Accepted:     'bg-green-100 text-green-700',
    Rejected:     'bg-red-100 text-red-700',
    'In Progress':'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// Skill chip
export function SkillChip({ skill }) {
  return (
    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100">
      {skill}
    </span>
  );
}

// Score bar
export function ScoreBar({ score, label }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>}
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{score}</span>
    </div>
  );
}

// Loading spinner
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`animate-spin border-4 border-blue-600 border-t-transparent rounded-full ${sizes[size]}`} />
    </div>
  );
}

// Empty state
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-400 mt-1 mb-4">{desc}</p>
      {action}
    </div>
  );
}

// Page wrapper
export function PageWrapper({ children, title, subtitle, action }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(title || action) && (
          <div className="flex items-start justify-between mb-6">
            <div>
              {title && <h1 className="text-2xl font-bold text-gray-800">{title}</h1>}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// Task card for lists
export function TaskCard({ task, onClick, actions }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:border-blue-200' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug">{task.title}</h3>
        <UrgencyBadge level={task.urgencyLevel} />
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {task.requiredSkills?.slice(0, 3).map(s => <SkillChip key={s} skill={s} />)}
        {task.requiredSkills?.length > 3 && (
          <span className="text-xs text-gray-400">+{task.requiredSkills.length - 3}</span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>📍 {task.location?.city || task.location?.address}</span>
        <span>📅 {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </div>
      {actions && <div className="mt-3 pt-3 border-t border-gray-100">{actions}</div>}
    </div>
  );
}
