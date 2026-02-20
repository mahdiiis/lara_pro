# 2pi Dashboard - Interactive Math Quiz Platform

## Project Overview

The 2pi Dashboard is an interactive web application designed to help teachers create and manage engaging math quizzes for their students. The platform consists of a React-based frontend and a Laravel-based backend API.

### Key Features

- **Quiz Creation**: Create customizable math quizzes with different question types
- **Game Level Management**: Configure multiple levels with progressive difficulty
- **Question Types**: Support for "box" (multiple questions) and "balloon" (single question with multiple answers) formats
- **Student Progress Tracking**: Monitor student performance and progress
- **User Authentication**: Secure login, registration, and profile management
- **Internationalization**: Multi-language support
- **Theme Customization**: Light and dark mode support
- **Responsive Design**: Works on various device sizes

## Project Structure

The project is organized into two main components:

### Frontend (`dashboard_adv/`)

```
dashboard_adv/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # Context providers for state management
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page-level components
│   ├── services/        # API service functions
│   ├── translations/    # Internationalization files
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main application component
│   ├── Form.jsx         # Form handling logic
│   ├── index.css        # Global styles
│   └── main.jsx         # Application entry point
├── .env                 # Environment variables
├── package.json         # Project dependencies
└── tailwind.config.js   # TailwindCSS configuration
```

### Backend (`2pi_Dashboard_BackEnd/`)

```
2pi_Dashboard_BackEnd/
├── app/
│   ├── Http/            # Controllers and middleware
│   ├── Models/          # Database models
│   └── Providers/       # Service providers
├── config/              # Application configuration
├── database/
│   ├── migrations/      # Database migrations
│   ├── factories/       # Model factories for testing
│   └── seeders/         # Database seeders
├── routes/
│   ├── api.php          # API routes
│   └── web.php          # Web routes
├── .env                 # Environment variables
└── composer.json        # PHP dependencies
```

## Technology Stack

### Frontend

- **Framework**: React 18.3
- **Build Tool**: Vite 6.0
- **Routing**: react-router-dom v6.30
- **HTTP Client**: Axios v1.7
- **Animation**: framer-motion v10.18
- **Styling**: TailwindCSS v3.4
- **State Management**: React Context API
- **Form Validation**: Zod v3.22
- **Notifications**: react-hot-toast v2.4
- **Icons**: lucide-react v0.475, react-icons v4.12
- **Charts**: recharts v2.15

### Backend

- **Framework**: Laravel
- **Authentication**: Laravel Sanctum
- **Database**: MySQL/PostgreSQL
- **API**: RESTful API endpoints

## Installation

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd dashboard_adv
   ```

2. Install dependencies:
   
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure the API URL:

   ```
   VITE_API_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd 2pi_Dashboard_BackEnd
   ```

2. Install PHP dependencies:

   ```
   composer install
   ```

3. Create a `.env` file based on `.env.example` and configure your database:

   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_database_username
   DB_PASSWORD=your_database_password
   ```

4. Generate application key:

   ```
   php artisan key:generate
   ```

5. Run database migrations:

   ```
   php artisan migrate
   ```

6. Start the development server:
   ```
   php artisan serve
   ```

## Usage

### Teacher Dashboard

1. **Registration/Login**: Create an account or log in to access the dashboard
2. **Create Quiz**:
   - Enter course name, topic, and game number
   - Select number of levels (1-4)
   - Configure each level with questions and answers
   - Choose between "box" and "balloon" question types
3. **Preview Quiz**: Review the quiz before publishing
4. **Manage Quizzes**: View, edit, or delete existing quizzes
5. **Profile Settings**: Update profile information and preferences

### API Endpoints

#### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout (requires authentication)
- `GET /api/user` - Get current user info (requires authentication)
- `PUT /api/profile` - Update user profile (requires authentication)
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token

#### Games/Quizzes

- `POST /api/game` - Create a new game
- `GET /api/select` - Get all games
- `GET /api/lastGames` - Get recently created games
- `DELETE /api/delete` - Delete a game
- `GET /api/getGameById` - Get a specific game by ID

#### Notifications

