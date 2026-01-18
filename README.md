# 🗳️ e-Voting Platform

<div align="center">

![e-Voting Platform](client/src/assets/evoting.png)

A comprehensive, secure, and user-friendly electronic voting platform designed for educational institutions to conduct transparent and efficient elections.

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Prisma-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Security Features](#-security-features)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **Multi-Role Authentication** | Secure login for Admins, Students, and Candidates with JWT-based authentication |
| **Election Management** | Create, manage, and monitor elections with customizable positions and auto-scheduling |
| **Secure Voting** | Encrypted voting with OTP verification and vote receipts |
| **Real-time Results** | Live vote counting and automatic result declaration |
| **Candidate Applications** | Students can apply as candidates with manifesto and document uploads |
| **Notification System** | Real-time notifications for election updates, approvals, and announcements |
| **Feedback System** | Built-in feedback mechanism for continuous improvement |

### 👨‍💼 Admin Dashboard
- 📊 **Analytics Dashboard** - Real-time statistics with visual charts
- 🗳️ **Election Control** - Create, edit, and manage election lifecycle
- 👥 **Candidate Management** - Approve, reject, or manage candidate applications
- 👨‍🎓 **Student Management** - View and manage registered students
- 📬 **Feedback Management** - Review and respond to user feedback
- 🔔 **Broadcast Notifications** - Send announcements to all users
- 📈 **Voting Trends** - Visual insights into voter participation

### 👨‍🎓 Student Dashboard
- 🏠 **Personal Dashboard** - View elections, participation stats, and notifications
- 🗳️ **Cast Vote** - Secure voting with OTP verification
- 👀 **View Candidates** - Browse approved candidates with their manifestos
- 📊 **View Results** - Access election results when declared
- 👤 **Profile Management** - Update personal information
- 🔔 **Notification Center** - Stay updated with election news

### 🎤 Candidate Dashboard
- 📊 **Campaign Statistics** - Track votes and rankings
- 📝 **Manifesto Management** - Edit and update campaign manifesto
- 🏆 **Performance Metrics** - View vote percentage and competition analysis
- 🔔 **Status Notifications** - Receive approval/rejection updates
- 👤 **Profile Management** - Update candidate information

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Library |
| **Vite 7** | Build Tool & Dev Server |
| **TailwindCSS 4** | Styling Framework |
| **Framer Motion** | Animations |
| **React Router DOM 7** | Client-side Routing |
| **Axios** | HTTP Client |
| **Recharts** | Data Visualization |
| **Formik + Yup** | Form Handling & Validation |
| **Lucide React** | Icons |
| **React Hot Toast** | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime Environment |
| **Express 5** | Web Framework |
| **Prisma ORM** | Database ORM |
| **MySQL** | Database |
| **JWT** | Authentication |
| **bcrypt** | Password Hashing |
| **Nodemailer** | Email Service |
| **Multer** | File Uploads |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Admin     │  │   Student   │  │      Candidate          │  │
│  │  Dashboard  │  │  Dashboard  │  │      Dashboard          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (Axios)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server (Express.js)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Middleware Layer                       │   │
│  │  (CORS, JWT Auth, File Upload, Error Handling)           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Controller Layer                       │   │
│  │  (Auth, Election, Vote, Candidate, Student, Feedback)    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Service Layer                          │   │
│  │  (Election Scheduler, Email Service, Notifications)      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ Prisma ORM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MySQL Database                           │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────┐ ┌────────────────┐ │
│  │ USERS  │ │ ADMIN  │ │ STUDENT  │ │ VOTE │ │   ELECTION     │ │
│  └────────┘ └────────┘ └──────────┘ └──────┘ └────────────────┘ │
│  ┌───────────┐ ┌────────┐ ┌────────────┐ ┌──────────────────┐   │
│  │ CANDIDATE │ │ RESULT │ │  FEEDBACK  │ │   NOTIFICATION   │   │
│  └───────────┘ └────────┘ └────────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **MySQL** (v8.0 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/e-Voting-Platform.git
   cd e-Voting-Platform
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

#### Server (.env)
Create a `.env` file in the `server` directory:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/evoting_db"

# Server Configuration
PORT=5000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail SMTP)
EMAIL_ENABLED=true
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173

# Scheduler Configuration
ENABLE_SCHEDULER=true
```

#### Client (.env)
Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Database Setup

1. **Create the MySQL database**
   ```sql
   CREATE DATABASE evoting_db;
   ```

2. **Run Prisma migrations**
   ```bash
   cd server
   npx prisma migrate dev
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Seed the default admin** (happens automatically on server start)
   - Default Admin Email: `admin@evoting.com`
   - Default Admin Password: `admin123`

### Running the Application

#### Development Mode

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on: `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   Client runs on: `http://localhost:5173`

#### Production Mode

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Start the production server**
   ```bash
   cd server
   npm start
   ```

---

## 👥 User Roles

| Role | Access Level | Key Permissions |
|------|--------------|-----------------|
| **Admin** | Full Access | Manage elections, approve candidates, view all data, broadcast notifications |
| **Student** | Limited Access | View elections, vote, view results, submit feedback |
| **Candidate** | Limited Access | View campaign stats, manage manifesto, view election details |

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Student   │     │  Candidate  │     │    Admin    │
│   Signup    │     │  Register   │     │   Login     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Email     │     │   Admin     │     │   Direct    │
│   OTP       │     │  Approval   │     │   Access    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────┐
│                    JWT Token Issued                   │
│              (Stored in Local Storage)               │
└──────────────────────────────────────────────────────┘
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints Overview

| Module | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | `/auth/*` | Authentication & registration |
| **Election** | `/election/*` | Election CRUD operations |
| **Candidate** | `/candidate/*` | Candidate management |
| **Student** | `/student/*` | Student operations |
| **Vote** | `/vote/*` | Voting operations |
| **Feedback** | `/feedback/*` | Feedback submission |
| **Notification** | `/notification/*` | Notification management |
| **Dashboard** | `/dashboard/*` | Dashboard data |

### Sample API Requests

<details>
<summary><b>Authentication</b></summary>

**Student Login**
```http
POST /api/auth/student/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

**Admin Login**
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "userId": "admin@evoting.com",
  "password": "admin123"
}
```
</details>

<details>
<summary><b>Elections</b></summary>

**Get All Elections**
```http
GET /api/election
Authorization: Bearer <token>
```

**Create Election (Admin)**
```http
POST /api/election/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Student Council Election 2026",
  "startDate": "2026-02-01T09:00:00Z",
  "endDate": "2026-02-03T18:00:00Z",
  "positions": ["President", "Vice President", "Secretary"],
  "autoDeclareResults": true
}
```
</details>

<details>
<summary><b>Voting</b></summary>

**Cast Vote**
```http
POST /api/vote/cast
Authorization: Bearer <token>
Content-Type: application/json

{
  "electionId": 1,
  "candidateId": "12345",
  "position": "President",
  "otp": "123456"
}
```
</details>

---

## 📁 Project Structure

```
e-Voting-Platform/
├── 📁 client/                    # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 assets/            # Images & static files
│   │   ├── 📁 components/        # Reusable components
│   │   │   ├── DashboardRedirect.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── 📁 contexts/          # React Context (Auth)
│   │   ├── 📁 hooks/             # Custom React Hooks
│   │   ├── 📁 pages/             # Page Components
│   │   │   ├── 📁 AdminBoard/    # Admin pages
│   │   │   ├── 📁 Auth/          # Authentication pages
│   │   │   ├── 📁 CandidateBoard/# Candidate pages
│   │   │   └── 📁 StudentBoard/  # Student pages
│   │   ├── 📁 utils/             # API clients & utilities
│   │   ├── App.jsx               # Main App component
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── 📁 server/                    # Node.js Backend
│   ├── 📁 docs/                  # Documentation
│   │   ├── ADMIN_DASHBOARD_DOCUMENTATION.md
│   │   ├── CANDIDATE_DASHBOARD_DOCUMENTATION.md
│   │   ├── HANDLER_DOCUMENTATION.md
│   │   └── STUDENT_DASHBOARD_DOCUMENTATION.md
│   ├── 📁 prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── 📁 migrations/        # Database migrations
│   ├── 📁 src/
│   │   ├── 📁 controllers/       # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── candidateController.js
│   │   │   ├── electionController.js
│   │   │   ├── voteController.js
│   │   │   └── ...
│   │   ├── 📁 middlewares/       # Express middlewares
│   │   │   ├── authMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── 📁 routes/            # API routes
│   │   ├── 📁 services/          # Business logic
│   │   │   └── electionScheduler.js
│   │   ├── 📁 utils/             # Helper functions
│   │   │   ├── emailService.js
│   │   │   ├── notificationHelper.js
│   │   │   └── seedAdmin.js
│   │   └── index.js              # Server entry point
│   ├── 📁 uploads/               # File uploads
│   │   ├── 📁 candidates/        # Candidate documents
│   │   └── 📁 students/          # Student documents
│   └── package.json
│
└── README.md                     # This file
```

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| **Password Hashing** | bcrypt with salt rounds |
| **JWT Authentication** | Secure token-based auth with expiration |
| **Vote Encryption** | Encrypted vote storage |
| **OTP Verification** | Email-based OTP for vote verification |
| **CORS Protection** | Configured CORS middleware |
| **SQL Injection Prevention** | Prisma ORM parameterized queries |
| **Role-Based Access** | Protected routes with role verification |
| **Password Reset** | Secure token-based password reset with expiry |
| **Vote Anonymity** | Hashed student ID for vote records |

---


</details>

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**

### Development Guidelines

- Follow ESLint configuration for code style
- Write meaningful commit messages
- Update documentation for new features
- Add comments for complex logic
- Test thoroughly before submitting PR

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Library
- [Express.js](https://expressjs.com/) - Web Framework
- [Prisma](https://www.prisma.io/) - ORM
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [Framer Motion](https://www.framer.com/motion/) - Animation Library
- [Heroicons](https://heroicons.com/) & [Lucide](https://lucide.dev/) - Icons

---

<div align="center">

**Made with ❤️ for secure and transparent elections**

⭐ Star this repository if you found it helpful!

</div>

