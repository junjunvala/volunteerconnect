# 🤝 VolunteerConnect AI
### Smart Volunteer Resource Allocation Platform
**Hackathon Project · Smart Resource Allocation · Data-Driven Volunteer Coordination for Social Impact**

---

## 🧠 What It Does
VolunteerConnect AI is a full-stack web platform that automatically matches and assigns the **best volunteers to disaster relief / NGO tasks** using a custom AI matching algorithm. It scores volunteers based on skills, distance, availability, reliability, and urgency — and assigns the top matches instantly.

---

## 🏗️ Tech Stack
| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18 + Vite + TailwindCSS + Leaflet + Recharts |
| Backend    | Node.js + Express.js + Mongoose                 |
| Database   | MongoDB Atlas                                   |
| Auth       | JWT (JSON Web Tokens)                           |
| Maps       | OpenStreetMap + React Leaflet (free, no API key)|
| Email      | Nodemailer (optional)                           |
| Deployment | Vercel (frontend) + Render (backend)            |

---

## 📁 Folder Structure
```
volunteerconnect/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                # JWT middleware
│   ├── models/
│   │   ├── User.js                # Volunteer + Admin model
│   │   ├── Task.js                # Task/request model
│   │   ├── Assignment.js          # Task-volunteer link
│   │   └── Notification.js        # Notifications
│   ├── routes/
│   │   ├── auth.js                # POST /login /register
│   │   ├── volunteer.js           # Volunteer APIs
│   │   ├── admin.js               # Admin/NGO APIs
│   │   ├── match.js               # Matching API
│   │   └── analytics.js           # Analytics API
│   ├── utils/
│   │   ├── matchingAlgorithm.js   # ⭐ Core AI matching engine
│   │   ├── emailService.js        # Email notifications
│   │   └── seedData.js            # Demo data seeder
│   ├── server.js                  # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Shared/
    │   │       ├── Navbar.jsx
    │   │       ├── UI.jsx          # Reusable components
    │   │       └── MapView.jsx     # Leaflet map
    │   ├── context/
    │   │   └── AuthContext.jsx     # Global auth state
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── Volunteer/
    │   │   │   ├── VolunteerDashboard.jsx
    │   │   │   ├── VolunteerProfile.jsx
    │   │   │   ├── VolunteerTasks.jsx
    │   │   │   ├── TaskDetailVolunteer.jsx
    │   │   │   └── BrowseTasks.jsx
    │   │   └── Admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── CreateTask.jsx
    │   │       ├── AdminTasks.jsx
    │   │       ├── AdminTaskDetail.jsx  # ⭐ Main AI matching UI
    │   │       └── AnalyticsDashboard.jsx
    │   ├── utils/
    │   │   ├── api.js              # Axios instance
    │   │   └── helpers.js          # Utility functions
    │   ├── App.jsx                 # Routing
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚡ Quick Setup (Local)

### Step 1: MongoDB Atlas
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Create database user → Get connection string
3. Whitelist IP `0.0.0.0/0` for development

### Step 2: Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm run seed      # Insert demo data
npm run dev       # Start server on port 5000
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

npm run dev       # Start on port 3000
```

### Step 4: Open in browser
```
http://localhost:3000
```

---

## 🔑 Demo Credentials (after seeding)
| Role      | Email              | Password   |
|-----------|--------------------|------------|
| Admin/NGO | admin@demo.com     | demo1234   |
| Volunteer | rahul@demo.com     | demo1234   |
| Volunteer | anjali@demo.com    | demo1234   |
| Volunteer | meera@demo.com     | demo1234   |

---

## 🧠 Matching Algorithm (Core Feature)

Located in `backend/utils/matchingAlgorithm.js`

```
FinalScore = (SkillScore × 0.40) +
             (AvailabilityScore × 0.20) +
             (DistanceScore × 0.20) +
             (ReliabilityScore × 0.10) +
             (UrgencyBonus × 0.10)
```

| Component      | Weight | Logic                                          |
|----------------|--------|------------------------------------------------|
| Skill Match    | 40%    | % of required skills the volunteer has         |
| Availability   | 20%    | Does availability match task day/time?         |
| Distance       | 20%    | Haversine formula — closer = higher score      |
| Reliability    | 10%    | Past acceptance + completion rate (0–100)      |
| Urgency Bonus  | 10%    | High urgency → boosts skill + distance scores  |

