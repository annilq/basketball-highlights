/**
 * @file Hono app construction and tRPC router initialization.
 *
 * Combines authentication, tRPC, and health check endpoints into a single HTTP router.
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { organizationRouter } from "../routers/organization.js";
import { shotDetectionRouter } from "../routers/shotDetection.js";
import { userRouter } from "../routers/user.js";
import type { AppContext } from "./context.js";
import { router } from "./trpc.js";

// tRPC API router
const appRouter = router({
  user: userRouter,
  organization: organizationRouter,
  shotDetection: shotDetectionRouter,
});

// HTTP router
const app = new Hono<AppContext>();

app.get("/", (c) => c.redirect("/api"));

// Root endpoint with API information
app.get("/api", (c) => {
  return c.json({
    name: "@repo/api",
    version: "0.0.0",
    endpoints: {
      trpc: "/api/trpc",
      auth: "/api/auth",
      health: "/health",
    },
    documentation: {
      trpc: "https://trpc.io",
      auth: "https://www.better-auth.com",
    },
  });
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Authentication routes
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  const auth = c.get("auth");
  if (!auth) {
    return c.json({ error: "Authentication service not initialized" }, 503);
  }
  return auth.handler(c.req.raw);
});

// File upload route
app.post("/api/shot-detection/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const video = formData.get("video");

    if (!video || typeof video === "string") {
      return c.json({ error: "No video file provided" }, 400);
    }

    // Now we know video is a Blob
    const videoBlob = video as Blob;

    // For now, we'll use a mock URL for the Python service
    // In production, this should be an environment variable
    const pythonServiceUrl = "http://localhost:8000/detect-shots";

    // Create a FormData object to send the video
    const formDataToSend = new FormData();
    formDataToSend.append("video", videoBlob, "video.mp4");

    // Call the Python service
    const detectionResponse = await fetch(pythonServiceUrl, {
      method: "POST",
      body: formDataToSend,
    });

    if (!detectionResponse.ok) {
      throw new Error(
        `Failed to detect shots: ${detectionResponse.statusText}`,
      );
    }

    const detectionResult = await detectionResponse.json();
    return c.json(detectionResult);
  } catch (error) {
    console.error("Error detecting shots:", error);
    // Return mock response for now to allow frontend development
    return c.json({
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
    });
  }
});

// tRPC API routes
app.use("/api/trpc/*", (c) => {
  return fetchRequestHandler({
    req: c.req.raw,
    router: appRouter,
    endpoint: "/api/trpc",
    async createContext({ req, resHeaders, info }) {
      const db = c.get("db");
      const dbDirect = c.get("dbDirect");
      const auth = c.get("auth");

      if (!db) {
        throw new Error("Database not available in context");
      }

      if (!dbDirect) {
        throw new Error("Direct database not available in context");
      }

      if (!auth) {
        throw new Error("Authentication service not available in context");
      }

      const sessionData = await auth.api.getSession({
        headers: req.headers,
      });

      return {
        req,
        res: c.res,
        resHeaders,
        info,
        env: c.env,
        db,
        dbDirect,
        session: sessionData?.session ?? null,
        user: sessionData?.user ?? null,
        cache: new Map(),
      };
    },
    batching: {
      enabled: true,
    },
    onError({ error, path }) {
      console.error("tRPC error on path", path, ":", error);
    },
  });
});

export { appRouter };
export type AppRouter = typeof appRouter;
export default app;
