# Academic Burnout Detection API Documentation

## Base URL
`https://burnout-project-q89u.onrender.com`

---

## Authentication
Most endpoints require authentication using a JWT token. The token is obtained by logging in or registering.

### How to Generate a Token
1. Register a new student account (POST /api/auth/register)
2. Verify OTP (POST /api/auth/verify-otp) - OR - Login directly (POST /api/auth/login)
3. The token is returned in the response body as the `token` field

### How to Authenticate
Include the JWT token in the Authorization header using the Bearer scheme:
```
Authorization: Bearer <your_token_here>
```

### Example
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

---

## Endpoints

### 1. Health Check
#### Get Health Status
```http
GET /health
```

**Response (Success - 200):**
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Response (Error - 503):**
```json
{
  "status": "error",
  "database": "disconnected"
}
```

---

### 2. Authentication (Auth)
#### Register a New Student
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "age": 20,
  "gender": "male" | "female" | "other"
}
```

**Password Requirements:**
- At least 8 characters
- At least 1 capital letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

---

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 20,
    "gender": "male"
  }
}
```

*Note: The `token` field contains your Bearer token for authentication.*

---

#### Google Login
```http
POST /api/auth/google
```

**Request Body:**
```json
{
  "token": "google_oauth_token"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 20,
    "gender": "male"
  }
}
```

*Note: The `token` field contains your Bearer token for authentication.*

---

#### Refresh Token
```http
POST /api/auth/refresh-token
```
*Requires refreshToken cookie*

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 20,
    "gender": "male"
  }
}
```

*Note: The `token` field contains your new Bearer token for authentication.*

---

#### Verify OTP
```http
POST /api/auth/verify-otp
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 20,
    "gender": "male"
  }
}
```

*Note: The `token` field contains your Bearer token for authentication.*

---

#### Resend OTP
```http
POST /api/auth/resend-otp
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

---

#### Forgot Password
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

---

#### Reset Password
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

---

#### Logout
```http
POST /api/auth/logout
```
*Requires authentication*

---

#### Get Authenticated Student
```http
GET /api/auth/me
```
*Requires authentication*

---

#### Update Profile
```http
PATCH /api/auth/me
```
*Requires authentication*

**Request Body:**
```json
{
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "age": 21,
  "gender": "male"
}
```

---

### 3. Admin
#### Admin Login
```http
POST /api/admin/login
```

---

#### Get Admin Dashboard
```http
GET /api/admin/dashboard
```
*Requires admin authentication*

---

#### Get All Students
```http
GET /api/admin/students
```
*Requires admin authentication*

---

#### Get High Risk Students
```http
GET /api/admin/high-risk
```
*Requires admin authentication*

---

#### Get Student Detail
```http
GET /api/admin/student/:studentId
```
*Requires admin authentication*

---

#### Send Wellness Email
```http
POST /api/admin/send-email
```
*Requires admin authentication*

---

#### Send Bulk Wellness Email
```http
POST /api/admin/send-bulk-email
```
*Requires admin authentication*

---

### 4. Assessment
#### Submit Assessment
```http
POST /api/assessment
```
*Requires authentication*

**Request Body:**
```json
{
  "stressLevel": 0-10,
  "academicSatisfaction": 0-10,
  "studyHours": 0-24,
  "backlog": 0-10,
  "procrastination": 0-10,
  "motivation": 0-10,
  "energy": 0-10,
  "sleepHours": 0-24,
  "screenTime": 0-24
}
```

---

#### Get Assessment History
```http
GET /api/assessment/history
```
*Requires authentication*

---

#### Get Latest Assessment
```http
GET /api/assessment/latest
```
*Requires authentication*

---

### 5. Initial Assessment
#### Submit Initial Assessment
```http
POST /api/initial-assessment
```
*Requires authentication*

**Request Body:**
```json
{
  "academicPressureScore": 0-100,
  "sleepQualityScore": 0-100,
  "emotionalExhaustionScore": 0-100,
  "cynicismScore": 0-100,
  "efficacyScore": 0-100,
  "socialSupportScore": 0-100,
  "financialStressScore": 0-100
}
```

---

#### Get Initial Assessment
```http
GET /api/initial-assessment
```
*Requires authentication*

---