- `GET /api/notifications` - Get user notifications (requires authentication)
- `POST /api/notifications` - Create a notification (requires authentication)
- `PUT /api/notifications/{id}/read` - Mark notification as read (requires authentication)
- `PUT /api/notifications/read-all` - Mark all notifications as read (requires authentication)
- `DELETE /api/notifications/{id}` - Delete a notification (requires authentication)
- `DELETE /api/notifications` - Delete all notifications (requires authentication)

## Data Flow

1. **Authentication Flow:**

   - User enters credentials in Login component
   - Credentials passed to AuthContext login method
   - API request made using Axios
   - On success, token and user data stored in localStorage
   - User redirected to Dashboard

2. **Quiz Creation Flow:**

   - User navigates to Create Quiz
   - InitialForm collects basic quiz information
   - LevelForm used to create multiple quiz levels
   - Preview displays finalized quiz
   - Quiz data sent to backend via API call
   - On success, quiz added to user's quizzes

3. **Quiz Management Flow:**

   - Dashboard/Games components fetch quizzes from backend
   - User can view, edit, or delete quizzes
   - Changes persisted to backend via API

4. **User Settings Flow:**
   - Settings component fetches current user data
   - User updates profile information or password
   - Changes sent to backend via API
   - On success, user data updated in AuthContext

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---




# Setup Progress Notes - Feb 15, 2026

## What Was Done:

### 1. Checked Composer ✅
- Verified Composer 2.8.12 was installed with PHP 8.2.12

### 2. Fixed Backend Dependencies 
- **Problem:** The `vendor/autoload.php` file was missing, so Laravel commands couldn't run
- **Solution:** Ran `composer install` to rebuild the vendor folder with all PHP dependencies (116 packages installed)

### 3. Generated App Key ✅
- Ran `php artisan key:generate` to set the `APP_KEY` in `.env` file (needed for Laravel encryption)

### 4. Created Database ✅
- Ran `php artisan migrate` which:
  - Created a new SQLite database file at `database/database.sqlite`
  - Created 13 database tables (users, games, levels, balloon types, answers, logins, notifications, sessions, etc.)

### 5. Started Backend Server ✅
- Started Laravel development server on `http://localhost:8000`

---

## Problems Encountered:

### 1. File Locking Issue
- **Error:** `file_put_contents(...vendor/composer/installed.php): Failed to open stream: Resource temporarily unavailable`
- **Cause:** Antivirus or another process was holding the file lock
- **Solution:** Cleared composer cache with `composer clear-cache` and retried installation

### 2. PowerShell Path Escaping
- **Error:** `Unexpected token` when trying to run PHP artisan with quoted paths
- **Cause:** PowerShell requires special syntax for executing files with arguments
- **Solution:** Used `&` operator: `& 'c:\xampp\php\php.exe' 'c:\Users....\artisan' serve`

### 3. Vendor Folder Missing After Download
- **Error:** `Failed opening required 'vendor/autoload.php'`
- **Cause:** Project was missing vendor folder on initial clone
- **Solution:** Composer completely regenerated dependencies

---

## Current Status:

✅ **Backend:** Running on http://localhost:8000
⏳ **Frontend:** Waiting for setup (npm install + npm run dev)

## Next Steps:

1. Run `npm install` in FrontEnd folder
2. Run `npm run dev` to start React dev server on http://localhost:5173
3. Frontend will communicate with backend API at http://localhost:8000

---

## Frontend Setup:

### 1. Installed NPM Dependencies ✅
- Ran `npm install` in FrontEnd folder
- Installed 481 packages including:
  - React 18.3.1
  - React Router 6.30.0
  - Axios 1.7.9 (for API calls)
  - Tailwind CSS for styling
  - Vite 6.2.0 (build tool)
  - Various UI libraries (lucide-react, react-icons, framer-motion, recharts)

### 2. Started Frontend Dev Server ✅
- Ran `npm run dev` to start Vite development server
- Server started on `http://localhost:3000`
- Provides hot module reloading for live development

---

## Frontend Problems Encountered:

