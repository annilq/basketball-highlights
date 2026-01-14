from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import os
import tempfile
from ultralytics import YOLO
import math
from utils import score, detect_down, detect_up, in_hoop_region, clean_hoop_pos, clean_ball_pos, get_device

app = FastAPI(
    title="Basketball Shot Detection API",
    description="API for detecting basketball shots in videos using YOLOv8",
    version="1.0.0"
)

class ShotDetectorAPI:
    def __init__(self, model_path):
        self.model = YOLO(model_path)
        self.class_names = ['Basketball', 'Basketball Hoop']
        self.device = get_device()

    def detect_shots(self, video_path):
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise Exception("Could not open video file")

        ball_pos = []  # array of tuples ((x_pos, y_pos), frame count, width, height, conf)
        hoop_pos = []  # array of tuples ((x_pos, y_pos), frame count, width, height, conf)

        frame_count = 0
        makes = 0
        attempts = 0

        # Used to detect shots (upper and lower region)
        up = False
        down = False
        up_frame = 0
        down_frame = 0

        shot_events = []

        while True:
            ret, frame = cap.read()

            if not ret:
                # End of the video or an error occurred
                break

            results = self.model(frame, stream=True, device=self.device)

            for r in results:
                boxes = r.boxes
                for box in boxes:
                    # Bounding box
                    x1, y1, x2, y2 = box.xyxy[0]
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    w, h = x2 - x1, y2 - y1

                    # Confidence
                    conf = math.ceil((box.conf[0] * 100)) / 100

                    # Class Name
                    cls = int(box.cls[0])
                    current_class = self.class_names[cls]

                    center = (int(x1 + w / 2), int(y1 + h / 2))

                    # Only create ball points if high confidence or near hoop
                    if (conf > .3 or (in_hoop_region(center, hoop_pos) and conf > 0.15)) and current_class == "Basketball":
                        ball_pos.append((center, frame_count, w, h, conf))

                    # Create hoop points if high confidence
                    if conf > .5 and current_class == "Basketball Hoop":
                        hoop_pos.append((center, frame_count, w, h, conf))

            # Clean motion data
            if len(ball_pos) > 0:
                ball_pos = clean_ball_pos(ball_pos, frame_count)

            if len(hoop_pos) > 1:
                hoop_pos = clean_hoop_pos(hoop_pos)

            # Shot detection logic
            if len(hoop_pos) > 0 and len(ball_pos) > 0:
                # Detecting when ball is in 'up' and 'down' area
                if not up:
                    up = detect_up(ball_pos, hoop_pos)
                    if up:
                        up_frame = frame_count

                if up and not down:
                    down = detect_down(ball_pos, hoop_pos)
                    if down:
                        down_frame = frame_count

                # If ball goes from 'up' area to 'down' area in that order, increase attempt and reset
                if frame_count % 10 == 0:
                    if up and down and up_frame < down_frame:
                        attempts += 1
                        up = False
                        down = False

                        # Check if it's a make
                        is_make = score(ball_pos, hoop_pos)
                        if is_make:
                            makes += 1

                        # Record shot event
                        shot_events.append({
                            "frame": frame_count,
                            "is_make": is_make,
                            "attempts": attempts,
                            "makes": makes
                        })

            frame_count += 1

        cap.release()

        # Calculate shooting percentage
        shooting_percentage = (makes / attempts * 100) if attempts > 0 else 0

        return {
            "total_attempts": attempts,
            "total_makes": makes,
            "shooting_percentage": round(shooting_percentage, 2),
            "shot_events": shot_events
        }

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

        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

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