### 6. Weekly Assessment
#### Submit Weekly Assessment
```http
POST /api/weekly-assessment
```
*Requires authentication*

**Request Body:**
```json
{
  "academicLoadScore": 0-100,
  "stressScore": 0-100,
  "sleepHoursAverage": 0-24,
  "sleepQualityScore": 0-100,
  "moodScore": 0-100,
  "motivationScore": 0-100,
  "concentrationScore": 0-100,
  "physicalFatigueScore": 0-100,
  "stressLevel": 0-10,
  "academicSatisfaction": 0-10,
  "studyHours": 0-24,
  "backlog": 0-10,
  "procrastination": 0-10,
  "motivation": 0-10,
  "energy": 0-10,
  "sleepHours": 0-24,
  "screenTime": 0-24
}
```

---

#### Get Weekly Assessment History
```http
GET /api/weekly-assessment/history
```
*Requires authentication*

---

#### Get Latest Weekly Assessment
```http
GET /api/weekly-assessment/latest
```
*Requires authentication*

---

### 7. Analytics
#### Get Analytics Summary
```http
GET /api/analytics/summary
```
*Requires authentication*

---

### 8. Journal
#### Get Journal Entries
```http
GET /api/journal
```
*Requires authentication*

---

#### Create Journal Entry
```http
POST /api/journal
```
*Requires authentication*

**Request Body:**
```json
{
  "content": "Your journal entry here..."
}
```

---

#### Delete Journal Entry
```http
DELETE /api/journal/:id
```
*Requires authentication*

---

### 9. Journal AI
#### Create Journal Entry (AI Enhanced)
```http
POST /api/journal-ai
```
*Requires authentication*

**Request Body:**
```json
{
  "content": "Your journal entry here..."
}
```

---

#### Get Journal Entries (AI)
```http
GET /api/journal-ai
```
*Requires authentication*

---

#### Get Burnout Risk (From Journal)
```http
GET /api/journal-ai/burnout-risk
```
*Requires authentication*

---

#### Delete Journal Entry (AI)
```http
DELETE /api/journal-ai/:id
```
*Requires authentication*

---

### 10. Recommendations
#### Get Recommendations
```http
GET /api/recommendations
```
*Requires authentication*

---

#### Get Recommendation History
```http
GET /api/recommendations/history
```
*Requires authentication*

---

#### Submit Recommendation Feedback
```http
POST /api/recommendations/:id/feedback
```
*Requires authentication*

---

#### Delete Recommendation
```http
DELETE /api/recommendations/:id
```
*Requires authentication*

---

#### Get Pending AI Recommendations (Admin)
```http
GET /api/recommendations/admin/pending
```
*Requires authentication*

---

#### Approve Recommendation (Admin)
```http
PATCH /api/recommendations/admin/:id/approve
```
*Requires authentication*

---

#### Edit and Approve Recommendation (Admin)
```http
PATCH /api/recommendations/admin/:id/edit-approve
```
*Requires authentication*

---

#### Reject Recommendation (Admin)
```http
DELETE /api/recommendations/admin/:id/reject
```
*Requires authentication*

---

### 11. Notifications
#### Get Notifications
```http
GET /api/notifications
```
*Requires authentication*

---

#### Mark Notification as Read
```http
PATCH /api/notifications/:id/read
```
*Requires authentication*

---

#### Mark All Notifications as Read
```http
POST /api/notifications/read-all
```
*Requires authentication*

---

#### Delete Notification
```http
DELETE /api/notifications/:id
```
*Requires authentication*

---

#### Delete All Notifications
```http
DELETE /api/notifications
```
*Requires authentication*

---

### 12. AI
#### Chat with AI
```http
POST /api/ai/chat
```
*Requires authentication*

---

#### Chat with AI (Stream)
```http
POST /api/ai/chat/stream
```
*Requires authentication*

---

#### Get AI History
```http
GET /api/ai/history
```
*Requires authentication*

---

#### Clear AI History
```http
DELETE /api/ai/clear
```
*Requires authentication*

---

### 13. Settings
#### Get Settings
```http
GET /api/settings
```

---

#### Update Settings
```http
PUT /api/settings
```

---

### 14. Contact
#### Submit Contact Form
```http
POST /api/contact
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here..."
}
```

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Route not found"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

