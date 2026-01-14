# Tasks: Add Direct Local Video File Upload Support

**Change ID**: add-local-video-upload
**Total Estimated Time**: 10-14 hours
**Status**: Draft

## Phase 1: Preparation & Analysis (1 hour)

- [ ] **1.1** Research tRPC file upload patterns and limitations
  - Validation: Document findings about tRPC FormData support and recommended approaches
  - Dependencies: None
  - Notes: Determine if tRPC can handle file uploads or if REST endpoint is needed

- [ ] **1.2** Review Python service upload implementation
  - File: `apps/shot-detector/app.py`
  - Validation: Confirm `/detect-shots` endpoint works with `UploadFile`
  - Dependencies: None
  - Notes: Verify no changes needed to Python service

- [ ] **1.3** Confirm backend routing and middleware setup
  - File: `apps/api/lib/app.ts`
  - Validation: Understand how to add REST endpoint alongside tRPC
  - Dependencies: None
  - Notes: Identify where to add `/api/shot-detection/upload` route

## Phase 2: Backend API Implementation (3-4 hours)

- [ ] **2.1** Create REST endpoint for file upload
  - File: `apps/api/routes/shotDetectionUpload.ts` (new)
  - Validation: Endpoint accepts multipart/form-data, validates file type and size
  - Dependencies: 1.3
  - Notes: Use Hono's `multipart` handler or create custom middleware

- [ ] **2.2** Implement file streaming to Python service
  - File: `apps/api/routes/shotDetectionUpload.ts`
  - Validation: File is streamed to Python service without buffering entire file in memory
  - Dependencies: 2.1
  - Notes: Use `fetch` with FormData from backend to Python service

- [ ] **2.3** Add error handling for upload failures
  - File: `apps/api/routes/shotDetectionUpload.ts`
  - Validation: Returns appropriate error codes (400 for bad request, 413 for too large, 500 for service errors)
  - Dependencies: 2.2
  - Notes: Handle network failures, Python service unavailability, invalid files

- [ ] **2.4** Register new REST endpoint in app
  - File: `apps/api/lib/app.ts`
  - Validation: `/api/shot-detection/upload` route is registered and accessible
  - Dependencies: 2.1
  - Notes: Ensure it doesn't conflict with existing tRPC router

- [ ] **2.5** Add file size limit configuration
  - File: `apps/api/lib/env.ts` (or create config)
  - Validation: Environment variable `MAX_UPLOAD_SIZE` controls limit (default: 500MB)
  - Dependencies: 2.2
  - Notes: Add validation in endpoint to enforce limit

## Phase 3: Frontend Query Implementation (2-3 hours)

- [ ] **3.1** Create new mutation for file upload
  - File: `apps/app/lib/queries/shot-detection.ts`
  - Validation: `useDetectShotsByFileMutation` implemented with FormData upload
  - Dependencies: 2.4
  - Notes: Reuse existing `ShotDetectionResult` type for response

- [ ] **3.2** Add file upload validation helper
  - File: `apps/app/lib/queries/shot-detection.ts` (or separate utils file)
  - Validation: Function validates file type (mp4, mov, avi) and size
  - Dependencies: None
  - Notes: Return user-friendly error messages for invalid files

- [ ] **3.3** Add upload progress tracking (optional but recommended)
  - File: `apps/app/lib/queries/shot-detection.ts`
  - Validation: Mutation reports upload progress (0-100%) if supported
  - Dependencies: 3.1
  - Notes: Use `axios` with progress config or XMLHttpRequest if needed

- [ ] **3.4** Export new mutation and types
  - File: `apps/app/lib/queries/shot-detection.ts`
  - Validation: Types and mutation are properly exported for use in components
  - Dependencies: 3.1
  - Notes: Ensure backward compatibility with URL-based mutation

## Phase 4: Frontend UI Implementation (3-4 hours)

- [ ] **4.1** Add file upload component to shot detection page
  - File: `apps/app/routes/(app)/shot-detection.tsx`
  - Validation: File input is visible and functional
  - Dependencies: 3.4
  - Notes: Add button or drag-drop area for file selection

- [ ] **4.2** Add file type and size validation UI feedback
  - File: `apps/app/routes/(app)/shot-detection.tsx`
  - Validation: User sees clear error message for invalid files
  - Dependencies: 3.2, 4.1
  - Notes: Show supported formats and max size in UI

- [ ] **4.3** Add upload progress indicator
  - File: `apps/app/routes/(app)/shot-detection.tsx`
  - Validation: Progress bar or percentage displays during upload
  - Dependencies: 3.3, 4.1
  - Notes: Update state as upload progresses

- [ ] **4.4** Display selected file information
  - File: `apps/app/routes/(app)/shot-detection.tsx`
  - Validation: User sees filename, file size before upload
  - Dependencies: 4.1
  - Notes: Show icon or thumbnail if possible

