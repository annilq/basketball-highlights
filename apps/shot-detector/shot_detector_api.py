import math

import cv2
import numpy as np
from shot_detector import ShotDetector
from utils import in_hoop_region


class ShotDetectorAPI(ShotDetector):
    def __init__(self, model_path):
        # 调用父类的 __init__ 方法，传入 model_path
        # video_path 传入空字符串，因为我们会在 detect_shots 方法中动态设置
        super().__init__(model_path=model_path, video_path="")

    def detect_shots(self, video_path):
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise Exception("Could not open video file")

        # 重置父类的状态
        self.ball_pos = []
        self.hoop_pos = []
        self.frame_count = 0
        self.makes = 0
        self.attempts = 0
        self.up = False
        self.down = False
        self.up_frame = 0
        self.down_frame = 0

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
                    if (conf > .3 or (in_hoop_region(center, self.hoop_pos) and conf > 0.15)) and current_class == "Basketball":
                        self.ball_pos.append(
                            (center, self.frame_count, w, h, conf))

                    # Create hoop points if high confidence
                    if conf > .5 and current_class == "Basketball Hoop":
                        self.hoop_pos.append(
                            (center, self.frame_count, w, h, conf))

            # Clean motion data (使用父类的逻辑，但不显示)
            if len(self.ball_pos) > 0:
                from utils import clean_ball_pos
                self.ball_pos = clean_ball_pos(self.ball_pos, self.frame_count)

            if len(self.hoop_pos) > 1:
                from utils import clean_hoop_pos
                self.hoop_pos = clean_hoop_pos(self.hoop_pos)

            # Shot detection logic
            if len(self.hoop_pos) > 0 and len(self.ball_pos) > 0:
                from utils import detect_down, detect_up, score

                # Detecting when ball is in 'up' and 'down' area
                if not self.up:
                    self.up = detect_up(self.ball_pos, self.hoop_pos)
                    if self.up:
                        self.up_frame = self.frame_count

                if self.up and not self.down:
                    self.down = detect_down(self.ball_pos, self.hoop_pos)
                    if self.down:
                        self.down_frame = self.frame_count

                # If ball goes from 'up' area to 'down' area in that order, increase attempt and reset
                if self.frame_count % 10 == 0:
                    if self.up and self.down and self.up_frame < self.down_frame:
                        self.attempts += 1
                        self.up = False
                        self.down = False

                        # Check if it's a make
                        is_make = score(self.ball_pos, self.hoop_pos)
                        if is_make:
                            self.makes += 1

                        # Record shot event
                        shot_events.append({
                            "frame": self.frame_count,
                            "is_make": is_make,
                            "attempts": self.attempts,
                            "makes": self.makes
                        })

            self.frame_count += 1

        cap.release()

        # Calculate shooting percentage
        shooting_percentage = (
            self.makes / self.attempts * 100) if self.attempts > 0 else 0

        return {
            "total_attempts": self.attempts,
            "total_makes": self.makes,
            "shooting_percentage": round(shooting_percentage, 2),
            "shot_events": shot_events
        }
