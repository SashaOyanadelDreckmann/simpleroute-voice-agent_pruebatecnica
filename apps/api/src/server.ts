import "dotenv/config";
import express from "express";
import cors from "cors";
import callRoutes from "./routes/call.route.js";

const app = express();

/* ======================================================
   CORS — DEBE IR PRIMERO
====================================================== */
const corsMiddleware = cors({
  origin: [
    "https://simpleroute-voice-agent-pruebatecni.vercel.app",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

app.use(corsMiddleware);

// 🔑 CRÍTICO: capturar preflight explícitamente
app.options("*", corsMiddleware);

/* ======================================================
   Parsers
====================================================== */
app.use(express.json({ limit: "2mb" }));

/* ======================================================
   Routes
====================================================== */
app.use("/call", callRoutes);

/* ======================================================
   Health
====================================================== */
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/* ======================================================
   Fallback (para Railway)
====================================================== */
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

/* ======================================================
   Server
====================================================== */
const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on port ${PORT}`);
});
