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
#
