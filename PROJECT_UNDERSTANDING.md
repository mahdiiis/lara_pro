# 2PI TEACHER DASHBOARD - COMPLETE PROJECT GUIDE

## 📌 PROJECT OVERVIEW

**2Pi Teacher Dashboard** is an interactive math quiz creation and management platform. Teachers create custom math quizzes with different question types, and students play these quizzes as games.

**Stack**: React (Frontend) + Laravel (Backend)

---

## 🏗️ ARCHITECTURE

### Two-Tier Application

```
┌─────────────────────────────────────────┐
│         FRONTEND (React/Vite)           │
│  ┌─────────────────────────────────────┐│
│  │ Pages (Dashboard, Quiz Creator)     ││
│  │ Components (Forms, Games)           ││
│  │ Context (Auth, Language, Theme)     ││
│  │ Services (API calls to Backend)     ││
│  └─────────────────────────────────────┘│
└──────────────────│───────────────────────┘
                   │ HTTP/REST API
                   │
┌──────────────────▼───────────────────────┐
│      BACKEND (Laravel API)                │
│  ┌─────────────────────────────────────┐ │
│  │ Controllers (Handle Routes)         │ │
│  │ Models (Game, Level, User, etc.)    │ │
│  │ Database (MySQL)                    │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 👥 USER FLOWS

### Flow 1: Teacher - Quiz Creation & Management

```
1. SIGNUP/LOGIN
   └─> Create account / Sign in

2. DASHBOARD
   └─> View all quizzes created
   └─> Click "Create New Quiz"

3. QUIZ CREATION WIZARD (Step-based)
   ├─> Step 0: INITIAL FORM
   │   ├─ Enter: Course, Topic, Game Number
   │   ├─ Select: Number of Levels (1-6)
   │   └─ Submit → Creates empty level objects
   │
   ├─> Step 1-N: LEVEL FORM (for each level)
   │   ├─ Choose Level Type: "Boxes" or "Balloons"
   │   ├─ Add Questions/Answers (depending on type)
   │   └─ Click "Next" to go to next level
   │
   └─> Step N+1: PREVIEW
       ├─ Review entire quiz
       └─ Submit to Backend → Save to Database

4. QUIZ SAVED
   └─> Returns to Dashboard
```

### Flow 2: Student - Playing a Quiz

```
1. LOGIN
2. VIEW GAMES (Public quizzes available to play)
3. SELECT A QUIZ
4. PLAY LEVELS SEQUENTIALLY
   ├─ Level 1: Answer questions (based on type)
   ├─ Level 2: More questions
   └─ ...continue through all levels
5. FINAL RESULTS
   └─ Score, Progress, etc.
```

---

## 📁 FRONTEND STRUCTURE

### Pages (`src/pages/`)

| File | Purpose |
|------|---------|
| **Login.jsx** | User authentication - email/password login |
| **Signup.jsx** | Create new user account |
| **Dashboard.jsx** | Shows all user's quizzes, quick access to features |
| **Settings.jsx** | User preferences, language, theme |
| **ResetPassword.jsx** | Password recovery |
| **PrivacyPolicy.jsx** | Legal document |
| **TermsOfService.jsx** | Legal document |

### Components (`src/components/`)

#### Core Quiz Creation Components

| Component | Purpose | Used In |
|-----------|---------|---------|
| **InitialForm.jsx** | Step 0 - Input basic quiz info | /create page |
| **LevelForm.jsx** | Steps 1-N - Configure each level | /create page |
| **Preview.jsx** | Final step - Review quiz before submit | /create page |
| **QuizForm.jsx** | Wrapper for the 3-step quiz creator | /create page |

#### Game Playing Components

| Component | Purpose |
|-----------|---------|
| **Games.jsx** | List available quizzes to play |
| **Game.jsx** | Active game - render current level |

#### UI & Navigation

| Component | Purpose |
|-----------|---------|
| **Navbar.jsx** | Top navigation bar |
| **AuthRoute.jsx** | Protected routes - redirect non-authenticated users |
| **PageTransition.jsx** | Animations when switching pages |
| **ThemeToggle.jsx** | Light/Dark mode switcher |
| **LanguageSelector.jsx** | Change app language |
| **NotificationCenter.jsx** | Show user notifications |

---

## ⚙️ CONTEXT API (State Management)

### Available Contexts

```
src/context/
├── AuthContext.jsx      ← User login/logout, user data
├── ThemeContext.jsx     ← Light/Dark mode
├── LanguageContext.jsx  ← Language selection
├── LoadingContext.jsx   ← Global loading state
└── NotificationContext.jsx ← Toast notifications
```

**Example Usage in Components:**
```jsx
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  // Can access user & auth state
}
```

---

## 🔐 BACKEND STRUCTURE

### Database Models (`app/Models/`)

```
User
├─ id, email, password, name
├─ has_many: Games

