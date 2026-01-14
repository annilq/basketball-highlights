# Design: Direct Local Video File Upload Support

## Overview

This document outlines the technical design for adding direct video file upload capabilities to the basketball shot detection feature, bypassing external file storage services like OSS.

## Current Architecture

```
┌─────────────────┐
│   Frontend      │
│ (React/tRPC)    │
└────────┬────────┘
         │ 1. videoUrl (JSON)
         ↓
┌─────────────────┐
│   Backend       │
│  (Hono/tRPC)    │
└────────┬────────┘
         │ 2. Fetch video from URL
         ↓
┌─────────────────┐
│   Backend       │
│  (tRPC router)  │
└────────┬────────┘
         │ 3. Upload video (blob)
         ↓
┌─────────────────┐
│ Python Service  │
│ (FastAPI/YOLO)  │
└────────┬────────┘
         │ 4. Shot detection results
         ↓
    Display UI
```

## Proposed Architecture

```
┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │   Frontend      │
│  (URL mode)     │      │  (File mode)    │
└────────┬────────┘      └────────┬────────┘
         │ videoUrl (JSON)         │ FormData upload
         ↓                        ↓
┌─────────────────┐      ┌─────────────────┐
│ Backend tRPC    │      │ Backend REST    │
│ detectShotsByUrl│      │ detectShotsByFile│
└────────┬────────┘      └────────┬────────┘
         │                        │
         ↓                        ↓
┌─────────────────────────────────────┐
│         Python Service               │
│    /detect-shots (UploadFile)       │
└─────────────────┬───────────────────┘
                  │ 5. Shot detection results
                  ↓
              Display UI
```

## Technical Approach

### 1. Backend API Design

#### 1.1 New REST Endpoint

**File**: `apps/api/routes/shotDetectionUpload.ts`

```typescript
import { hc } from "hono/client";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const uploadSchema = z.object({
  video: z.custom<File>((val) => val instanceof File),
});

export const uploadRoute = app.post("/api/shot-detection/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Invalid file type" }, 400);
    }

    // Validate file size
    const maxSize = parseInt(process.env.MAX_UPLOAD_SIZE || "524288000"); // 500MB
    if (file.size > maxSize) {
      return c.json({ error: "File too large" }, 413);
    }

    // Stream to Python service
    const pythonServiceUrl =
      process.env.PYTHON_SERVICE_URL || "http://localhost:8000/detect-shots";
    const pythonFormData = new FormData();
    pythonFormData.append("video", file);

    const pythonResponse = await fetch(pythonServiceUrl, {
      method: "POST",
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      return c.json({ error: `Python service error: ${errorText}` }, 500);
    }

    const result = await pythonResponse.json();
    return c.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});
```

#### 1.2 Registration in Main App

**File**: `apps/api/lib/app.ts`

```typescript
import { uploadRoute } from "../routes/shotDetectionUpload";

// Register alongside existing tRPC router
app.route("/api/shot-detection", uploadRoute);
```

### 2. Frontend Query Design

#### 2.1 File Upload Mutation

**File**: `apps/app/lib/queries/shot-detection.ts`

```typescript
import { useMutation } from "@tanstack/react-query";

export interface DetectShotsByFileInput {
  videoFile: File;
  onProgress?: (progress: number) => void;
}

export function useDetectShotsByFileMutation() {
  return useMutation<ShotDetectionResult, Error, DetectShotsByFileInput>({
    mutationFn: async ({ videoFile, onProgress }) => {
      const formData = new FormData();
      formData.append("video", videoFile);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        // Track upload progress
        if (onProgress) {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              onProgress(progress);
            }
          });
        }

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(
                xhr.responseText,
              ) as ShotDetectionResult;
              resolve(result);
            } catch (error) {
              reject(new Error("Invalid response format"));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.open("POST", "/api/shot-detection/upload");
        xhr.send(formData);
      });
    },
  });
}
```

#### 2.2 File Validation Helper

