/**
 * @file Shot detection queries using TanStack Query with tRPC integration.
 *
 * Handles basketball video shot detection, caching, and error management.
 */

import { useMutation, type QueryClient } from "@tanstack/react-query";

export const shotDetectionQueryKey = ["shotDetection"] as const;

export interface DetectShotsInput {
  videoUrl: string;
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
    mutationFn: async ({ videoUrl }) => {
      const response = await fetch("/api/shot-detection", {
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

      return response.json() as Promise<ShotDetectionResult>;
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
