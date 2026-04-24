# Smart CRM — Frontend

React + Vite frontend for the Smart CRM application.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| HTTP | Axios |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |

---

## Features

- JWT authentication with auto token refresh
- Lead management — list, detail, create, edit, delete
- Kanban pipeline with drag-and-drop
- Tasks & follow-ups
- Analytics dashboard with charts
- Dark / light theme toggle
- CSV export

---

## Project Structure

```
src/
├── components/
│   ├── layout/         # Sidebar, Header, Layout wrapper
│   ├── leads/          # LeadCard, LeadForm
│   ├── tasks/          # TaskForm
│   └── ui/             # Badge, Modal, StatCard, EmptyState, etc.
├── pages/
│   ├── auth/           # Login, Register
│   ├── leads/          # LeadsPage, LeadDetailPage
│   ├── DashboardPage
│   ├── PipelinePage    # Kanban board
│   ├── TasksPage
│   ├── AnalyticsPage
│   ├── UsersPage
│   └── SettingsPage
├── store/              # Zustand stores (auth, leads, tasks, theme)
└── lib/api.js          # Axios instance with JWT interceptor
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running (see backend repo)

### Setup

```bash
npm install
npm run dev
```

The app runs at **http://localhost:5173** and proxies API requests to `http://localhost:3000`.

### Build

```bash
npm run build
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@smartcrm.com` | `admin123` |
| Sales | `sales@smartcrm.com` | `sales123` |
