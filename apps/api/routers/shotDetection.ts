import { shotDetection, shotEvent } from "@repo/db";
import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc.js";

// Define the schema for shot event based on Python service response
export const shotEventSchema = z.object({
  frame: z.number(),
  is_make: z.boolean(),
  attempts: z.number(),
  makes: z.number(),
});

// Define the schema for detection result based on Python service response
export const detectionResultSchema = z.object({
  total_attempts: z.number(),
  total_makes: z.number(),
  shooting_percentage: z.number(),
  shot_events: z.array(shotEventSchema),
});

// Define TypeScript type from schema
export type DetectionResult = z.infer<typeof detectionResultSchema>;
export type ShotEvent = z.infer<typeof shotEventSchema>;

export const shotDetectionRouter = router({
  detectShots: protectedProcedure
    .input(
      z
        .object({
          videoUrl: z.url({ message: "videoUrl 必须是有效的 URL" }).optional(),
          video: z.any().optional(),
        })
        .refine((input) => input.videoUrl || input.video, {
          message: "Either videoUrl or video must be provided",
          path: [],
        }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // For now, we'll use a mock URL for the Python service
        // In production, this should be an environment variable
        const pythonServiceUrl = "http://localhost:8000/detect-shots";

        let videoBlob: Blob;
        let videoUrl: string | undefined;
        let videoName: string | undefined;

        // Handle different input types
        if (input.videoUrl) {
          // Fetch the video from the provided URL
          videoUrl = input.videoUrl;
          videoName = input.videoUrl.split("/").pop();

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
          videoName = "uploaded_video.mp4";
        } else {
          throw new Error("Either videoUrl or video file must be provided");
        }

        // Create a FormData object to send the video
        const formData = new FormData();
        formData.append("video", videoBlob, videoName || "video.mp4");

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

        // Parse and validate the response using Zod schema
        const detectionResult = detectionResultSchema.parse(
          await detectionResponse.json(),
        );

        // Get user information from context
        const userId = ctx.user.id;
        // teamId will be added later when team functionality is fully implemented
        const teamId = undefined;

        // Save the detection results to the database
        const savedDetection = await ctx.db
          .insert(shotDetection)
          .values({
            userId: userId,
            teamId: teamId,
            videoUrl: videoUrl,
            videoName: videoName,
            attempts: detectionResult.total_attempts,
            makes: detectionResult.total_makes,
            shootingPercentage: detectionResult.shooting_percentage.toString(),
          })
          .returning();

        // Save shot events if any
        if (detectionResult.shot_events.length > 0) {
          await ctx.db.insert(shotEvent).values(
            detectionResult.shot_events.map((event) => ({
              shotDetectionId: savedDetection[0].id,
              frame: event.frame,
              isMake: event.is_make ? 1 : 0,
              attempts: event.attempts,
              makes: event.makes,
            })),
          );
        }

        return detectionResult;
      } catch (error) {
        console.error("Error detecting shots:", error);
      }
    }),

  generateShotClip: protectedProcedure
    .input(
      z
        .object({
          videoUrl: z.url({ message: "videoUrl 必须是有效的 URL" }).optional(),
          video: z.any().optional(),
          shot_frame: z.number({ message: "shot_frame 必须是有效的数字" }),
          duration: z
            .number({ message: "duration 必须是有效的数字" })
            .optional()
            .default(3),
        })
        .refine((input) => input.videoUrl || input.video, {
          message: "Either videoUrl or video must be provided",
          path: [],
        }),
    )
    .mutation(async ({ input }) => {
      try {
        const pythonServiceUrl = "http://localhost:8000/generate-shot-clip";

        let videoBlob: Blob;
        let videoName: string | undefined;

        // Handle different input types
        if (input.videoUrl) {
          // Fetch the video from the provided URL
          videoName = input.videoUrl.split("/").pop();

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
          videoName = "uploaded_video.mp4";
        } else {
          throw new Error("Either videoUrl or video file must be provided");
        }

        // Create a FormData object to send the video and parameters
        const formData = new FormData();
        formData.append("video", videoBlob, videoName || "video.mp4");
        formData.append("shot_frame", input.shot_frame.toString());
        formData.append("duration", input.duration.toString());

        // Call the Python service
        const clipResponse = await fetch(pythonServiceUrl, {
          method: "POST",
          body: formData,
        });

        if (!clipResponse.ok) {
          throw new Error(
            `Failed to generate shot clip: ${clipResponse.statusText}`,
          );
        }

        // Parse the response
        const clipResult = await clipResponse.json();
        return clipResult;
      } catch (error) {
        console.error("Error generating shot clip:", error);
      }
    }),

  generateHighlights: protectedProcedure
    .input(
      z
        .object({
          videoUrl: z.url({ message: "videoUrl 必须是有效的 URL" }).optional(),
          video: z.any().optional(),
          output_path: z.string().optional().default("highlights.mp4"),
        })
        .refine((input) => input.videoUrl || input.video, {
          message: "Either videoUrl or video must be provided",
          path: [],
        }),
    )
    .mutation(async ({ input }) => {
      try {
        const pythonServiceUrl = "http://localhost:8000/generate-highlights";

        let videoBlob: Blob;
        let videoName: string | undefined;

        // Handle different input types
        if (input.videoUrl) {
          // Fetch the video from the provided URL
          videoName = input.videoUrl.split("/").pop();

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
          videoName = "uploaded_video.mp4";
        } else {
          throw new Error("Either videoUrl or video file must be provided");
        }

        // Create a FormData object to send the video and parameters
        const formData = new FormData();
        formData.append("video", videoBlob, videoName || "video.mp4");
        formData.append("output_path", input.output_path || "highlights.mp4");

        // Call the Python service
        const highlightsResponse = await fetch(pythonServiceUrl, {
          method: "POST",
          body: formData,
        });

        if (!highlightsResponse.ok) {
          throw new Error(
            `Failed to generate highlights: ${highlightsResponse.statusText}`,
          );
        }

        // Parse the response
        const highlightsResult = await highlightsResponse.json();
        return highlightsResult;
      } catch (error) {
        console.error("Error generating highlights:", error);
      }
    }),
});
