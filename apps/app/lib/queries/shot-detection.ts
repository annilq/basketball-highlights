/**
 * @file Shot detection queries using TanStack Query with tRPC integration.
 *
 * Handles basketball video shot detection, caching, and error management.
 */

import { useMutation, useQuery, type QueryClient } from "@tanstack/react-query";

export const shotDetectionQueryKey = ["shotDetection"] as const;

export interface DetectShotsInput {
  videoUrl?: string;
  file?: File;
}

export interface ShotEvent {
  frame: number;
  is_make: boolean;
  attempts: number;
  makes: number;
}

export interface ShotDetectionResult {
  total_attempts: number;
  total_makes: number;
  shooting_percentage: number;
  shot_events: ShotEvent[];
}

export interface ShotDetectionRecord {
  id: string;
  userId: string;
  teamId: string | null;
  videoUrl: string;
  videoName: string;
  attempts: number;
  makes: number;
  shootingPercentage: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useDetectShotsMutation() {
  return useMutation<ShotDetectionResult, Error, DetectShotsInput>({
    mutationFn: async ({ videoUrl, file }) => {
      // If file is provided, use FormData for file upload
      if (file) {
        const formData = new FormData();
        formData.append("video", file, file.name);

        const response = await fetch("/api/shot-detection/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to detect shots");
        }

        return response.json() as Promise<ShotDetectionResult>;
      }
      // Otherwise, use JSON for URL input
      else if (videoUrl) {
        const response = await fetch("/api/trpc/shotDetection.detectShots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoUrl }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to detect shots");
        }

        const result = await response.json();
        return result.result.data as ShotDetectionResult;
      } else {
        throw new Error("Either videoUrl or file must be provided");
      }
    },
    onSuccess: (data) => {
      console.log("Shot detection completed:", data);
    },
    onError: (error) => {
      console.error("Shot detection failed:", error);
    },
  });
}

export interface GenerateShotClipInput {
  videoUrl?: string;
  video?: File;
  shot_frame: number;
  duration?: number;
}

export interface GenerateShotClipResult {
  clip_path: string;
}

export function useGenerateShotClipMutation() {
  return useMutation<GenerateShotClipResult, Error, GenerateShotClipInput>({
    mutationFn: async ({ videoUrl, video, shot_frame, duration = 3 }) => {
      // If video is provided, use FormData for file upload
      if (video) {
        const formData = new FormData();
        formData.append("video", video, video.name);
        formData.append("shot_frame", shot_frame.toString());
        formData.append("duration", duration.toString());

        const response = await fetch("/api/shot-detection/generate-clip", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to generate shot clip");
        }

        return response.json() as Promise<GenerateShotClipResult>;
      }
      // Otherwise, use JSON for URL input
      else if (videoUrl) {
        const response = await fetch(
          "/api/trpc/shotDetection.generateShotClip",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoUrl, shot_frame, duration }),
          },
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to generate shot clip");
        }

        const result = await response.json();
        return result.result.data as GenerateShotClipResult;
      } else {
        throw new Error("Either videoUrl or video must be provided");
      }
    },
    onSuccess: (data) => {
      console.log("Shot clip generated:", data);
    },
    onError: (error) => {
      console.error("Failed to generate shot clip:", error);
    },
  });
}

export interface GenerateHighlightsInput {
  videoUrl?: string;
  video?: File;
  output_path?: string;
}

export interface GenerateHighlightsResult {
  highlights_path: string;
}

export function useGenerateHighlightsMutation() {
  return useMutation<GenerateHighlightsResult, Error, GenerateHighlightsInput>({
    mutationFn: async ({ videoUrl, video, output_path = "highlights.mp4" }) => {
      // If video is provided, use FormData for file upload
      if (video) {
        const formData = new FormData();
        formData.append("video", video, video.name);
        formData.append("output_path", output_path);

        const response = await fetch(
          "/api/shot-detection/generate-highlights",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to generate highlights");
        }

        return response.json() as Promise<GenerateHighlightsResult>;
      }
      // Otherwise, use JSON for URL input
      else if (videoUrl) {
        const response = await fetch(
          "/api/trpc/shotDetection.generateHighlights",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoUrl, output_path }),
          },
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to generate highlights");
        }

        const result = await response.json();
        return result.result.data as GenerateHighlightsResult;
      } else {
        throw new Error("Either videoUrl or video must be provided");
      }
    },
    onSuccess: (data) => {
      console.log("Highlights generated:", data);
    },
    onError: (error) => {
      console.error("Failed to generate highlights:", error);
    },
  });
}

export function useMyShotsQuery() {
  return useQuery<ShotDetectionRecord[], Error>({
    queryKey: [...shotDetectionQueryKey, "myShots"],
    queryFn: async () => {
      const response = await fetch("/api/trpc/shotDetection.myShots", {
        method: "GET",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to fetch my shots");
      }

      const result = await response.json();
      return result.result.data as ShotDetectionRecord[];
    },
  });
}

export function useGetShotQuery(shotId: string | undefined) {
  return useQuery<ShotDetectionRecord & { shot_events: ShotEvent[] }, Error>({
    queryKey: [...shotDetectionQueryKey, "getShot", shotId],
    queryFn: async () => {
      if (!shotId) {
        throw new Error("Shot ID is required");
      }

      // For GET requests, tRPC expects input as a JSON string in the "input" query parameter
      const input = JSON.stringify({ id: shotId });
      const response = await fetch(
        `/api/trpc/shotDetection.getShot?input=${encodeURIComponent(input)}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to fetch shot details");
      }

      const result = await response.json();
      return result.result.data as ShotDetectionRecord & {
        shot_events: ShotEvent[];
      };
    },
    enabled: !!shotId,
  });
}

export async function invalidateShotDetection(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: [shotDetectionQueryKey],
  });
}
