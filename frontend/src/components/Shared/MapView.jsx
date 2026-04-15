// src/components/Shared/MapView.jsx - Leaflet map for task locations
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default marker icon (common Vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons
const makeIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    background:${color};
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.3)
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const urgencyIcons = {
  High:   makeIcon('#ef4444'),
  Medium: makeIcon('#f59e0b'),
  Low:    makeIcon('#22c55e'),
};
const volunteerIcon = makeIcon('#6366f1');

export default function MapView({ task, volunteerLocation }) {
  if (!task?.location?.lat || !task?.location?.lng) {
    return (
      <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-3xl mb-2">🗺️</div>
          <p className="text-sm">No location data</p>
        </div>
      </div>
    );
  }

  const taskPos = [task.location.lat, task.location.lng];
  const icon    = urgencyIcons[task.urgencyLevel] || urgencyIcons.Low;

  return (
    <div className="h-72 rounded-xl overflow-hidden border border-gray-200">
      <MapContainer center={taskPos} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        {/* Task marker */}
        <Marker position={taskPos} icon={icon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{task.title}</p>
              <p className="text-gray-500">{task.location.city || task.location.address}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                task.urgencyLevel === 'High' ? 'bg-red-100 text-red-700' :
                task.urgencyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>{task.urgencyLevel} Priority</span>
            </div>
          </Popup>
        </Marker>

        {/* Urgency circle */}
        <Circle
          center={taskPos}
          radius={task.urgencyLevel === 'High' ? 3000 : 5000}
          pathOptions={{
            color: task.urgencyLevel === 'High' ? '#ef4444' : '#3b82f6',
            fillColor: task.urgencyLevel === 'High' ? '#fecaca' : '#bfdbfe',
            fillOpacity: 0.15,
            weight: 1.5,
          }}
        />

        {/* Volunteer location marker */}
        {volunteerLocation?.lat && volunteerLocation?.lng && (
          <Marker position={[volunteerLocation.lat, volunteerLocation.lng]} icon={volunteerIcon}>
            <Popup>
              <p className="text-sm font-semibold">Your location</p>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

// Multi-task map for admin dashboard
export function MultiTaskMap({ tasks }) {
  if (!tasks?.length) return null;

  const validTasks = tasks.filter(t => t.location?.lat && t.location?.lng);
  if (!validTasks.length) return null;

  const center = [validTasks[0].location.lat, validTasks[0].location.lng];

  return (
    <div className="h-80 rounded-xl overflow-hidden border border-gray-200">
      <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        {validTasks.map(task => (
          <Marker
            key={task._id}
            position={[task.location.lat, task.location.lng]}
            icon={urgencyIcons[task.urgencyLevel] || urgencyIcons.Low}
          >
            <Popup>
              <div className="text-sm max-w-xs">
                <p className="font-semibold">{task.title}</p>
                <p className="text-gray-500 text-xs">{task.location.city}</p>
                <p className="text-xs mt-1">👥 Needs {task.volunteersNeeded} volunteers</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
