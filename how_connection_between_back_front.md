# Frontend & Backend Connection Explained

## The Simple Answer

**Frontend and Backend run on DIFFERENT ports:**

- **Frontend (React):** `http://localhost:3000`
- **Backend (Laravel API):** `http://localhost:8000`

---

## How They Connect

### 1. **Separate Services**

```
┌─────────────────────────────┐
│   Frontend (React App)      │
│   Running on Port 3000      │
│   What you see in browser   │
└────────────┬────────────────┘
             │
             │ HTTP Requests
             │ (via Axios)
             ▼
┌─────────────────────────────┐
│   Backend (Laravel API)     │
│   Running on Port 8000      │
│   Processes data & DB       │
└─────────────────────────────┘
```

### 2. **The `.env` File is Just Configuration**

The `.env` file does NOT make them run on the same port. It just tells the frontend **WHERE the backend is:**

```
VITE_API_URL=http://127.0.0.1:8000/api/
     ↓
This is where frontend will send requests
```

### 3. **Step-by-Step Login Flow**

```
1. User opens browser and goes to http://localhost:3000
   └─ Frontend (React) loads in their browser

2. User enters email: test@example.com, password: password
   └─ Frontend collects this data

3. Frontend makes HTTP POST request to http://127.0.0.1:8000/api/login
   └─ Sends credentials to the backend API

4. Backend (Laravel) receives the request
   └─ Checks the SQLite database for matching user

5. Backend sends back a JWT token (if credentials valid)
   └─ Token = proof of authentication

6. Frontend receives the token
   └─ Stores it in localStorage on the browser

7. Every future API call includes the token
   └─ Authorization: Bearer <token>

8. Backend verifies the token and processes requests
   └─ Returns quiz data, game data, etc.
```

---

## Key Concepts

| Concept | Meaning | Example |
|---------|---------|---------|
| **Port** | Communication channel on your computer | 3000, 8000 are different channels |
| **Frontend** | User Interface (what you see) | React app on port 3000 |
| **Backend** | API Server (data processor) | Laravel on port 8000 |
| **API URL** | Address where backend listens | `http://localhost:8000/api/` |
| **HTTP Request** | Message from frontend to backend | POST login request |
| **JWT Token** | Authentication proof | Stored in localStorage |
| **CORS** | Security rule allowing cross-origin requests | Configured to allow port 3000 → port 8000 |

---

## Why Different Ports?

**Reasons they must be separate:**

1. **Localhost has ONE IP address** (`127.0.0.1`)
   - Can't run two apps on the same port
   - Each app needs its own unique port

2. **Separation of Concerns**
   - Frontend = User Interface
   - Backend = Data/Business Logic
   - Different technologies (React vs Laravel)

3. **Scalability**
   - Can upgrade/restart backend without affecting frontend
   - Can deploy separately to different servers

4. **Security**
   - Backend hidden from direct browser access
   - API endpoints controlled with authentication

---

## Real-World Analogy

Think of it like a restaurant:

```
Customer (Frontend) ─────────────────────►  Waiter (Axios - HTTP Client)
                                                    │
                                                    │ Takes order to kitchen
                                                    ▼
                                           Chef (Backend API)
                                        Cooks the food (processes data)
                                                    │
                                                    │ brings plate back
                                                    ▼
Frontend receives data ◄────────────────  Customer sees the meal
```

- **Customer** = Your browser at port 3000
- **Waiter** = Axios making HTTP requests  
- **Kitchen** = Backend API at port 8000
- **Recipe/Food** = Database queries

They're in different locations, but they communicate!

---

## Configuration Details

### Frontend `.env` file:
```dotenv
VITE_API_URL=http://127.0.0.1:8000/api/
```

### Frontend Code (`api.js`):
```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
```

This reads the API URL from `.env` and creates an Axios instance that will send all requests to `http://127.0.0.1:8000/api/`

### Backend (Laravel) runs with:
```bash
php artisan serve
```
Starts on `http://localhost:8000`

---

## Summary

✅ Frontend: `http://localhost:3000` (what you visit)
✅ Backend API: `http://localhost:8000/api/` (where frontend sends data)
✅ `.env` file: Tells frontend WHERE to find the backend
✅ HTTP Requests: HOW they communicate
✅ JWT Token: Authentication mechanism

They are **two separate applications** that **talk to each other** through **HTTP requests**!
