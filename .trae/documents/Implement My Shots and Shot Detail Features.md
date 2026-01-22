## Implementation Plan

### Backend API Changes

1. **Update `shotDetection.ts` router** (`apps/api/routers/shotDetection.ts`):
   - Add `myShots` procedure (query) to fetch all shotDetection records for the current user
   - Add `getShot` procedure (query) to fetch a specific shotDetection record by ID
   - Use existing protectedProcedure to ensure authentication

### Frontend Changes

1. **Update Sidebar Navigation** (`apps/app/components/layout/constants.ts`):
   - Add new sidebar item for "myShots" with appropriate icon and route

2. **Create My Shots Page** (`apps/app/routes/(app)/my-shots.tsx`):
   - Use TanStack Query to fetch user's shot detection records
   - Display records as grid cards with video thumbnails from videoUrl
   - Add click navigation to detail page
   - Implement responsive grid layout (3 cards per row)

3. **Create Shot Detail Page** (`apps/app/routes/(app)/shot-detection/$shotId.tsx`):
   - Use TanStack Query to fetch specific shot detection record by ID from URL params
   - Display same UI as the shotData section in `shot-detection.tsx`
   - Show detection stats and shot events timeline

4. **Update Query Hooks** (`apps/app/lib/queries/shot-detection.ts`):
   - Add `useMyShotsQuery` hook for fetching user's shot records
   - Add `useGetShotQuery` hook for fetching a specific shot record

### Implementation Details

- Follow existing code patterns and UI styling
- Use the same card components from `@repo/ui`
- Ensure proper error handling and loading states
- Maintain consistent i18n usage

### Testing

- Verify API endpoints work correctly
- Test frontend pages with mock data
- Ensure navigation between pages works properly
- Check responsive design for different screen sizes
