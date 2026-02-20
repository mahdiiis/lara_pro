# Data Flow

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