Game (Quiz)
├─ id, user_id, course, topic, gameNumber
├─ belongs_to: User
├─ has_many: Levels

Level
├─ id, game_id, level_number, level_type (box/balloon)
├─ level_stats: coins, lives, mistakes, stars, time_spent
├─ belongs_to: Game
├─ has_many: Questions (via BoxQuestionAnswer or BalloonType)

BalloonType (for "balloon" level type)
├─ id, level_id, question, type

BalloonAnswer (Answers for balloon)
├─ id, balloon_id, text, is_true

BoxQuestionAnswer (for "box" level type - multiple questions)
├─ id, level_id, question, answer
```

### Database Schema

```
users
├─ id, email, password, name, created_at

games
├─ id, user_id, course, topic, gameNumber, created_at

levels
├─ id, game_id, level_number, level_type, level_stats, created_at

balloon_types
├─ id, level_id, question, type

balloon_answers
├─ id, balloon_id, text, is_true

box_question_answers
├─ id, level_id, question, answer
```

---

## 🔄 DATA FLOW: Quiz Creation Step-by-Step

### Step 0: InitialForm Submission

**Frontend:**
```jsx
// User fills out form
{
  course: "Algebra",
  topic: "Quadratic Equations",
  gameNumber: "1",
  numLevels: "2"
}
// Submit → handleSubmit() creates levels array
```

**What Happens:**
```jsx
const newLevels = Array(2).fill().map((_, i) => ({
  level_number: i + 1,
  level_type: "box",      // Default type
  level_stats: { coins: 0, lifes: 5, ... },
  questions: []           // Empty initially
}));

// Calls onDataChange() with levels array
onDataChange({ ...formData, levels: newLevels });
```

**App.jsx Detection:**
```jsx
handleQuizDataChange(newData) {
  if (newData.levels.length > 0 && currentStep === 0) {
    setCurrentStep(1);  // ← AUTO-JUMP TO LEVELFORM
  }
}
```

---

### Steps 1-N: LevelForm Configuration

**What LevelForm Does:**
```jsx
User selects level type:
├─ "Boxes" → Multiple Questions (max 5)
│  └─ Each question has: text + answer
│
└─ "Balloons" → Single Question (max 10 answers)
   └─ One question with 10 possible answers (true/false)
```

**LevelForm State:**
```jsx
{
  level_number: 1,
  level_type: "box",        // or "balloon"
  level_stats: {
    coins: 0, lifes: 5,
    mistakes: 0, stars: 1,
    time_spent: 0
  },
  questions: [              // For "box" type
    { text: "Q1", answer: "A1" },
    { text: "Q2", answer: "A2" }
  ],
  // OR
  question: "...",          // For "balloon" type
  answers: [
    { text: "Answer1", is_true: true },
    { text: "Answer2", is_true: false }
  ]
}
```

**Each Change Triggers:**
```jsx
onChange(updatedLevel) 
  → App.jsx handleQuizDataChange()
    → Updates that level in quizData.levels[]
    → Saves to localStorage
