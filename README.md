# 🚨 ResQ-Route • Hyper-Local Disaster Resource Matcher

> **Empowering Real-Time Emergency Aid & Natural Language Disaster SOS Triaging**

[![Demo Video](https://img.shields.io/badge/📹_Watch_Demo_Video-Google_Drive-blue?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/1D8aYOfPRxLUryPIMx5KOfMmpXAs0Vhja/view)
[![Android App Video](https://img.shields.io/badge/📱_Watch_Android_App_Demo-Google_Drive-green?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/1B5udOvQJy818Hut69UqmSuGgDZnpqkIF/view?usp=drivesdk)

[![GitHub Repository](https://img.shields.io/badge/📦_GitHub_Repo-ResQ__Route-black?style=for-the-badge&logo=github)](https://github.com/glenrajadurai/ResQ_Route)

ResQ-Route is an emergency response platform designed for rapid disaster relief coordination. Victims and citizens can submit natural language emergency requests (e.g. *"Water rising fast at 104 Riverside Dr. 2 elderly trapped, need insulin and boat rescue"*). 

ResQ-Route automatically parses the natural text into structured JSON data—extracting urgency level, geocoded map coordinates, supply categories, and required items—plotting them on an interactive live emergency map for volunteer rescue teams and disaster relief organizations.

---

## 🌟 Key Features

- **🗣️ Natural Language Disaster SOS**:
  - Plain English emergency text parsing automatically extracts urgency (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), category, address, geocoded coordinates, and requested supplies.
  - Preset quick-test scenarios for flash flood traps, asthma emergencies, shelter supply shortages, and wheelchair evacuations.

- **🤖 Dual AI NLP Parsing Architecture**:
  - **Rule-Based Heuristic Engine (Default / Zero Keys)**: 100% offline regex & keyword parsing engine that operates without any external API keys or network connection.
  - **OpenAI GPT Model (`gpt-4o-mini`)**: Optional LLM-driven structured JSON intent extraction.
  - Interactive **AI Configuration Modal** to toggle parsing engines on the fly.

- **🗺️ Live Disaster Map**:
  - Interactive Leaflet / OpenStreetMap visualization with animated, color-coded emergency pins based on urgency.
  - Filter pins by urgency level (`ALL`, `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) with real-time popup cards and claim actions.

- **🤝 Volunteer & Responder Feed**:
  - Real-time incident response feed for first responders, NGOs, and volunteers.
  - 1-click emergency claim workflow, responder assignment, contact details, and status transitions (`UNCLAIMED` → `CLAIMED` → `IN_PROGRESS` → `RESOLVED`).

- **📊 Disaster Analytics Dashboard**:
  - Real-time dashboard metrics tracking total SOS broadcasts, critical active alerts, unclaimed emergencies, and overall resolution rate percentage.

- **🌱 1-Click Demo Data Seeding**:
  - Built-in demo seeder populating 8 realistic disaster SOS scenarios across flooding, medical, food/water, and evacuation categories for instant interactive testing.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (Vite) |
| **Styling & UI** | Tailwind CSS + Lucide Icons |
| **Interactive Map** | Leaflet.js / OpenStreetMap |
| **Backend Framework** | Python 3 + Django REST Framework |
| **Database** | SQLite / PostgreSQL |
| **NLP Engine** | Dual Engine: Custom Rule-Based Heuristic Engine + OpenAI API (`gpt-4o-mini`) |

---

## 📂 Project Structure

```text
hackday 1.0/
├── backend/
│   ├── api/
│   │   ├── ai_parser.py      # Dual NLP parsing engine (Rule-Based & OpenAI)
│   │   ├── models.py         # SOSRequest database schema
│   │   ├── serializers.py    # REST framework serializers
│   │   ├── urls.py           # Backend API endpoint routes
│   │   └── views.py          # DRF views (SOS CRUD, preview, stats, seed)
│   ├── resq_backend/         # Django project settings & URL configuration
│   ├── manage.py
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIConfigModal.jsx    # Engine Selector (Rule-Based vs OpenAI)
│   │   │   ├── AnalyticsBanner.jsx  # Live metrics banner
│   │   │   ├── ClaimModal.jsx       # Volunteer response claim modal
│   │   │   ├── LandingHero.jsx      # Hero section & CTA navigation
│   │   │   ├── MapView.jsx          # Interactive Leaflet live emergency map
│   │   │   ├── Navbar.jsx           # Sticky navigation header
│   │   │   ├── SOSForm.jsx          # Natural language SOS submission form
│   │   │   └── VolunteerFeed.jsx    # Responder triage feed
│   │   ├── App.jsx                  # Main application state & routing
│   │   └── index.css                # Tailwind CSS styling
│   ├── package.json
│   ├── vite.config.js               # Vite dev server & API proxy
│   └── vercel.json                  # Production deployment rewrite rules
│
└── README.md
```

---

## 🚀 Quick Start Guide (Local Setup)

### Prerequisites
- **Node.js**: v18+ and `npm`
- **Python**: v3.10+

---

### 1. Clone & Setup Backend (Django)

```bash
# Navigate to backend directory
cd backend

# Create & activate a Python virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Start Django backend server on port 8000
python manage.py runserver 8000
```

The Django API server will run at `http://127.0.0.1:8000/`.

---

### 2. Setup & Launch Frontend (React + Vite)

Open a second terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/requests/` | `GET` | List all disaster SOS requests (supports `urgency`, `category`, `status`, `search` filters) |
| `/api/requests/` | `POST` | Create a structured SOS request |
| `/api/parse-sos/` | `POST` | Preview AI/NLP extraction for raw natural language text without saving |
| `/api/create-sos/` | `POST` | Parse natural language text via AI/Rule-Based engine and save to database |
| `/api/requests/<id>/claim/` | `POST` | Claim an active emergency SOS request as a responder/volunteer |
| `/api/requests/<id>/status/` | `PATCH` | Update request status (`UNCLAIMED`, `CLAIMED`, `IN_PROGRESS`, `RESOLVED`) |
| `/api/stats/` | `GET` | Fetch real-time dashboard analytics metrics |
| `/api/seed/` | `POST` | Reset database and seed 8 sample disaster scenarios |

---

## 📄 License

This project is open-source under the **MIT License**.

