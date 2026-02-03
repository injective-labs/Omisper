import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import apiRouter from "./api/index.js";
import { errorMiddleware } from "./middleware/error.js";
import { jsonMiddleware } from "./middleware/json.js";
import { noRouteMiddleware } from "./middleware/noRoute.js";
import { rateLimitMiddleware } from "./middleware/rateLimit.js";

const app = express();

const env = process.env.NODE_ENV || "development";

// Parse CORS allowed origins from environment variable
// Format: comma-separated URLs, or regex patterns enclosed in /.../ 
// Example: "https://example.com,https://another.com,/^https:\/\/.*\.pages\.dev$/"
const parseCorsOrigins = (originsString?: string): (string | RegExp)[] => {
  const defaults = [
    "https://xmtp.chat",
    "https://d14n.xmtp.chat",
  ];

  if (!originsString) {
    if (env === "development") {
      defaults.push("http://localhost:5173");
    }
    return defaults;
  }

  const origins: (string | RegExp)[] = [...defaults];
  const parts = originsString.split(",").map((p) => p.trim());

  for (const part of parts) {
    if (part.startsWith("/") && part.endsWith("/")) {
      // It's a regex pattern
      const pattern = part.slice(1, -1);
      try {
        origins.push(new RegExp(pattern));
      } catch (e) {
        console.warn(`Invalid regex pattern in CORS_ALLOWED_ORIGINS: ${part}`);
      }
    } else if (part) {
      // It's a URL
      origins.push(part);
    }
  }

  if (env === "development") {
    origins.push("http://localhost:5173");
  }

  return origins;
};

const allowedOrigins = parseCorsOrigins(process.env.CORS_ALLOWED_ORIGINS);

app.set("trust proxy", 1);
app.use(helmet()); // Set security headers
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "OPTIONS", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
    maxAge: 86400,
  }),
); // Handle CORS
app.use(jsonMiddleware); // Parse JSON requests

// Rate limiting should be before routes but after logging
app.use(rateLimitMiddleware);

// GET /healthcheck - Healthcheck endpoint
app.get("/health", (_req: Request, res: Response): void => {
  res.status(200).send("OK");
});

// add api routes
app.use("/api", apiRouter);

// handle non-existent routes with 404 response
app.use(noRouteMiddleware);

// Error handling middleware should be last
app.use(errorMiddleware);

// 导出 Express app 供 Vercel 使用
export default app;

// 本地开发服务器
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000;
  const server = app.listen(port, () => {
    console.log(`xmtp.chat API service is running on port ${port}`);
    console.log(`Environment: ${env}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing xmtp.chat API service");
    server.close(() => {
      console.log("xmtp.chat API service closed");
    });
  });

  process.on("SIGINT", () => {
    console.log("SIGINT signal received: closing xmtp.chat API service");
    server.close(() => {
      console.log("xmtp.chat API service closed");
    });
  });
}
