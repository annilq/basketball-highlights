import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from shot_detector_api import ShotDetectorAPI

app = FastAPI(
    title="Basketball Shot Detection API",
    description="API for detecting basketball shots in videos using YOLOv8",
    version="1.0.0"
)


class DetectShotsRequest(BaseModel):
    video_url: str


class GenerateShotClipRequest(BaseModel):
    video_url: str
    shot_frame: int = 0
    duration: int = 3


class GenerateHighlightsRequest(BaseModel):
    video_url: str
    output_path: str = "highlights.mp4"


# Initialize detector with pre-trained model
model_path = os.environ.get("MODEL_PATH", "best.pt")
detector = ShotDetectorAPI(model_path)


@app.post("/detect-shots")
async def detect_shots(request: DetectShotsRequest):
    """Detect basketball shots from a video URL"""
    try:
        result = detector.detect_shots(request.video_url)
        return JSONResponse(content=result)

    except Exception as e:
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


@app.post("/generate-shot-clip")
async def generate_shot_clip(request: GenerateShotClipRequest):
    """Generate a video clip around a shot frame from a video URL"""
    try:
        clip_path = detector.generate_shot_clip(
            video_path=request.video_url,
            shot_frame=request.shot_frame,
            duration=request.duration
        )

        return {"clip_path": clip_path}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating shot clip: {str(e)}")


@app.post("/generate-highlights")
async def generate_highlights(request: GenerateHighlightsRequest):
    """Generate a highlights video from a video URL"""
    try:
        highlights_path = detector.generate_highlights(
            request.video_url, output_path=request.output_path)

        return {"highlights_path": highlights_path}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating highlights: {str(e)}")