```

---

### Final Step: Preview & Submit

**Preview Component Shows:**
- Quiz info (course, topic, gameNumber)
- All levels with their questions
- Option to submit to backend

**API Call to Backend:**
```
POST /api/games
Body: {
  user_id: 1,
  course: "Algebra",
  topic: "Quadratic Equations",
  gameNumber: "1",
  levels: [
    {
      level_number: 1,
      level_type: "box",
      level_stats: {...},
      questions: [...]
    },
    ...
  ]
}

Response: { success: true, game_id: 123 }
```

**Backend Processing:**
```
1. Create Game record
2. For each level:
   a. Create Level record
   b. If type="box": create BoxQuestionAnswer records
   c. If type="balloon": create BalloonType + BalloonAnswer records
3. Return success
```

---

## 🎮 QUESTION TYPES EXPLAINED

### Type 1: "Boxes" (Box Questions)

**Teacher Creates:**
```
Level 1: Boxes
├─ Q1: "What is 2+2?" → A1: "4"
├─ Q2: "What is 3×5?" → A2: "15"
└─ Q3: "What is 10/2?" → A3: "5"
(Max 5 questions)
```

**Student Plays:**
```
See 3 boxes on screen
Click box 1 → Input answer → Click box 2, etc.
```

**Data Structure:**
```jsx
// LevelForm state
{
  level_type: "box",
  questions: [
    { text: "2+2", answer: "4" },
    { text: "3×5", answer: "15" },
    { text: "10/2", answer: "5" }
  ]
}

// Database
box_question_answers
├─ level_id: 1, question: "2+2", answer: "4"
├─ level_id: 1, question: "3×5", answer: "15"
└─ level_id: 1, question: "10/2", answer: "5"
```

---

### Type 2: "Balloons" (Balloon Questions)

**Teacher Creates:**
```
Level 2: Balloons
Question: "What is 5+3?"
├─ ○ 7 (FALSE)
├─ ○ 8 (TRUE) ← Correct
├─ ○ 9 (FALSE)
├─ ○ 10 (FALSE)
...up to 10 answers
```

**Student Plays:**
```
See one question and balloons with answers
Click the balloon with the correct answer
Bubble pops if correct
```

**Data Structure:**
```jsx
// LevelForm state
{
  level_type: "balloon",
  question: "5+3",
  answers: [
    { text: "7", is_true: false },
    { text: "8", is_true: true },
    { text: "9", is_true: false },
    { text: "10", is_true: false }
  ]
}

// Database - 2 tables:
balloon_types
├─ level_id: 2, question: "5+3", type: "balloon"

balloon_answers
├─ balloon_id: 1, text: "7", is_true: 0
├─ balloon_id: 1, text: "8", is_true: 1
├─ balloon_id: 1, text: "9", is_true: 0
└─ balloon_id: 1, text: "10", is_true: 0
```

---

## 🔌 API ENDPOINTS (Backend Routes)

**Assuming Backend at: http://localhost:8000/api**

### Authentication
```
POST /api/login           → User login
POST /api/signup          → Create account
POST /api/logout          → User logout
POST /api/reset-password  → Password recovery
```

### Quiz Management
```
GET /api/select                    → Get all quizzes for user
POST /api/games                    → Create new quiz
GET /api/games/{id}                → Get single quiz
PUT /api/games/{id}                → Update quiz
DELETE /api/games/{id}             → Delete quiz
```

### Level Management
```
GET /api/levels/{id}               → Get specific level
POST /api/games/{id}/levels        → Add level to quiz
PUT /api/levels/{id}               → Update level
```

### Playing Quizzes
```
GET /api/games/{id}/play           → Get quiz for playing
POST /api/games/{id}/submit        → Submit answers
GET /api/games/{id}/results        → Get results
```

---

## 🔗 HOW COMPONENTS CONNECT

### Quiz Creation Flow (Parent-Child Communication)

```
App.jsx (Main Container)
├─ Manages: quizData, currentStep
├─ Function: handleQuizDataChange()
│
└─ Route: /create
   └─ renderCurrentStep()
      │
      ├─ If step=0: <InitialForm onDataChange={handleQuizDataChange} />
      │             ├─ User fills form
      │             ├─ Submits
      │             └─ Calls onDataChange() with levels
      │                 └─ App.jsx: Detects levels → setCurrentStep(1)
      │
      ├─ If step=1-N: <LevelForm onChange={callback} />
      │              ├─ User configures each level
      │              └─ onChange triggered
      │                  └─ App.jsx: Updates quizData.levels[index]
      │
      └─ If step>N: <Preview onDataChange={handleQuizDataChange} />
                    ├─ Shows all quiz data
                    └─ User submits to backend
