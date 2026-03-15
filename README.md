# Delivery Management App

A delivery management web app with a **manager dashboard** (desktop) and **driver mobile view**.

## Setup

### Backend
```bash
cd backend
npm install
npm run seed   # populate sample data
npm start      # runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # runs on http://localhost:5173
```

## Usage

- **Manager dashboard**: http://localhost:5173/manager
- **Driver view**: http://localhost:5173/driver/1 (replace 1 with driver ID)

## Tech Stack

- **Backend**: Node.js, Express, SQLite (sql.js)
- **Frontend**: React (Vite), Leaflet + OpenStreetMap
- **Database**: SQLite (no external database required)
