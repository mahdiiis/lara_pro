# API Integration

The application communicates with a Laravel backend API using Axios:

## Key Endpoints

- **Authentication:**

  - `POST /login`: User login
  - `POST /register`: User registration
  - `POST /logout`: User logout
  - `GET /user`: Get user data

- **Quiz Management:**

  - `GET /select`: Get all quizzes
  - `GET /lastGames`: Get recent quizzes
  - `POST /game`: Create/update quiz
  - `DELETE /delete`: Delete quiz

- **Profile Management:**
  - Endpoints for updating profile data
  - Endpoints for changing password
