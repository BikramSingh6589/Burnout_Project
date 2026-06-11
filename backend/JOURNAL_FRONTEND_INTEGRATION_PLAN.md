# Journal Module Frontend Integration Plan

## Overview
This document outlines the implementation plan for integrating the new Groq AI-powered Journal Module with the existing frontend application.

## Current State Analysis

### Existing Journal Feature
- **File:** `frontend/src/pages/Journal.tsx`
- **API Endpoint:** `/api/journal` (MoodJournal - keyword-based sentiment)
- **Store:** `useStore.ts` - `fetchJournalEntries()`, `addJournalEntry()`, `deleteJournalEntry()`
- **Navbar:** Already has Journal link for authenticated students (lines 119-128)

### New Journal Module
- **API Endpoint:** `/api/journal-ai` (Groq AI sentiment)
- **Model:** Journal (simpler schema: studentId, content, sentiment, timestamps)
- **Sentiment:** AI-powered via Groq API (positive/negative/neutral)

## Integration Strategy

### Approach: Create Separate AI Journal Feature
**Rationale:** Per project rules - "DO NOT remove any existing feature"

The existing MoodJournal (keyword-based sentiment) will remain functional. A new AI-powered journal will be added alongside it.

---

## Implementation Steps

### Step 1: Update Store State Management

**File:** `frontend/src/store/useStore.ts`

**Add new state and actions:**

```typescript
// Add to AppState interface
journalAiEntries: JournalAiEntry[];
fetchJournalAiEntries: () => Promise<void>;
addJournalAiEntry: (content: string) => Promise<void>;
deleteJournalAiEntry: (id: string) => Promise<void>;

// Add new type
export interface JournalAiEntry {
  id: string;
  studentId: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  createdAt: string;
  updatedAt: string;
}
```

**Implement new actions:**

```typescript
fetchJournalAiEntries: async () => {
  const token = get().authToken ?? getStoredAuthToken();
  if (!token) return;
  try {
    const response = await apiRequest<{
      success: boolean;
      data: any[];
    }>('/journal-ai', { token });
    const mapped = response.data.map((j) => ({
      id: j._id,
      studentId: j.studentId,
      content: j.content,
      sentiment: j.sentiment,
      createdAt: j.createdAt,
      updatedAt: j.updatedAt,
    }));
    set({ journalAiEntries: mapped });
  } catch (err) {
    console.error('[Store] Failed to fetch AI journal entries:', err);
  }
},

addJournalAiEntry: async (content) => {
  const token = get().authToken ?? getStoredAuthToken();
  if (!token) return;
  try {
    await apiRequest('/journal-ai', {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    });
    await get().fetchJournalAiEntries();
  } catch (err) {
    console.error('[Store] Failed to add AI journal entry:', err);
  }
},

deleteJournalAiEntry: async (id) => {
  const token = get().authToken ?? getStoredAuthToken();
  if (!token) return;
  try {
    await apiRequest(`/journal-ai/${id}`, {
      method: 'DELETE',
      token,
    });
    await get().fetchJournalAiEntries();
  } catch (err) {
    console.error('[Store] Failed to delete AI journal entry:', err);
  }
},
```

**Update initialization:**
- Add `fetchJournalAiEntries()` to login, loginWithGoogle, verifyOtp, fetchMe functions

---

### Step 2: Create AI Journal Page Component

**File:** `frontend/src/pages/JournalAI.tsx`

**Component Structure:**
- Similar layout to existing Journal.tsx
- Use new store actions: `journalAiEntries`, `addJournalAiEntry`, `deleteJournalAiEntry`
- Call `/api/journal-ai` endpoints
- Display AI-powered sentiment badges (positive/negative/neutral)
- Character counter (10-2000 chars)
- Loading state during Groq API call
- Error handling for API failures

**Key Features:**
- Textarea with character limit (10-2000)
- Real-time character count
- Submit button with loading state
- Sentiment badge (color-coded: green for positive, red for negative, gray for neutral)
- Timeline view of entries (newest first)
- Delete button with confirmation
- Privacy banner (same as existing journal)

---

### Step 3: Update Navbar

**File:** `frontend/src/components/Navbar.tsx`

**Add new navigation link:**

**Desktop Navigation (around line 128):**
```typescript
{isAuthenticated && user?.role === 'student' && (
  <>
    <Link
      to="/journal"
      className={`transition-colors duration-200 hover:text-primary ${
        isLinkActive('/journal') ? 'text-primary border-b-2 border-primary py-5' : 'text-text-secondary'
      }`}
    >
      Mood Journal
    </Link>
    <Link
      to="/journal-ai"
      className={`transition-colors duration-200 hover:text-primary ${
        isLinkActive('/journal-ai') ? 'text-primary border-b-2 border-primary py-5' : 'text-text-secondary'
      }`}
    >
      AI Journal
    </Link>
  </>
)}
```

