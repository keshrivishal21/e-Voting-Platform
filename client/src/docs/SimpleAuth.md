# ✅ Simple Token-Only Authentication System

## 🎯 **Exactly What You Asked For**

Super simple authentication that only stores:
- `studentToken` for students
- `candidateToken` for candidates  
- `currentUserType` to track which user is active

That's it! No complex session management, no user data storage.

## 🔑 **Storage Structure**
```javascript
localStorage: {
  "studentToken": "eyJhbGciOiJIUzI1NiIs...",    // Only if student logged in
  "candidateToken": "eyJhbGciOiJIUzI1NiIs...",  // Only if candidate logged in
  "currentUserType": "Student"                    // Current active role
}
```

## 🚀 **How It Works**

### Login Process:
```javascript
// Student login
login(token, 'Student')  // Stores studentToken + sets currentUserType

// Candidate login  
login(token, 'Candidate') // Stores candidateToken + sets currentUserType
```

### Route Protection:
```javascript
// Routes automatically check currentUserType and matching token
<ProtectedRoute requiredRole="Student">
  <StudentHome />
</ProtectedRoute>
```

### API Calls:
```javascript
// Automatically uses correct token based on currentUserType
const token = AuthAPI.getCurrentToken();
// Returns studentToken or candidateToken based on current user
```

## 📋 **Available Functions**

```javascript
const { 
  isAuthenticated,     // true/false
  userType,           // 'Student', 'Candidate', or null
  login,              // login(token, type)
  logout,             // Clear all tokens
  getCurrentToken,    // Get token for current user
  hasSessionFor,      // Check if user has token for role
  isStudent,          // Check if current user is student
  isCandidate,        // Check if current user is candidate
} = useAuth();
```

## 🔒 **Security Benefits**

- ✅ Minimal localStorage usage
- ✅ No sensitive data stored
- ✅ Role-based token isolation
- ✅ Simple and secure
- ✅ No complex session management

Perfect for your role-based routing needs! 🎯