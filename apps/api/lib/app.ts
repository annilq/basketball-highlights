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

// File upload route for shot detection - stores video locally and returns URL
app.post("/api/shot-detection/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const video = formData.get("video");

    if (!video || typeof video === "string") {
      return c.json({ error: "No video file provided" }, 400);
    }

    // Now we know video is a Blob
    const videoBlob = video as Blob;

    // Create uploads directory if it doesn't exist
    const uploadDir = "./uploads";
    const fs = await import("fs/promises");
    // Check if directory exists using Node.js fs
    if (!(await fs.exists(uploadDir))) {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = ".mp4"; // Assuming MP4 format
    const filename = `video_${timestamp}${fileExtension}`;
    const filePath = `${uploadDir}/${filename}`;

    // Save file to local storage
    const buffer = Buffer.from(await videoBlob.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Construct accessible URL
    const url = new URL(c.req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const videoUrl = `${baseUrl}/uploads/${filename}`;

    return c.json({ videoUrl });
  } catch (error) {
    console.error("Error uploading video:", error);
    return c.json({ error: "Failed to upload video" }, 500);
  }
});

// Serve uploaded videos
app.get("/uploads/*", async (c) => {
  const filePath = c.req.path.replace("/uploads", "./uploads");
  const fs = await import("fs/promises");

  try {
    const fileContent = await fs.readFile(filePath);
    return new Response(fileContent, {
      headers: {
        "Content-Type": "video/mp4",
      },
    });
  } catch (error) {
    console.error("Error serving video:", error);
    return c.json({ error: "File not found" }, 404);
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
