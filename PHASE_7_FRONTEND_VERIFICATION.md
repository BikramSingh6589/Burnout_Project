# Phase 7 Frontend Verification

## What Changed

- The dashboard now reads recommendation cards from `analyticsSummary.recommendations` when `/analytics/summary` returns them.
- The dashboard still falls back to the normal `/recommendations` response if analytics recommendations are unavailable.
- The recommendations page now has an `Active` / `History` switch.
- The `History` view calls `GET /recommendations/history` and displays previous generated recommendations.
- Recommendation history can be filtered by priority, category, and date range.
- Feedback submission refreshes both active recommendations and recommendation history.
- Weekly assessments now generate recommendations.
- Existing initial and weekly assessments are automatically backfilled when recommendations are fetched.
- The recommendation AI prompt now includes structured assessment signals, rule suggestions, sentiment summary, and recent AI-journal snippets.

## How To See The Changes

1. Start the backend:

   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:

   ```bash
   cd frontend
   npm run dev
   ```

3. Open the frontend URL shown by Vite, usually:

   ```text
   http://localhost:5173
   ```

4. Log in as a student. If the account already has previous assessments, open recommendations once to trigger missing recommendation backfill.

5. Open the dashboard:

   ```text
   /dashboard
   ```

   Check the `Active Interventions` section. These cards are now sourced from the dashboard analytics payload when available.

6. Open the recommendations page:

   ```text
   /dashboard/recommendations
   ```

   Use the `Active` and `History` buttons near the top of the page. `History` shows data from `GET /recommendations/history`. Use the filter controls to narrow by priority, category, or date.

## Notes

- Recommendations are generated after assessment submission. Existing initial and weekly assessments are also checked and backfilled when recommendation APIs are called.
- The backend recommendation enhancer uses Groq AI when `GROQ_API_KEY` is configured. If the AI call fails or the key is missing, the rule-based recommendations are used as a fallback.

## AI Recommendation Configuration

Add these to `backend/.env`:

```text
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

Restart the backend after changing `.env`. Then submit a new initial or weekly assessment, or open recommendations to backfill missing recommendation rows for older assessments.

## Phase 7 Status Report

### Completed

- Backend recommendation model exists.
- Rule-based recommendation engine exists.
- Groq AI recommendation enhancer exists.
- AI enhancer uses structured assessment signals, rule suggestions, sentiment summary, and recent journal snippets.
- AI output is JSON-validated and falls back to rules if the model fails or returns invalid data.
- Initial assessment submission generates recommendations.
- Weekly assessment submission generates recommendations.
- Existing initial and weekly assessments are automatically backfilled when recommendation APIs are called.
- Active recommendations come from the newest recommendation batch.
- Recommendation APIs exist for active recommendations, history, and feedback.
- Dashboard analytics includes recommendations.
- Frontend dashboard renders recommendations from the analytics payload.
- Recommendations page has `Active` and `History` views.
- Recommendation history supports priority, category, and date filters.
- Feedback refreshes active recommendations and recommendation history.
- Frontend verification guide exists.
- Backend typecheck passes.
- Frontend production build passes.

### Partially Completed

- AI source visibility is backend-only. The app does not yet display an `AI` or `Rules` badge per recommendation because the data model does not persist a source field.
- Automated tests are still manual-build verified. Typecheck and build pass, but no dedicated unit/integration test files were added.

### Not Completed

- No admin/counselor review workflow exists for approving AI recommendations before students see them.
- No dedicated frontend loading/error message exists specifically for AI generation, because AI generation happens during backend assessment/recommendation API calls.
