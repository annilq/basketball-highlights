import { shotDetection, shotEvent } from "@repo/db";
import { and, asc, desc, eq } from "drizzle-orm";
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
      z.object({
        videoUrl: z.url({ message: "videoUrl 必须是有效的 URL" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // For now, we'll use a mock URL for the Python service
        // In production, this should be an environment variable
        const pythonServiceUrl = "http://localhost:8000/detect-shots";

        // Call the Python service with videoUrl directly
        const detectionResponse = await fetch(pythonServiceUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ video_url: input.videoUrl }),
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
        const teamId = null;

        // Extract video name from URL
        const videoName = input.videoUrl.split("/").pop();

        // Save the detection results to the database
        const savedDetection = await ctx.db
          .insert(shotDetection)
          .values({
            userId: userId,
            teamId: teamId,
            videoUrl: input.videoUrl,
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
        throw error;
      }
    }),

  myShots: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Fetch all shotDetection records for the current user
    const myShots = await ctx.db
      .select()
      .from(shotDetection)
      .where(eq(shotDetection.userId, userId))
      .orderBy(desc(shotDetection.createdAt));

    return myShots;
  }),

  getShot: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const shot = await ctx.db
        .select()
        .from(shotDetection)
        .where(
          and(
            eq(shotDetection.id, input.id),
            eq(shotDetection.userId, ctx.user.id),
          ),
        )
        .limit(1)
        .execute();

      if (!shot[0]) {
        throw new Error("Shot detection not found");
      }

      // Fetch associated shot events
      const shotEvents = await ctx.db
        .select()
        .from(shotEvent)
        .where(eq(shotEvent.shotDetectionId, input.id))
        .orderBy(asc(shotEvent.frame))
        .execute();

      // Format the shot events to match the expected schema
      const formattedShotEvents = shotEvents.map((event) => ({
        frame: event.frame,
        is_make: event.isMake === 1,
        attempts: event.attempts,
        makes: event.makes,
      }));

      // Return the shot detection with formatted shot events
      return {
        ...shot[0],
        shot_events: formattedShotEvents,
      };
    }),

  generateShotClip: protectedProcedure
    .input(
      z.object({
        videoUrl: z.url({ message: "videoUrl 必须是有效的 URL" }),
        shot_frame: z.number({ message: "shot_frame 必须是有效的数字" }),
        duration: z
          .number({ message: "duration 必须是有效的数字" })
          .optional()
          .default(3),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const pythonServiceUrl = "http://localhost:8000/generate-shot-clip";

        // Call the Python service with videoUrl directly
        const clipResponse = await fetch(pythonServiceUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_url: input.videoUrl,
            shot_frame: input.shot_frame,
            duration: input.duration,
          }),
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
        throw error;
      }
    }),

  generateHighlights: protectedProcedure
    .input(
      z.object({
        videoUrl: z.url({ message: "videoUrl 必须是有效的 URL" }),
        output_path: z.string().optional().default("highlights.mp4"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const pythonServiceUrl = "http://localhost:8000/generate-highlights";

        // Call the Python service with videoUrl directly
        const highlightsResponse = await fetch(pythonServiceUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_url: input.videoUrl,
            output_path: input.output_path,
          }),
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
        throw error;
      }
    }),
});