```

### State Lifting Pattern

```
Lowest: InitialForm, LevelForm components
  │ (Have their own useState)
  │ Call: onChange() or onDataChange()
  │
Middle: App.jsx (Container)
  │ (Holds quizData, currentStep)
  │ Updates own state
  │
Highest: localStorage
  │ (Persisted quizData)
```

---

## 🛠️ DEVELOPMENT WORKFLOW

### To Create a New Quiz

1. **User goes to Dashboard**
2. **Clicks "Create New Quiz"**
3. **Navigates to /create route**
4. **App.jsx shows InitialForm**
5. **Fill form → Submit → InitialForm calls onDataChange()**
6. **App.jsx detects levels exist → setCurrentStep(1)**
7. **App.jsx renders LevelForm for level 1**
8. **User fills level 1 → LevelForm calls onChange()**
9. **App.jsx updates quizData.levels[0]**
10. **User clicks "Next" → setCurrentStep(2)**
11. **App.jsx renders LevelForm for level 2**
12. **...repeat for each level...**
13. **After last level → User clicks "Preview"**
14. **App.jsx renders Preview**
15. **User clicks "Submit"**
16. **Preview makes API call to POST /api/games**
17. **Backend saves all data**
18. **Return to Dashboard**

---

## 📊 KEY FILES TO UNDERSTAND

### Must Read (In Order)
1. **App.jsx** - Main flow orchestrator
2. **InitialForm.jsx** - First step
3. **LevelForm.jsx** - Multiple steps
4. **Preview.jsx** - Final step before DB
5. **Dashboard.jsx** - User's quiz list

### Backend (To Understand DB)
1. **app/Models/Game.php** - Quiz model
2. **app/Models/Level.php** - Level model
3. **app/Models/BalloonType.php** - Balloon question
4. **app/Models/BoxQuestionAnswer.php** - Box questions
5. **routes/api.php** - API endpoints

---

## 🎯 KEY CONCEPTS

| Concept | Explanation |
|---------|-------------|
| **Step-Based Wizard** | Quiz creation broken into steps (0, 1, 2, ..., N) |
| **currentStep** | State variable that controls which component renders |
| **quizData** | Central state object holding all quiz info |
| **Level Type** | "box" (multiple Q&A) or "balloon" (single Q, multiple answers) |
| **Callback Pattern** | Child components notify parent via onChange/onDataChange callbacks |
| **localStorage** | Persists quizData so users can resume creating |
| **Context API** | Global state for Auth, Theme, Language |
| **REST API** | Backend provides endpoints for CRUD operations |

---

## 🚀 HOW TO RUN

### Frontend
```bash
cd FrontEnd
npm install
npm run dev
# Opens at http://localhost:5173
```

### Backend
```bash
cd BackEnd
composer install
cp .env.example .env   # Setup database
php artisan migrate    # Run migrations
php artisan serve
# Runs at http://localhost:8000
```

---

## 📌 QUICK SUMMARY

✅ **Frontend**: React with step-by-step quiz creator
✅ **Backend**: Laravel API to save quizzes to MySQL
✅ **Quiz Types**: "Boxes" (multiple questions) or "Balloons" (single question)
✅ **State Management**: Context API for global state + useState for local forms
✅ **Persistence**: localStorage during creation, database for final save
✅ **User Flows**: Teacher creates → Student plays → Results tracked
