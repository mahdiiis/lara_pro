# Component Structure

## Core Components

### NavBar (`components/Navbar.jsx`)

Navigation component that provides:

- Navigation links to different parts of the application
- Theme toggle button
- Language selector
- User profile options and logout button

### AuthRoute (`components/AuthRoute.jsx`)

Route protection component that:

- Verifies user authentication
- Redirects unauthenticated users to login page
- Renders protected content for authenticated users

### LoadingSpinner (`components/LoadingSpinner.jsx`)

- Visual indicator for asynchronous operations
- Used throughout the application during API calls

### PageTransition (`components/PageTransition.jsx`)

- Wrapper component providing smooth page transitions
- Uses framer-motion for animation effects

## Page Components

### Dashboard (`pages/Dashboard.jsx`)

Home page displaying:

- Recent quizzes
- Create New Quiz button
- Statistics on user activities

### Login (`pages/Login.jsx`)

Authentication page with:

- Email and password fields
- Login button
- Link to signup page

### Signup (`pages/Signup.jsx`)

Registration page with:

- Name, email, and password fields
- Register button
- Link to login page

### Settings (`pages/Settings.jsx`)

User profile management page with:

- Profile information update form
- Password change form
- Profile image upload

## Quiz Creation Flow Components

### InitialForm (`components/InitialForm.jsx`)

First step in quiz creation that collects:

- Course name
- Topic
- Game number
- Number of levels

### LevelForm (`components/LevelForm.jsx`)

Second step in quiz creation that manages:

- Question type selection (box or balloon)
- Question and answer creation for each level
- Level configuration

### Preview (`components/Preview.jsx`)

Final step in quiz creation that:

- Shows a preview of the created quiz
- Allows final adjustments
- Provides option to save or reset the quiz

### Games (`components/Games.jsx`)

Component for managing existing games:

- Lists all created games
- Provides options to view, edit, or delete games
- Allows filtering and searching games

## Utility Components

### LanguageSelector (`components/LanguageSelector.jsx`)

- Dropdown for selecting application language
- Integrates with LanguageContext

### RefreshButton (`components/RefreshButton.jsx`)

- Button to refresh data on the current page
- Shows loading state during refresh

### ThemeToggle (`components/ThemToggle.jsx`)

- Button for toggling between light and dark themes
- Integrates with ThemeContext

### NotificationToggle (`components/NotificationToggle.jsx`)

- Controls notification preferences
- Integrates with NotificationContext