```typescript
export interface FileValidationError {
  valid: boolean;
  error?: string;
}

export function validateVideoFile(file: File): FileValidationError {
  // Check file type
  const allowedTypes = [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload MP4, MOV, or AVI files.`,
    };
  }

  // Check file size (500MB default)
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large (${sizeMB}MB). Maximum size is 500MB.`,
    };
  }

  // Check minimum size (100KB to prevent empty files)
  const minSize = 100 * 1024; // 100KB
  if (file.size < minSize) {
    return {
      valid: false,
      error: "File is too small. Please upload a valid video file.",
    };
  }

  return { valid: true };
}
```

### 3. Frontend UI Design

#### 3.1 Component Structure

**File**: `apps/app/routes/(app)/shot-detection.tsx`

```tsx
function ShotDetectionPage() {
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileError, setFileError] = useState<string | null>(null);

  const detectShotsByUrlMutation = useDetectShotsMutation();
  const detectShotsByFileMutation = useDetectShotsByFileMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setFileError(validation.error || "Invalid file");
      setSelectedFile(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
  };

  const handleFileUpload = () => {
    if (!selectedFile) return;

    detectShotsByFileMutation.mutate(
      { videoFile: selectedFile, onProgress: setUploadProgress },
      {
        onSuccess: (data) => {
          // Handle success
        },
        onError: (error) => {
          // Handle error
        },
      },
    );
  };

  return (
    <div>
      {/* Mode toggle */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={uploadMode === "url" ? "default" : "outline"}
          onClick={() => setUploadMode("url")}
        >
          URL Upload
        </Button>
        <Button
          variant={uploadMode === "file" ? "default" : "outline"}
          onClick={() => setUploadMode("file")}
        >
          File Upload
        </Button>
      </div>

      {uploadMode === "url" && (
        // Existing URL upload form
        <form onSubmit={handleUrlSubmit}>
          <Input name="videoUrl" type="url" placeholder="https://..." />
          <Button type="submit">Detect Shots</Button>
        </form>
      )}

      {uploadMode === "file" && (
        // New file upload form
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* File input */}
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <Label htmlFor="videoFile" className="cursor-pointer">
                  <p className="text-lg font-medium">Click to upload</p>
                  <p className="text-sm text-muted-foreground">
                    or drag and drop your video here
                  </p>
                </Label>
                <Input
                  id="videoFile"
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  MP4, MOV, AVI up to 500MB
                </p>
              </div>

              {/* Selected file info */}
              {selectedFile && (
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {/* Error message */}
              {fileError && (
                <div className="text-destructive text-sm">{fileError}</div>
              )}

              {/* Upload progress */}
              {uploadProgress > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || detectShotsByFileMutation.isPending}
                className="w-full"
              >
                {detectShotsByFileMutation.isPending ? (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Film className="mr-2 h-4 w-4" />
                    Detect Shots
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## Design Decisions

### 1. REST Endpoint vs. tRPC for File Upload

**Decision**: Use REST endpoint for file uploads, keep tRPC for URL uploads

**Rationale**:

- tRPC has limited native support for file uploads
- `multipart/form-data` handling in tRPC requires custom middleware or third-party packages
- REST endpoint is simpler, more reliable, and follows HTTP standards
- Keeps existing tRPC functionality unchanged (backward compatible)

**Trade-offs**:

- Slightly less type safety for file upload endpoint
- Two different API patterns (tRPC + REST)
- Simplified implementation outweighs the trade-offs

### 2. Streaming vs. Buffering

**Decision**: Stream files directly to Python service without buffering

**Rationale**:

- Reduces memory usage on Node.js backend
- Supports larger file uploads
- Faster for users (upload starts immediately)
- Python service already handles temporary file storage

**Implementation**:

- Backend uses `FormData` from incoming request
- Streams directly to Python service via `fetch`
- No intermediate storage on backend server

### 3. XMLHttpRequest vs. Fetch for Progress Tracking

**Decision**: Use XMLHttpRequest for upload progress

**Rationale**:

- `fetch` API doesn't support upload progress tracking
- `XMLHttpRequest` is well-supported and stable
- Can easily wrap in Promise for modern async/await usage

**Alternative**:

- Could use `axios` with progress config
- XMLHttpRequest is lighter weight for single feature

### 4. Client-Side vs. Server-Side File Validation

**Decision**: Both client-side and server-side validation

**Rationale**:

- Client-side: Immediate feedback, better UX, reduces unnecessary uploads
- Server-side: Security, validates actual file (not just extension), enforces limits

**Validation Points**:

- Client: MIME type, file size, minimum size
- Server: MIME type, file size, file signature (magic bytes)

## Security Considerations

### 1. File Type Validation

- Validate MIME type (not just extension)
- Check file signature/magic bytes for extra security
- Whitelist allowed types (MP4, MOV, AVI)

### 2. File Size Limits

- Enforce maximum size (500MB default)
- Configurable via environment variable
- Return 413 (Payload Too Large) status

### 3. Resource Limits

- Rate limiting to prevent abuse
- Memory limits on Python service
- Timeout configurations for uploads

### 4. Input Sanitization

- Sanitize file names (prevent path traversal)
- Validate file content (prevent malicious payloads)
- Don't trust client-provided metadata

## Performance Considerations

### 1. Upload Speed

- Direct streaming to Python service
- No intermediate storage reduces latency
- Progress indicators keep users informed

### 2. Memory Usage

- Streaming approach minimizes memory footprint
- Python service uses temp files for processing
- Backend doesn't buffer entire file

### 3. Timeout Handling

- Configurable timeouts for uploads
- Graceful error handling for slow uploads
- Retry logic for transient failures

## Error Handling

### 1. Client-Side Errors

| Error Type        | Message                                                      | Action                           |
| ----------------- | ------------------------------------------------------------ | -------------------------------- |
| Invalid file type | "Invalid file type. Please upload MP4, MOV, or AVI files."   | Show error in UI, prevent upload |
| File too large    | "File too large (X MB). Maximum size is 500MB."              | Show error, prevent upload       |
| File too small    | "File is too small. Please upload a valid video file."       | Show error, prevent upload       |
| Network error     | "Network error during upload. Please check your connection." | Show error, allow retry          |
| Upload timeout    | "Upload timed out. Please try again."                        | Show error, allow retry          |

### 2. Server-Side Errors

| Status Code | Scenario                              | Response                       |
| ----------- | ------------------------------------- | ------------------------------ |
| 400         | Invalid request (no file, wrong type) | JSON error with message        |
| 413         | File too large                        | JSON error with message        |
| 500         | Python service error                  | Generic error, check logs      |
| 503         | Service unavailable                   | Error message, retry suggested |

### 3. Python Service Errors

| Scenario              | Action                                                |
| --------------------- | ----------------------------------------------------- |
| Invalid video format  | Return error to frontend, show user-friendly message  |
| Processing timeout    | Return 504 Gateway Timeout, suggest retry             |
| Model loading failure | Return 500 Internal Server Error, log detailed error  |
| Out of memory         | Return 507 Insufficient Storage, suggest smaller file |

## Testing Strategy

### 1. Unit Tests

- File validation helper (`validateVideoFile`)
- Error message formatting
- Progress calculation

### 2. Integration Tests

- REST endpoint with mock file uploads
- Backend → Python service communication
- Error handling for various scenarios

### 3. End-to-End Tests

- Complete user flow: file selection → upload → results
- Error scenarios: invalid files, network failures, service downtime
- UI responsiveness during upload

### 4. Performance Tests

- Large file uploads (500MB)
- Concurrent uploads (multiple users)
- Memory usage during streaming

## Future Enhancements (Out of Scope)

1. **User Authentication**: Track uploads per user, add upload quotas
2. **Batch Processing**: Upload multiple files for batch analysis
3. **Resume Support**: Resume interrupted uploads
4. **WebSocket Progress**: Real-time progress updates from Python service
5. **File Storage**: Optionally store uploaded files for later retrieval
6. **Video Compression**: Client-side compression before upload
7. **Thumbnail Generation**: Show preview thumbnails of uploaded videos
8. **Upload Queue**: Queue system for high-load scenarios

## Migration Path

### Phase 1: Initial Release (This proposal)

- File upload feature
- Basic validation
- Progress tracking
- Error handling

### Phase 2: Future Enhancements

- User authentication
- Upload history
- Quotas and limits
- Batch uploads

### Phase 3: Advanced Features

- Resume support
- Compression
- Preview thumbnails
- Advanced analytics
