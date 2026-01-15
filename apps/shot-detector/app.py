import os
import tempfile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from shot_detector_api import ShotDetectorAPI

app = FastAPI(
    title="Basketball Shot Detection API",
    description="API for detecting basketball shots in videos using YOLOv8",
    version="1.0.0"
)


# Initialize detector with pre-trained model
model_path = os.environ.get("MODEL_PATH", "best.pt")
detector = ShotDetectorAPI(model_path)


@app.post("/detect-shots")
async def detect_shots(video: UploadFile = File(...)):
    """Upload a video file to detect basketball shots"""
    try:
        # Save uploaded video to temporary file
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_file:
            content = await video.read()
            temp_file.write(content)
            temp_video_path = temp_file.name

        # Run shot detection
        result = detector.detect_shots(temp_video_path)

        # Clean up temporary file
        os.unlink(temp_video_path)

        return JSONResponse(content=result)

    except Exception as e:
        # Clean up temporary file if it exists
        if 'temp_video_path' in locals():
            try:
                os.unlink(temp_video_path)
            except:
                pass

        raise HTTPException(
            status_code=500, detail=f"Error processing video: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Basketball Shot Detection API",
        "version": "1.0.0",
        "endpoints": {
            "detect_shots": "/detect-shots",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": "2026-01-14"}
