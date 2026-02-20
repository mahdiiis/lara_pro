# Core Components Structure

## NavBar (`components/Navbar.jsx`)

Navigation component that provides:

- Navigation links to different parts of the application
- Theme toggle button
- Language selector
- User profile options and logout button

## AuthRoute (`components/AuthRoute.jsx`)

Route protection component that:

- Verifies user authentication
- Redirects unauthenticated users to login page
- Renders protected content for authenticated users

## LoadingSpinner (`components/LoadingSpinner.jsx`)

- Visual indicator for asynchronous operations
- Used throughout the application during API calls

## PageTransition (`components/PageTransition.jsx`)

- Wrapper component providing smooth page transitions
- Uses framer-motion for animation effects
