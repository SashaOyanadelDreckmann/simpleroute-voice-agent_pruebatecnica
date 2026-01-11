import "dotenv/config";
import express from "express";
import cors from "cors";
import callRoutes from "./routes/call.route.js";

const app = express();

/* ======================================================
   CORS CONFIG (UNA SOLA FUENTE DE VERDAD)
====================================================== */

const corsOptions: cors.CorsOptions = {
  origin: [
    "https://simpleroute-voice-agent-pruebatecni.vercel.app",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

/* ======================================================
   Middleware
====================================================== */

// ✅ CORS aplicado a TODAS las requests
app.use(cors(corsOptions));

// ✅ Preflight (OBLIGATORIO para browser)
app.options("*", cors(corsOptions));

// JSON (para /call/start)
app.use(express.json({ limit: "2mb" }));

/* ======================================================
   Routes
====================================================== */

app.use("/call", callRoutes);

/* ======================================================
   Healthcheck
====================================================== */

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/* ======================================================
   Error handling (mínimo pero profesional)
====================================================== */

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[API ERROR]", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

/* ======================================================
   Server
====================================================== */

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
