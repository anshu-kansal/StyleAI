# StyleAI — AI-Powered Fashion E-commerce Platform

StyleAI is a production-grade, portfolio-ready AI-powered fashion e-commerce platform built from scratch. This project is structured to demonstrate clean architectural patterns, robust security features, and modern UX design.

## Technical Architecture

The codebase follows the **MVC Architecture** decoupled with the **Service Layer Pattern** for the backend, and uses **Vite + React + Redux Toolkit** with **Tailwind CSS v4** for the frontend.

```
E-comm/
├── backend/                  # Node.js + Express.js backend (TypeScript)
│   ├── src/
│   │   ├── config/           # Database, env validation, Cloudinary config
│   │   ├── constants/        # HTTP statuses, common enums
│   │   ├── controllers/      # Route controllers (thin layer)
│   │   ├── middlewares/      # Error, validation, role and auth middlewares
│   │   ├── models/           # Mongoose models & TS schemas
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # Core business logic (Service Layer)
│   │   ├── types/            # TypeScript type declarations
│   │   ├── utils/            # JWT, API custom errors, format responses
│   │   └── server.ts         # Entry point
│   └── tsconfig.json
│
└── frontend/                 # React + Redux Toolkit frontend (TypeScript)
    ├── src/
    │   ├── api/              # Axios instance with auth interceptors
    │   ├── app/              # Redux store config and custom typed hooks
    │   ├── components/       # Reusable layout and UI elements
    │   ├── constants/        # Route mappings and config keys
    │   ├── features/         # Redux state slices (auth, cart, etc.)
    │   ├── hooks/            # Custom hooks wrapper
    │   ├── layouts/          # Main app container wrapper
    │   ├── pages/            # Page-level route views
    │   ├── types/            # Frontend type definitions
    │   └── main.tsx          # React render root
    ├── index.html
    └── vite.config.ts
```

## Tech Stack

- **Frontend**: React.js, Redux Toolkit, React Router DOM, Tailwind CSS (v4), Axios, React Hook Form, Lucide React, React Hot Toast
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), JWT Auth, bcryptjs, Joi, Morgan, Helmet, Express Rate Limit
- **Cloud/Services**: Cloudinary (Image Uploads), OpenAI API, Razorpay Payment Gateway (Test Mode)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### Backend Setup
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Copy the environment template and fill in your keys:
   ```bash
   cp .env.example .env
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate into the frontend directory:
   ```bash
   cd frontend
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Access the application in your browser at `http://localhost:5173`.
