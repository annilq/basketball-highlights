#!/usr/bin/env python3

import os

from shot_detector_api import ShotDetectorAPI


def test_generate_highlights():
    """Test the generate_highlights method with a sample video"""

    # Path to the model and test video
    model_path = "best.pt"
    video_path = "shot.mp4"
    output_path = "test_highlights1.mp4"

    # Check if the files exist
    if not os.path.exists(model_path):
        print(f"Error: Model file {model_path} not found")
        return False

    if not os.path.exists(video_path):
        print(f"Error: Test video {video_path} not found")
        return False

    try:
        print(f"Testing generate_highlights with video: {video_path}")

        # Initialize the detector
        detector = ShotDetectorAPI(model_path)

        # Generate highlights
        highlights_path = detector.generate_highlights(
            video_path, output_path=output_path)

        # Check if the highlights video was created
        if os.path.exists(highlights_path):
            print(
                f"✓ Success! Highlights video generated at: {highlights_path}")
            print(
                f"  Video size: {os.path.getsize(highlights_path) / 1024 / 1024:.2f} MB")
            return True
        else:
            print(
                f"✗ Error: Highlights video not found at expected path: {highlights_path}")
            return False

    except Exception as e:
        print(f"✗ Error during test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    test_generate_highlights()
