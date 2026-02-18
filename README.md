# Spendly 💰

A personal finance tracker that automatically categorizes transactions using customizable rules.

## Tech Stack

- **Backend:** Node.js + Express + SQLite + Prisma
- **Frontend:** React + Vite
- **Language:** JavaScript

## Quick Start

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server will run on `http://localhost:5001`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Development

1. Start the backend server first (it runs on port 5001)
2. Start the frontend dev server (it runs on port 5173)
3. Open your browser to `http://localhost:5173`
4. Test the API connection using the "Test API Connection" button

## Features (MVP)

- ✅ Basic project structure
- ✅ API health check endpoint
- ✅ Simple home page
- 🚧 Import transactions (CSV/JSON)
- 🚧 Manage categorization rules
- 🚧 Auto-categorize transactions
- 🚧 Monthly summary and breakdown

## Project Structure

```
finance-categorizer/
├── backend/              # Express API server
│   ├── src/
│   │   └── server.js    # Main server file
│   ├── .env             # Environment variables
│   └── package.json
├── frontend/             # React application
│   ├── src/
│   │   ├── api/         # API client functions
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   └── package.json
└── README.md
```