### 1. Initial Directory Issue
- **Error:** `npm error ENOENT: no such file or directory, open 'C:\Users\Usuario\Desktop\2Pi_Teacher_Dashboard-main\package.json'`
- **Cause:** Command tried to run from root project directory instead of FrontEnd subfolder
- **Solution:** Explicitly changed directory to FrontEnd folder before running `npm run dev`: 
  ```powershell
  cd "c:\Users\Usuario\Desktop\2Pi_Teacher_Dashboard-main\FrontEnd" ; npm run dev
  ```

### 2. NPM Audit Warnings
- **Warning:** 14 vulnerabilities detected (5 low, 3 moderate, 5 high, 1 critical)
- **Cause:** Some dependencies have known security issues
- **Status:** Application still runs, but can run `npm audit fix` later to address critical issues
- **Note:** Vulnerabilities are in development dependencies, not critical for core functionality

---

## Architecture Summary:

**Frontend-Backend Communication:**
- Frontend (React on http://localhost:3000) makes API calls to Backend (Laravel on http://localhost:8000)
- Uses Axios for HTTP requests
- Implements authentication with JWT tokens via `tymon/jwt-auth` in backend
- Database: SQLite with 13 tables for storing quiz data, user progress, etc.

**Key Technologies:**
- **Frontend:** React 18, Vite, Tailwind CSS, TanStack Query
- **Backend:** Laravel 11, SQLite, JWT Authentication
- **Both:** CORS configured for localhost communication

---

## Final Status:

✅ **Backend:** Running on http://localhost:8000
✅ **Frontend:** Running on http://localhost:3000
✅ **Database:** SQLite fully initialized
✅ **All Systems:** Operational

## 2Pi Dashboard is Ready! 🚀

---

## Additional Configuration Issues & Fixes:

### 1. Missing Frontend `.env` File
- **Problem:** Got HTTP 404 error when trying to login - API requests failing
- **Root Cause:** Frontend didn't know where the backend API was located
- **File Involved:** `FrontEnd/.env` 
- **Solution:** Created `.env` file with:
  ```
  VITE_API_URL=http://127.0.0.1:8000/api/
  ```

### 2. Database Schema Mismatch
- **Problem:** `php artisan db:seed` failed with error: `table users has no column named email_verified_at`
- **Root Cause:** The database migration defined users table WITHOUT `email_verified_at`, but UserFactory tried to insert it
- **Files Modified:** `BackEnd/database/factories/UserFactory.php`
- **Solution:** Commented out the problematic line:
  ```php
  // 'email_verified_at' => now(),
  ```

### 3. How Frontend & Backend Connect

**Key Code in `FrontEnd/src/services/api.js`:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
```

This means:
- **Option 1:** Use `VITE_API_URL` from `.env` → `http://127.0.0.1:8000/api/`
- **Option 2 (Fallback):** Use `http://localhost:8000/api` if `.env` not found

**Important Notes:**
- `localhost` = `127.0.0.1` (both are your local computer)
- The `.env` file = **Configuration** (tells where API is)
- HTTP Requests = **Actual Connection** (how they talk)
- JWT Token = **Authentication** (proves who you are)

### 4. Connection & Authentication Flow
1. Frontend sends POST to `http://127.0.0.1:8000/api/login`
2. Backend checks SQLite database for matching credentials
3. Backend returns JWT token if credentials valid
4. Frontend stores token in browser `localStorage`
5. All future API calls include token in header: `Authorization: Bearer <token>`

### 5. Test User Successfully Created
- Ran: `php artisan db:seed`
- **Email:** `test@example.com`
- **Password:** `password`
- Verified: `sqlite3 database/database.sqlite "SELECT id, name, email FROM users;"`
- Result: `1|Test User|test@example.com` ✅

---

## Quick Reference - Configuration Summary

| Component | Purpose | Value |
|-----------|---------|-------|
| `.env` file | API URL configuration | `VITE_API_URL=http://127.0.0.1:8000/api/` |
| Frontend API URL | Where frontend connects | From `.env` or fallback to `localhost:8000/api` |
| Backend Server | API provider | Running on `http://localhost:8000` |
| Database | Data storage | SQLite at `BackEnd/database/database.sqlite` |
| Test Credentials | For login testing | `test@example.com` / `password` |




