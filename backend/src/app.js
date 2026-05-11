const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { success: false, message: "너무 많은 요청입니다. 잠시 후 다시 시도해 주세요." },
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    backend: "legacy-disabled",
    runtime: "next-app-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use("/api", (req, res) => {
  res.status(410).json({
    success: false,
    message: "이 Express 백엔드는 비활성화되었습니다. Next.js app/api와 Supabase 경로를 사용해 주세요."
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message
  });
});

module.exports = app;
