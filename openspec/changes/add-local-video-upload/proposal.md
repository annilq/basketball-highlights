# Proposal: Add Direct Local Video File Upload Support

**Status:** Draft
**Author:** AI Assistant
**Created:** 2026-01-14

## Summary

Add support for uploading local video files directly from the user's device to the backend shot detection service, bypassing external file storage services like OSS. This provides a more streamlined user experience and reduces infrastructure complexity.

## Motivation

Currently, the shot detection feature only accepts a video URL, which requires users to:

1. Have their video hosted on a publicly accessible URL
2. Rely on external file hosting or upload to a file server first
3. Experience additional latency from the URL → backend → Python service flow

The requested change allows users to:

1. Select a video file directly from their device
2. Upload it directly to the backend without intermediate storage
3. Get faster results with a simpler workflow

This aligns with the product goal of providing easy-to-use basketball video analysis tools for content creators who likely have local video files.

## Proposed Change

### Frontend Changes (`apps/app/routes/(app)/shot-detection.tsx`)

1. **Add file upload UI**:
   - Replace or supplement the URL input with a file upload component
   - Support drag-and-drop functionality
   - Display file name, size, and progress during upload
   - Add file type validation (mp4, mov, avi, etc.)
   - Add file size limits (e.g., 500MB max)

2. **Update mutation logic**:
   - Modify `useDetectShotsMutation` to handle file uploads
   - Send video file as `FormData` instead of JSON with URL
   - Display upload progress if available

### Frontend Query Changes (`apps/app/lib/queries/shot-detection.ts`)

1. **New mutation type**: Add `DetectShotsInput` variant for file upload
2. **File upload handler**: Implement `FormData` upload logic
3. **Progress tracking**: Optionally add upload progress support

### Backend API Changes (`apps/api/`)

**Option A: Extend existing tRPC router** (Preferred)

- Modify `apps/api/routers/shotDetection.ts` to accept both URL and file inputs
- Add tRPC input validation for file uploads
- Handle multipart/form-data requests

**Option B: Create new REST endpoint**

- Create dedicated `/api/shot-detection/upload` endpoint
- Handle file upload with streaming
- Keep existing URL-based endpoint unchanged

### Backend → Python Service Communication

The Python service (`apps/shot-detector/app.py`) already supports file uploads via `UploadFile`. The backend changes should:

1. Stream the uploaded file from the client to the Python service
2. Avoid storing the file on the Node.js backend
3. Pass file directly as `FormData` or blob to Python service

## Success Criteria

- [ ] Users can select and upload local video files
- [ ] File upload bypasses OSS/file servers (direct stream to Python service)
- [ ] UI shows upload progress and file information
- [ ] File type validation prevents invalid uploads
- [ ] File size limits prevent abuse
- [ ] Error handling covers network issues, invalid files, and service failures
- [ ] Existing URL-based upload continues to work
- [ ] Tests cover new file upload flow
- [ ] Type checking passes with no errors

## Related Work

- **Current implementation**: URL-based upload in `apps/app/routes/(app)/shot-detection.tsx`
- **Python service**: Already supports file uploads at `/detect-shots` endpoint
- **Backend router**: `apps/api/routers/shotDetection.ts` uses `videoUrl` input
- **Query layer**: `apps/app/lib/queries/shot-detection.ts` uses JSON fetch API

## Risks & Mitigations

| Risk                                    | Mitigation                                                     |
| --------------------------------------- | -------------------------------------------------------------- |
| Large file uploads timeout              | Implement upload progress, reasonable size limits, streaming   |
| tRPC multipart form handling complexity | Consider REST endpoint as fallback if tRPC is problematic      |
| Memory issues with large files          | Stream files through to Python service, don't buffer in memory |
| File type spoofing                      | Validate MIME type and file signature, not just extension      |
| Concurrent uploads overwhelm service    | Add rate limiting or queue system if needed                    |

## Alternatives Considered

1. **Continue requiring URL input**: Rejected - poor UX, adds friction for users with local files
2. **Upload to OSS first, then process**: Rejected - adds unnecessary infrastructure, user explicitly wants direct upload
3. **Client-side video processing**: Rejected - YOLO model requires Python/ML infrastructure, not feasible in browser
4. **Websocket-based streaming**: Rejected - overly complex for this use case, HTTP multipart is sufficient

## Technical Design Notes

### File Upload Flow

```
User Device (Browser)
    ↓ [Select file]
Frontend (React)
    ↓ [FormData upload]
Backend (Hono/tRPC)
    ↓ [Stream to Python]
Python Service (FastAPI)
    ↓ [Process with YOLO]
Shot Detection Results
    ↓ [Return JSON]
Frontend Display Results
```

### Implementation Options

**Option A: Single mutation with union type**

```typescript
input: z.union([
  z.object({ videoUrl: z.string().url() }),
  z.object({ videoFile: z.instanceof(File) }),
]);
```

**Option B: Separate mutations**

```typescript
detectShotsByUrl: publicProcedure.input(
  z.object({ videoUrl: z.string().url() }),
);
detectShotsByFile: publicProcedure.input(
  z.object({ videoFile: z.custom<File>() }),
);
```

**Option C: REST endpoint for files**

```typescript
// Keep tRPC for URL uploads
// Add REST /api/shot-detection/upload for file uploads
```

### tRPC File Upload Limitations

tRPC has limited support for file uploads. Common approaches:

1. Use tRPC for metadata + REST for file upload
2. Use base64 encoding (not recommended for large files)
3. Use tRPC with custom middleware to handle FormData

Recommendation: Use **Option C** (REST endpoint) for file uploads to avoid tRPC complexities, while keeping URL-based uploads in tRPC for type safety and consistency.

## Open Questions

1. Should we support both URL and file upload simultaneously, or file upload only?
2. What is the maximum file size limit? (Recommended: 500MB-1GB)
3. Should we add user authentication/authorization for uploads?
4. Do we need to track upload history for users?
5. Should we add upload progress indicators on the UI?
