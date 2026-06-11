# Feature Implementation Prompt

## ⚠️ IMPORTANT: DO NOT CHANGE EXISTING IMPLEMENTATION

The following features should be implemented on top of the existing Journal Module with Groq AI. Do not modify the current implementation unless explicitly required for these new features.

## Current State

- AI Journal with Groq sentiment analysis is fully implemented
- Mood Journal (keyword-based) is hidden from frontend but backend remains functional
- Delete journal entry functionality is already implemented
- Backend API: POST /api/journal-ai, GET /api/journal-ai, DELETE /api/journal-ai/:id
- Frontend: JournalAI.tsx component with timeline view

## New Features to Implement

### 1. Burnout Trend Analysis

**Objective:** Use sentiment history to identify burnout trends by analyzing consecutive negative entries.

**Example Pattern:**
```
Negative → Negative → Negative → Neutral → Negative → Negative
↓
High Burnout Risk
```

**Implementation Requirements:**

**Backend:**
1. Create new service function in `backend/src/services/journal/journal.service.ts`:
   ```typescript
   export const analyzeBurnoutRisk = async (studentId: string): Promise<{
     riskLevel: 'high' | 'moderate' | 'low';
     negativeRatio: number;
     totalEntries: number;
     negativeEntries: number;
     period: string;
   }>
   ```

2. Logic:
   - Fetch journal entries from last 7 days
   - Calculate negative sentiment ratio
   - Define risk thresholds:
     - High Risk: >70% negative in last 7 days
     - Moderate Risk: 40-70% negative in last 7 days
     - Low Risk: <40% negative in last 7 days

3. Create new controller endpoint in `backend/src/controllers/journal-ai.controller.ts`:
   ```typescript
   export const getBurnoutRisk = async (req: Request, res: Response, next: NextFunction)
   ```

4. Add route in `backend/src/routes/journal-ai.routes.ts`:
   ```
   GET /api/journal-ai/burnout-risk
   ```

**Frontend:**
1. Add action to `frontend/src/store/useStore.ts`:
   ```typescript
   fetchBurnoutRisk: () => Promise<void>;
   ```

2. Display risk level in Dashboard component with visual indicators:
   - High Risk: Red badge/alert
   - Moderate Risk: Yellow badge/warning
   - Low Risk: Green badge/safe

3. Send notifications when risk level increases (integrate with existing notification system)

### 2. Analytics Dashboard

**Objective:** Display comprehensive sentiment analytics with visualizations.

**Required Metrics:**
- Positive Percentage (overall and time-based)
- Negative Percentage (overall and time-based)
- Neutral Percentage (overall and time-based)
- Weekly Mood Trends (line chart)
- Monthly Mood Trends (line chart)

**Implementation Requirements:**

**Backend:**
1. Create new service function in `backend/src/services/journal/journal.service.ts`:
   ```typescript
   export const getJournalAnalytics = async (
     studentId: string,
     startDate?: Date,
     endDate?: Date
   ): Promise<{
     overall: { positive: number; negative: number; neutral: number };
     weeklyTrends: Array<{ week: string; positive: number; negative: number; neutral: number }>;
     monthlyTrends: Array<{ month: string; positive: number; negative: number; neutral: number }>;
   }>
   ```

2. Logic:
   - Calculate sentiment percentages for overall period
   - Aggregate data by week (last 8 weeks)
   - Aggregate data by month (last 12 months)
   - Support custom date range filtering

3. Create new controller endpoint in `backend/src/controllers/journal-ai.controller.ts`:
   ```typescript
   export const getJournalAnalytics = async (req: Request, res: Response, next: NextFunction)
   ```

4. Add route in `backend/src/routes/journal-ai.routes.ts`:
   ```
   GET /api/journal-ai/analytics?startDate=&endDate=
   ```

**Backend API Response Example:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "positive": 35,
      "negative": 45,
      "neutral": 20
    },
    "weeklyTrends": [
      { "week": "2024-01-01", "positive": 30, "negative": 50, "neutral": 20 },
      { "week": "2024-01-08", "positive": 40, "negative": 40, "neutral": 20 }
    ],
    "monthlyTrends": [
      { "month": "2024-01", "positive": 35, "negative": 45, "neutral": 20 }
    ]
  }
}
```

**Frontend:**
1. Install charting library (e.g., Recharts):
   ```bash
   npm install recharts
   ```

2. Add action to `frontend/src/store/useStore.ts`:
   ```typescript
   fetchJournalAnalytics: (startDate?: Date, endDate?: Date) => Promise<void>;
   ```

3. Create new component `frontend/src/pages/JournalAnalytics.tsx`:
   - Pie chart for overall sentiment distribution
   - Line chart for weekly trends
   - Line chart for monthly trends
   - Date range selector (Last 7 days, Last 30 days, Last 90 days, Custom)
   - Summary cards with key metrics
   - Export data functionality (CSV/PDF)

4. Add route in `frontend/src/App.tsx`:
   ```
   /journal-ai/analytics
   ```

5. Add "Analytics" link to `frontend/src/components/Navbar.tsx` (next to AI Journal)

6. Alternatively, add analytics as a tab within the existing JournalAI.tsx component

## Implementation Order

1. **Burnout Trend Analysis** (Priority: High)
   - Backend service and endpoint
   - Frontend store action
   - Dashboard integration
   - Notification integration

2. **Analytics Dashboard** (Priority: Medium)
   - Backend service and endpoint
   - Frontend store action
   - New component with charts
   - Navbar integration

## Testing Checklist

### Burnout Trend Analysis
- [ ] Risk calculation accurate for different sentiment distributions
- [ ] Date range filtering works correctly
- [ ] Risk thresholds match requirements
- [ ] Dashboard displays risk level correctly
- [ ] Notifications trigger on risk level changes

### Analytics Dashboard
- [ ] Overall percentages calculate correctly
- [ ] Weekly trends aggregate by week correctly
- [ ] Monthly trends aggregate by month correctly
- [ ] Date range filters work correctly
- [ ] Charts render with correct data
- [ ] Export functionality works (CSV/PDF)

## Notes

- Reuse existing authentication middleware
- Follow existing error handling patterns
- Use existing Zod validation patterns
- Maintain consistency with existing UI components
- Add TypeScript types for all new functions
- Add logging for debugging
- Test with various data scenarios
