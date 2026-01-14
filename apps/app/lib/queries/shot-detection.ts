/**
 * @file Shot detection queries using TanStack Query with tRPC integration.
 *
 * Handles basketball video shot detection, caching, and error management.
 */

import { useMutation, type QueryClient } from "@tanstack/react-query";

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

export async function invalidateShotDetection(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: [shotDetectionQueryKey],
  });
}
