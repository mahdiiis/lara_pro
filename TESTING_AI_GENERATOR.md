# Testing AI Question Generator

## 🔍 **STEP-BY-STEP DEBUGGING**

### **Step 1: Check Browser Console**

1. Open your browser at `http://localhost:3001`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Fill the InitialForm:
   - Course: "Math"
   - Topic: "Algebra"
   - Game Number: "1"
   - Number of Levels: "2"
5. Click **"Generate with AI"** button
6. The AI panel opens on the right
7. **Look for ANY error messages in the Console**

---

### **Step 2: Check Network Tab**

1. In Developer Tools, go to **Network** tab
2. Make sure it's recording (red circle in top-left)
3. Fill AI form:
   - Select: **Level 1**
   - Select: **Boxes**
   - Type prompt: `Generate 3 simple math questions`
4. Click **"Generate"** button
5. **Wait and look for the request:**
   - You should see a request called `generate-questions`
   - Click on it to see:
     - **Request Headers** - Check if Authorization header exists
     - **Request Body** - Check if prompt, game_type, level are correct
     - **Response** - Check if you get questions back

---

### **Step 3: Test Backend API Directly (NO Frontend)**

Open **PowerShell** and test the API directly:

```powershell
# First, get a token by logging in
curl -X POST http://127.0.0.1:8000/api/login `
  -H "Content-Type: application/json" `
  -d @{
    email = "your-email@example.com"
    password = "your-password"
  } | ConvertFrom-Json | Select-Object -ExpandProperty token

# Copy the token from the output above
# Then test the generate-questions endpoint:

curl -X POST http://127.0.0.1:8000/api/generate-questions `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{
    "prompt": "Generate 3 math questions",
    "game_type": "box",
    "level": 1
  }'
```

---

### **Step 4: Check Backend Logs**

1. Check if Laravel is showing errors:
   ```powershell
   # The Terminal running "php artisan serve" should show errors
   # Look for any red text or error messages
   ```

2. Check Laravel log file:
   ```powershell
   # Open the log file
   type "c:\Users\Usuario\Desktop\2Pi_Teacher_Dashboard-main - Copy\BackEnd\storage\logs\laravel.log"
   ```

---

### **Step 5: Add Console Logging to Debug**

Edit `AIQuestionGenerator.jsx` and add logging to see what's happening:

**Find this code (around line 87-102):**
```javascript
const response = await axios.post(`${apiUrl}generate-questions`, {
  prompt: formData.prompt,
  game_type: formData.selectedGameType,
  level: formData.selectedLevel,
}, {
  headers: {
    Authorization: `Bearer ${token}`,
  }
});
```

**Replace with (add console.log for debugging):**
```javascript
console.log("🚀 Sending request to:", `${apiUrl}generate-questions`);
console.log("📝 Data:", {
  prompt: formData.prompt,
  game_type: formData.selectedGameType,
  level: formData.selectedLevel,
});
console.log("🔐 Token:", token ? "✅ Present" : "❌ Missing");

const response = await axios.post(`${apiUrl}generate-questions`, {
  prompt: formData.prompt,
  game_type: formData.selectedGameType,
  level: formData.selectedLevel,
}, {
  headers: {
    Authorization: `Bearer ${token}`,
  }
});

console.log("✅ Response:", response.data);
```

---

## 🐛 **COMMON ISSUES**

### **Issue 1: 401 Unauthorized**
**Symptom:** Network shows 401 status  
**Cause:** Token is invalid or missing  
**Solution:**  
- Log out and log back in
- Check localStorage has "token"
- Verify token format is `Bearer eyJhb...`

### **Issue 2: 422 Validation Error**
**Symptom:** Network shows 422 status  
**Cause:** Required fields missing or wrong format  
**Solution:**  
- Check: `prompt`, `game_type` (must be "box" or "balloon"), `level` (1-5)
- Look at response body for detailed error messages

### **Issue 3: 500 Server Error**
**Symptom:** Network shows 500 status  
**Cause:** Backend code error  
**Solution:**  
- Check Laravel log file
- Run backend command: `php artisan migrate` (in case DB is missing)
- Restart `php artisan serve`

### **Issue 4: Network Shows No Request**
**Symptom:** Nothing appears in Network tab  
**Cause:** Click handler not firing  
**Solution:**  
- Check console for JavaScript errors
- Make sure all form fields are filled
- Check if button is actually clickable

### **Issue 5: Response Has No Questions**
**Symptom:** Response succeeds but `response.data.questions` is empty  
**Cause:** Mock data not triggered or API parsing failed  
**Solution:**  
- Check if OpenAI API is configured in `.env`
- Without OpenAI key, it uses mock data - should always work
- If mock not working, there's a code issue

---

## ✅ **SUCCESSFUL TEST CHECKLIST**

When testing works correctly, you should see:

- [ ] Browser Console: No red errors
- [ ] Network Tab: Request shows 200 status
- [ ] Network Response: Contains `success: true` and `questions` array
- [ ] Console logs show all values (prompt, token, etc.)
- [ ] Toast notification: "Questions generated successfully!"
- [ ] Questions appear in the form data

---

## 🎯 **QUICK TEST COMMAND**

Run this in PowerShell to test the backend endpoint directly:

```powershell
cd "c:\Users\Usuario\Desktop\2Pi_Teacher_Dashboard-main - Copy\BackEnd"

# Test if Laravel is working
php artisan tinker
>>> echo "Backend OK";
>>> exit

# Check if the route exists
php artisan route:list | grep generate
```

---

## 📱 **WHAT SHOULD HAPPEN**

1. Fill InitialForm
2. Click "Generate with AI"
3. Right panel opens ← **If this happens, form is okay**
4. Select Level 1 → Boxes → Type prompt
5. Click "Generate" ← **This triggers the API call**
6. Wait 2-3 seconds ← **Network request goes to backend**
7. Questions appear in formData ← **Success!**

---

**Tell me what errors you see, and I'll help fix them!**