- [ ] **4.5** Update error handling for file upload failures
  - File: `apps/app/routes/(app)/shot-detection.tsx`
  - Validation: Appropriate error messages for network failures, timeouts, invalid files
  - Dependencies: 2.3, 4.1
  - Notes: Differentiate between client-side and server-side errors

- [ ] **4.6** Ensure existing URL upload still works (if keeping both methods)
  - File: `apps/app/routes/(app)/shot-detection.tsx`
  - Validation: URL input and file upload both functional
  - Dependencies: 4.1
  - Notes: Add UI toggle or tabs to switch between URL and file upload

## Phase 5: Testing (1-2 hours)

- [ ] **5.1** Test file upload with valid video files
  - File: Various test videos (small, medium, large)
  - Validation: Upload succeeds, results return correctly
  - Dependencies: All previous tasks
  - Notes: Test different video formats (mp4, mov, avi)

- [ ] **5.2** Test file size limit enforcement
  - File: Large test video (>500MB or configured limit)
  - Validation: Upload rejected with clear error message
  - Dependencies: 2.5, 3.2
  - Notes: Verify 413 status code from backend

- [ ] **5.3** Test invalid file type rejection
  - File: Non-video files (pdf, jpg, txt)
  - Validation: Client-side validation rejects file, or server returns error
  - Dependencies: 3.2
  - Notes: Test MIME type spoofing attempts

- [ ] **5.4** Test error scenarios
  - File: Various failure modes (network timeout, Python service down, malformed video)
  - Validation: User sees helpful error messages
  - Dependencies: 2.3, 4.5
  - Notes: Test graceful degradation

- [ ] **5.5** Test concurrent uploads (optional)
  - File: Multiple simultaneous upload attempts
  - Validation: System handles concurrent requests without issues
  - Dependencies: 2.2
  - Notes: Verify no memory leaks or crashes

- [ ] **5.6** Test mobile responsive design
  - File: Mobile browser or responsive design tools
  - Validation: File upload works on mobile devices
  - Dependencies: 4.1
  - Notes: Test touch interactions and file picker on mobile

## Phase 6: Validation & Cleanup (1 hour)

- [ ] **6.1** Run linter and fix any issues
  - Command: `bun lint`
  - Validation: Zero warnings related to new code
  - Dependencies: All implementation tasks
  - Notes: Follow project code style conventions

- [ ] **6.2** Run type checker and fix any errors
  - Command: `bun typecheck`
  - Validation: Zero TypeScript errors
  - Dependencies: 6.1
  - Notes: Ensure proper typing for FormData, File objects, and responses

- [ ] **6.3** Run tests and ensure all pass
  - Command: `bun test`
  - Validation: All existing tests still pass, new tests pass
  - Dependencies: All testing tasks
  - Notes: Add unit tests for new mutations and API endpoints

- [ ] **6.4** Document environment configuration
  - File: Add to AGENTS.md or create README
  - Validation: `MAX_UPLOAD_SIZE` and `PYTHON_SERVICE_URL` documented
  - Dependencies: 2.5
  - Notes: Include example values and configuration instructions

- [ ] **6.5** Manual end-to-end testing
  - Action: Upload a real basketball video file and verify detection works
  - Validation: Complete flow from file selection → upload → results display
  - Dependencies: All previous tasks
  - Notes: Verify results match URL-based upload behavior

---

## Dependencies & Parallelization

**Critical Path**:
1.1 → 2.1 → 2.2 → 2.3 → 2.4 → 3.1 → 4.1 → 4.3 → 4.6
2.5 → 4.2

**Can be done in parallel**:

- 1.2 (Python review) with 1.1 (tRPC research)
- 3.2 (validation helper) with 3.1 (mutation implementation)
- 4.2-4.5 (UI features) can proceed in parallel once 4.1 is done
- 5.2-5.6 (testing tasks) can be parallelized

**Blocking tasks**:

- 2.4 (register endpoint) blocks 3.1 (frontend query)
- 3.1 (mutation) blocks all UI implementation (Phase 4)
- 6.1-6.3 (validation) must wait for all implementation

## Notes & Assumptions

- **Assumption**: Python service at `http://localhost:8000/detect-shots` is running and accessible
- **Assumption**: Default file size limit of 500MB is acceptable; can be adjusted via environment variable
- **Note**: If tRPC file upload proves viable, REST endpoint can be replaced in future iteration
- **Note**: File upload progress is optional but recommended for better UX with large files
- **Note**: Consider adding user authentication/authorization in future iterations if uploads need to be tracked per user
- **Assumption**: Video files are valid and not corrupted; service should handle gracefully if they're not

## Success Criteria Validation

- [ ] Users can select and upload local video files
- [ ] File upload bypasses OSS/file servers (direct stream to Python service)
- [ ] UI shows upload progress and file information
- [ ] File type validation prevents invalid uploads
- [ ] File size limits prevent abuse
- [ ] Error handling covers network issues, invalid files, and service failures
- [ ] Existing URL-based upload continues to work (if keeping both)
- [ ] Tests cover new file upload flow
- [ ] Type checking passes with no errors
