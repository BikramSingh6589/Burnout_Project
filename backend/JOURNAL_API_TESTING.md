# Journal Module API Testing Guide

## Base URL
```
http://localhost:5001/api/journal-ai
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Create Journal Entry

### Endpoint
```
POST /api/journal-ai
```

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Success Case - Positive Sentiment

**Request Body:**
```json
{
  "content": "I had a great day today! I finished all my assignments early and had time to relax with friends. Feeling productive and happy."
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456ghi789",
    "studentId": "123abc456def789ghi012",
    "content": "I had a great day today! I finished all my assignments early and had time to relax with friends. Feeling productive and happy.",
    "sentiment": "positive",
    "createdAt": "2026-06-11T06:30:00.000Z",
    "updatedAt": "2026-06-11T06:30:00.000Z",
    "__v": 0
  }
}
```

### Success Case - Negative Sentiment

**Request Body:**
```json
{
  "content": "I'm feeling overwhelmed and stressed. Too many deadlines and I can't seem to focus. Everything feels impossible right now."
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456ghi789",
    "studentId": "123abc456def789ghi012",
    "content": "I'm feeling overwhelmed and stressed. Too many deadlines and I can't seem to focus. Everything feels impossible right now.",
    "sentiment": "negative",
    "createdAt": "2026-06-11T06:30:00.000Z",
    "updatedAt": "2026-06-11T06:30:00.000Z",
    "__v": 0
  }
}
```

### Success Case - Neutral Sentiment

**Request Body:**
```json
{
  "content": "Today was a regular day. I went to classes, had lunch, and studied in the evening. Nothing special happened."
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456ghi789",
    "studentId": "123abc456def789ghi012",
    "content": "Today was a regular day. I went to classes, had lunch, and studied in the evening. Nothing special happened.",
    "sentiment": "neutral",
    "createdAt": "2026-06-11T06:30:00.000Z",
    "updatedAt": "2026-06-11T06:30:00.000Z",
    "__v": 0
  }
}
```

### Failure Case - Missing Content

**Request Body:**
```json
{}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Journal content is required"
}
```

### Failure Case - Content Too Short

**Request Body:**
```json
{
  "content": "Too short"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Journal content must be at least 10 characters"
}
```

### Failure Case - Content Too Long

**Request Body:**
```json
{
  "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Journal content must not exceed 2000 characters"
}
```

### Failure Case - No Authentication

**Request Body:**
```json
{
  "content": "Test journal entry"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

---

## 2. Get All Journal Entries

### Endpoint
```
GET /api/journal-ai
```

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Success Case - Multiple Entries

**Request:**
```
GET /api/journal-ai
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "678abc123def456ghi789",
      "studentId": "123abc456def789ghi012",
      "content": "I had a great day today! I finished all my assignments early and had time to relax with friends. Feeling productive and happy.",
      "sentiment": "positive",
      "createdAt": "2026-06-11T06:30:00.000Z",
      "updatedAt": "2026-06-11T06:30:00.000Z",
      "__v": 0
    },
    {
      "_id": "678abc123def456ghi790",
      "studentId": "123abc456def789ghi012",
      "content": "I'm feeling overwhelmed and stressed. Too many deadlines and I can't seem to focus. Everything feels impossible right now.",
      "sentiment": "negative",
      "createdAt": "2026-06-10T18:45:00.000Z",
      "updatedAt": "2026-06-10T18:45:00.000Z",
      "__v": 0
    },
    {
      "_id": "678abc123def456ghi791",
      "studentId": "123abc456def789ghi012",
      "content": "Today was a regular day. I went to classes, had lunch, and studied in the evening. Nothing special happened.",
      "sentiment": "neutral",
      "createdAt": "2026-06-09T12:00:00.000Z",
      "updatedAt": "2026-06-09T12:00:00.000Z",
      "__v": 0
    }
  ]
}
```

**Note:** Entries are sorted by `createdAt` in descending order (newest first).

### Success Case - No Entries

**Request:**
```
GET /api/journal-ai
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": []
}
```

### Failure Case - No Authentication

**Request:**
```
GET /api/journal-ai
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

---

## 3. Delete Journal Entry

### Endpoint
```
DELETE /api/journal-ai/:id
```

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Success Case - Valid ID and Ownership

**Request:**
```
DELETE /api/journal-ai/678abc123def456ghi789
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Journal entry deleted successfully"
}
```

### Failure Case - Invalid ID Format

**Request:**
```
DELETE /api/journal-ai/invalid-id
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid journal ID"
}
```

### Failure Case - Entry Not Found

**Request:**
```
DELETE /api/journal-ai/507f1f77bcf86cd799439011
```

**Expected Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Journal not found or access denied"
}
```

### Failure Case - Access Denied (Different Student)

**Request:**
```
DELETE /api/journal-ai/678abc123def456ghi789
```

**Expected Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Journal not found or access denied"
}
```

**Note:** This occurs when trying to delete a journal entry that belongs to another student.

### Failure Case - No Authentication

**Request:**
```
DELETE /api/journal-ai/678abc123def456ghi789
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

---

## Testing Checklist

### Prerequisites
- [ ] Backend server running on port 5001
- [ ] MongoDB database connected
- [ ] Groq API key configured in `.env`
- [ ] Valid JWT token obtained from login/register endpoint

### Test Cases
- [ ] Create journal with positive sentiment
- [ ] Create journal with negative sentiment
- [ ] Create journal with neutral sentiment
- [ ] Create journal with content < 10 characters (should fail)
- [ ] Create journal with content > 2000 characters (should fail)
- [ ] Create journal without content (should fail)
- [ ] Create journal without authentication (should fail)
- [ ] Get all journals for authenticated user
- [ ] Get journals when no entries exist
- [ ] Get journals without authentication (should fail)
- [ ] Delete own journal entry
- [ ] Delete with invalid ID format (should fail)
- [ ] Delete non-existent entry (should fail)
- [ ] Delete another student's entry (should fail)
- [ ] Delete without authentication (should fail)

### Groq API Fallback Testing
- [ ] Test with `GROQ_API_KEY` not set (should return "neutral" sentiment)
- [ ] Test with invalid Groq API key (should return "neutral" sentiment)
- [ ] Test with network issues (should return "neutral" sentiment)

---

## cURL Examples

### Create Journal
```bash
curl -X POST http://localhost:5001/api/journal-ai \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"I had a great day today!"}'
```

### Get Journals
```bash
curl -X GET http://localhost:5001/api/journal-ai \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Journal
```bash
curl -X DELETE http://localhost:5001/api/journal-ai/JOURNAL_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