**Mobile Menu (around line 366):**
```typescript
{isAuthenticated && user?.role === 'student' && (
  <>
    <Link
      to="/journal"
      onClick={() => setMobileMenuOpen(false)}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isLinkActive('/journal') ? 'bg-primary/10 text-primary' : 'text-text-primary'
      }`}
    >
      Mood Journal
    </Link>
    <Link
      to="/journal-ai"
      onClick={() => setMobileMenuOpen(false)}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isLinkActive('/journal-ai') ? 'bg-primary/10 text-primary' : 'text-text-primary'
      }`}
    >
      AI Journal
    </Link>
  </>
)}
```

**Rename existing link:** Change "Journal" to "Mood Journal" for clarity

---

### Step 4: Add Route Configuration

**File:** `frontend/src/App.tsx`

**Add new route:**
```typescript
import { JournalAI } from './pages/JournalAI';

// Add to routes
<Route path="/journal-ai" element={<JournalAI />} />
```

---

### Step 5: Dashboard Integration (Optional Enhancement)

**File:** `frontend/src/pages/Dashboard.tsx`

**Add AI Journal Summary Card:**
- Show recent AI journal entries (last 3)
- Display sentiment distribution (positive/negative/neutral counts)
- Quick link to full AI Journal page
- Small sparkline or chart showing sentiment trends over time

**Implementation:**
- Add new section in dashboard grid
- Use `journalAiEntries` from store
- Calculate sentiment statistics
- Display with icons and colors matching sentiment

---

### Step 6: Authentication Integration

**Already Handled:**
- JWT authentication is already implemented in the frontend
- All API calls include the token via `apiRequest` helper
- New endpoints use the same authentication middleware
- No changes needed to authentication flow

**Access Control:**
- Both journal features only visible to authenticated students
- Protected by existing `isAuthenticated` check in Navbar
- API endpoints protected by `authenticate` middleware

---

## File Summary

### Files to Create
1. `frontend/src/pages/JournalAI.tsx` - New AI Journal page component

### Files to Modify
1. `frontend/src/store/useStore.ts` - Add AI journal state and actions
2. `frontend/src/components/Navbar.tsx` - Add AI Journal navigation link
3. `frontend/src/App.tsx` - Add AI Journal route

### Files to Keep Unchanged
1. `frontend/src/pages/Journal.tsx` - Existing MoodJournal page (keyword-based)
2. All authentication components
3. All other pages and components

---

## UI/UX Considerations

### Visual Distinction
- **Mood Journal:** Uses keyword-based sentiment, has mood/energy/stress fields
- **AI Journal:** Uses Groq AI sentiment, simpler content-only interface

### Color Coding
- **Positive:** Green/Success colors
- **Negative:** Red/Error colors
- **Neutral:** Gray/Neutral colors

### Loading States
- Show spinner during Groq API call
- Disable submit button during processing
- Display "Analyzing sentiment..." message

### Error Handling
- Display error message if Groq API fails
- Fallback to "neutral" sentiment (handled by backend)
- Retry option for failed submissions

### Character Limits
- Show character count: "X/2000"
- Disable submit if < 10 characters
- Show warning if approaching 2000 limit

---

## Testing Checklist

### Frontend Testing
- [ ] AI Journal page renders correctly
- [ ] Create journal entry with valid content
- [ ] Create journal entry with < 10 chars (should fail)
- [ ] Create journal entry with > 2000 chars (should fail)
- [ ] Display sentiment badge correctly
- [ ] Delete journal entry
- [ ] Navigate to AI Journal from Navbar
- [ ] Mobile menu navigation works
- [ ] Authentication protected (redirects if not logged in)
- [ ] Loading state during API call
- [ ] Error handling for API failures

### Integration Testing
- [ ] Existing Mood Journal still works
- [ ] Both journals accessible from Navbar
- [ ] Store state updates correctly
- [ ] Dashboard integration (if implemented)

---

## Deployment Notes

### Environment Variables
- Ensure `GROQ_API_KEY` is set in backend `.env`
- Frontend requires no new environment variables

### API Compatibility
- New endpoints: `/api/journal-ai`
- Existing endpoints: `/api/journal` (unchanged)
- Both can coexist without conflicts

### Database
- New collection: `journals`
- Existing collection: `moodJournals` (unchanged)

---

## Future Enhancements

### Potential Features
1. Sentiment trend chart in Dashboard
2. Export journal entries as PDF
3. Search/filter by sentiment
4. Calendar view of entries
5. AI-powered insights based on journal history
6. Integration with burnout prediction model
7. Sentiment-based notifications

### Performance Optimization
- Implement pagination for large journal lists
- Add caching for journal entries
- Debounce API calls during typing
- Lazy load journal history

---

## Conclusion

This integration plan adds the new Groq AI-powered Journal Module as a separate feature alongside the existing MoodJournal, preserving all existing functionality while providing users with an enhanced AI-driven journaling experience.
