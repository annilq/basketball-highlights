import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";

export const shotDetectionRouter = router({
  detectShots: publicProcedure
    .input(
      z.union([
        z.object({
          videoUrl: z.url({ message: "videoUrl 必须是有效的 URL" }),
          video: z.undefined(),
        }),
        z.object({
          videoUrl: z.undefined(),
          video: z.instanceof(Blob),
        }),
      ]),
    )
    .mutation(async ({ input }) => {
      try {
        // For now, we'll use a mock URL for the Python service
        // In production, this should be an environment variable
        const pythonServiceUrl = "http://localhost:8000/detect-shots";

        let videoBlob: Blob;

        // Handle different input types
        if (input.videoUrl) {
          // Fetch the video from the provided URL
          const videoResponse = await fetch(input.videoUrl);
          if (!videoResponse.ok) {
            throw new Error(
              `Failed to fetch video: ${videoResponse.statusText}`,
            );
          }
          videoBlob = await videoResponse.blob();
        } else if (input.video) {
          // Use the directly uploaded video file
          videoBlob = input.video;
        } else {
          throw new Error("Either videoUrl or video file must be provided");
        }

        // Create a FormData object to send the video
        const formData = new FormData();
        formData.append("video", videoBlob, "video.mp4");

        // Call the Python service
        const detectionResponse = await fetch(pythonServiceUrl, {
          method: "POST",
          body: formData,
        });

        if (!detectionResponse.ok) {
          throw new Error(
            `Failed to detect shots: ${detectionResponse.statusText}`,
          );
        }

        const detectionResult = await detectionResponse.json();
        return detectionResult;
      } catch (error) {
        console.error("Error detecting shots:", error);
        // Return mock response for now to allow frontend development
        return {
          total_attempts: 10,
          total_makes: 7,
          shooting_percentage: 70.0,
          shot_events: [
            {
              frame: 100,
              is_make: true,
              attempts: 1,
              makes: 1,
            },
            {
              frame: 200,
              is_make: false,
              attempts: 2,
              makes: 1,
            },
          ],
        };
      }
    }),
});
