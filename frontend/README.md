# Task Management System

A full-stack Task Management Application built with Next.js (frontend) and Node.js + TypeScript + Prisma (backend).
Users can register, log in, create, edit, delete, and mark tasks as complete.
The app is responsive and includes authentication using JWT tokens.

# Tech Stack

## Frontend:

Next.js (App Router) + TypeScript
React hooks (useState, useEffect)
Axios for API requests
React Toastify for notifications
Tailwind CSS / custom CSS for styling

## Backend:

Node.js + TypeScript
Express.js for routing
Prisma ORM + MySQL / PostgreSQL
JWT Authentication (Access & Refresh tokens)
Bcrypt for password hashing

## Features

User authentication: Register, Login, Logout
Create, read, update, delete tasks
Mark tasks as completed / pending
Filter tasks by status and search by title
Responsive UI for mobile and desktop
Pagination support
Loader/spinner during API calls
Edit task with separate input and buttons
Toast notifications for success/error

📁 Project Structure
Backend
backend/
├─ src/
│ ├─ controllers/
│ │ ├─ auth.controller.ts
│ │ └─ task.controller.ts
│ ├─ controllers/validators/
│ │ ├─ auth.schema.ts
│ │ └─ task.schema.ts
│ ├─ middleware/
│ │ ├─ auth.middleware.ts
│ │ └─ error.middleware.ts
│ ├─ routes/
│ │ ├─ auth.routes.ts
│ │ └─ task.routes.ts
│ ├─ utils/
│ │ └─ AppError.ts
│ ├─ app.ts
│ ├─ server.ts
│ └─ prisma.ts
├─ prisma/
│ └─ schema.prisma
├─ package.json
├─ tsconfig.json
└─ .env

Frontend

frontend/
├─ components/
│ ├─ Layout.tsx
│ ├─ TaskItem.tsx
│ └─ Toast.tsx
├─ pages/
│ ├─ \_app.tsx
│ ├─ index.tsx (Login)
│ ├─ register.tsx
│ └─ dashboard.tsx
├─ utils/
│ └─ api.ts
├─ public/
├─ styles/
│ └─ globals.css
├─ package.json
└─ tsconfig.json

⚡ ## Backend Setup

Clone the repo and navigate to the backend folder:
git clone <repo-url>
cd backend

### Install dependencies:

npm install

Configure environment variables (.env):
DATABASE_URL=""
JWT_SECRET="your_jwt_secret"
PORT=5000

**
Run Prisma migrations:**
npx prisma migrate dev --name init

### Start the server:

npm run dev

Backend API will be running at: **http://localhost:5000**

⚡ Frontend Setup
Navigate to frontend folder:
cd frontend

### Install dependencies:

npm install
Configure API base URL (if needed) in utils/api.ts:

### Start the frontend development server:

npm run dev

Frontend will run at: **http://localhost:3000**