### Bonus AI Features:
- **Urgency Prediction**: Rule-based NLP on task description → predicts High/Medium/Low
- **Volunteer Count Suggestion**: Based on task category → suggests min/max/default count
- **Reliability Score**: Auto-calculated from volunteer history

### Test matching algorithm:
```bash
cd backend
node -e "
const { calculateMatchScores } = require('./utils/matchingAlgorithm');
const task = {
  requiredSkills: ['First Aid', 'Driving'],
  location: { lat: 23.0225, lng: 72.5714 },
  urgencyLevel: 'High',
  deadline: new Date(Date.now() + 86400000)
};
const volunteers = [
  { _id: '1', name: 'Rahul', skills: ['First Aid', 'Driving'], location: { lat: 23.03, lng: 72.58 }, availability: ['Monday'], reliabilityScore: 92 },
  { _id: '2', name: 'Anjali', skills: ['Cooking'], location: { lat: 21.17, lng: 72.83 }, availability: ['Saturday'], reliabilityScore: 85 },
];
const result = calculateMatchScores(task, volunteers);
console.log(JSON.stringify(result, null, 2));
"
```

---

## 🌐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/volunteerconnect
JWT_SECRET=your_super_secret_key_change_this_in_production
PORT=5000
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your@gmail.com        # Optional
EMAIL_PASS=your_app_password     # Optional
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build

# Install Vercel CLI
npm i -g vercel
vercel --prod
# Set env: VITE_API_URL = https://your-backend.onrender.com/api
```

### Backend → Render
1. Push backend folder to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from .env

### MongoDB → Atlas
Already cloud-hosted. Just use the connection string.

---

## 📡 API Reference

### Auth
| Method | Endpoint            | Description       |
|--------|---------------------|-------------------|
| POST   | /api/auth/register  | Register user     |
| POST   | /api/auth/login     | Login + get token |

### Volunteer
| Method | Endpoint                           | Description           |
|--------|------------------------------------|-----------------------|
| GET    | /api/volunteer/profile             | Get own profile       |
| PUT    | /api/volunteer/profile             | Update profile        |
| GET    | /api/volunteer/tasks               | My assignments        |
| PUT    | /api/volunteer/task/:id/status     | Update task status    |
| GET    | /api/volunteer/notifications       | Get notifications     |
| GET    | /api/volunteer/browse              | Browse open tasks     |

### Admin
| Method | Endpoint                           | Description           |
|--------|------------------------------------|-----------------------|
| POST   | /api/admin/task/create             | Create task           |
| GET    | /api/admin/tasks                   | All tasks             |
| GET    | /api/admin/task/:id                | Task details          |
| GET    | /api/admin/task/:id/recommendations| AI volunteer matches  |
| POST   | /api/admin/task/:id/assign         | Assign volunteers     |
| PUT    | /api/admin/task/:id/status         | Update task status    |

### Matching & AI
| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | /api/match/:taskId        | Get ranked recommendations|
| POST   | /api/match/predict-urgency| AI urgency prediction     |
| POST   | /api/match/suggest-count  | AI volunteer count suggest|

### Analytics
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/analytics/overview   | Full analytics data  |

---

## 🎯 Hackathon Demo Flow

1. **Open** `http://localhost:3000` → Landing page
2. **Login as Admin** → `admin@demo.com / demo1234`
3. **Create Task** → Fill in flood relief task with High urgency
4. **Click** "Get AI Recommendations" → See ranked volunteers with score breakdown
5. **Click** "Auto-Assign Best Matches" → System assigns top N volunteers
6. **Open new tab** → Login as Volunteer → `rahul@demo.com / demo1234`
7. **See notification** on dashboard → Go to My Tasks
8. **Accept task** → Click "Start Task" → Click "Mark Completed"
9. **Back to Admin** → Analytics dashboard shows updated stats

---

## 🏆 Judging Highlights

- ✅ **AI Matching Algorithm** — Custom weighted scoring (not just random assignment)
- ✅ **Real-time Map** — OpenStreetMap with color-coded urgency markers
- ✅ **Analytics Dashboard** — Charts with Recharts
- ✅ **3 AI Features** — Matching, urgency prediction, volunteer count suggestion
- ✅ **Reliability Score** — Tracks volunteer history and performance
- ✅ **Full-stack working app** — Backend + Frontend + MongoDB
- ✅ **Mobile responsive** — Works on all screen sizes
- ✅ **Real-world data** — Gujarat cities with actual coordinates

---

Built with ❤️ for Social Impact · VolunteerConnect AI
