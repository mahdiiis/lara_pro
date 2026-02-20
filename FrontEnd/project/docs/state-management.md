## State Management

The application uses React Context API for global state management:

### AuthContext (`context/AuthContext.jsx`)

Manages user authentication and user data:

- **State:**

  - `user`: Current authenticated user
  - `quizzes`: User's quizzes
  - `loading`: Authentication loading state
  - `profileImage`: User's profile image

- **Methods:**
  - `login(credentials)`: Authenticates user
  - `register(userData)`: Creates new user
  - `logout()`: Ends user session
  - `updateUserProfile(data)`: Updates user profile
  - `updateUserPassword(passwords)`: Changes password
  - `addQuiz(quiz)`: Adds new quiz
  - `setAllQuizzes(quizzes)`: Sets all quizzes

### ThemeContext (`context/ThemeContext.jsx`)

Manages application theme:

- **State:**

  - `theme`: Current theme (light/dark)

- **Methods:**
  - `toggleTheme()`: Toggles between light and dark

### LoadingContext (`context/LoadingContext.jsx`)

Manages loading states:

- **State:**

  - `loading`: Global loading state

- **Methods:**
  - `setLoading(state)`: Sets loading state
  - `startLoading()`: Sets loading to true
  - `stopLoading()`: Sets loading to false

### LanguageContext (`context/LanguageContext.jsx`)

Manages internationalization:

- **State:**

  - `language`: Current language

- **Methods:**
  - `setLanguage(lang)`: Sets application language

### NotificationContext (`context/NotificationContext.jsx`)

Manages notification preferences:

- **State:**

  - `notificationsEnabled`: Whether notifications are enabled

- **Methods:**
  - `toggleNotifications()`: Toggles notifications on/off
  - `showNotification(message)`: Shows a notification
