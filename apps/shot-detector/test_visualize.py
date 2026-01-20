#!/usr/bin/env python3
"""
Test script for the visualize_shots functionality in ShotDetector class.
"""

import os
import sys
import shutil
from shot_detector import ShotDetector


def test_visualize_shots():
    """Test the visualize_shots method with sample video."""

    # Video file to test with
    video_path = "shot.mp4"
    output_dir = "test_visualize_output"

    # Check if video file exists
    if not os.path.exists(video_path):
        print(f"Error: Video file {video_path} not found.")
        print("Please make sure the sample video is available in the current directory.")
        return False

    print(f"Testing visualize_shots with video: {video_path}")
    print(f"Output directory: {output_dir}")

    try:
        # Initialize detector
        detector = ShotDetector(video_path=video_path)

        # Run visualization
        detector.visualize_shots(output_dir=output_dir)

        # Verify output directory was created
        video_filename = os.path.splitext(os.path.basename(video_path))[0]
        video_output_dir = os.path.join(output_dir, video_filename)

        if not os.path.exists(video_output_dir):
            print(
                f"Error: Output directory {video_output_dir} was not created.")
            return False

        # Verify frames were generated
        frames = [f for f in os.listdir(
            video_output_dir) if f.endswith(".jpg")]
        if not frames:
            print(f"Error: No frames generated in {video_output_dir}.")
            return False

        print(f"Success! Generated {len(frames)} frames.")

        print(f"Sample frames: {frames[:3]}...")
        
        # Clean up test output
        print("\nCleaning up test output...")
        shutil.rmtree(output_dir)
        print(f"Removed test directory: {output_dir}")
        
        return True
        
    except Exception as e:
        print(f"Error during visualization: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_visualize_api():
    """Test the visualize_shots method API."""
    
    # Test without video path
    print("\nTesting visualize_shots without video path...")
    detector = ShotDetector()
    detector.visualize_shots()  # Should handle gracefully
    print("Success: visualize_shots handled missing video path correctly.")
    
    return True


def main():
    """Run all tests."""
    print("=" * 60)
    print("Shot Detector Visualization Test")
    print("=" * 60)
    
    tests = [
        test_visualize_shots,
        test_visualize_api
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        print(f"\nRunning test: {test.__name__}")
        print("-" * 40)
        
        if test():
            passed += 1
            print("✓ Test passed")
        else:
            failed += 1
            print("✗ Test failed")
    
    print("\n" + "=" * 60)
    print(f"Test Results: {passed} passed, {failed} failed")
    print("=" * 60)
    
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
