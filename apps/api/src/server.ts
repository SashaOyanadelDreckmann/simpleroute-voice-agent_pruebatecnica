import "dotenv/config";
import express from "express";
import cors from "cors";
import callRoutes from "./routes/call.route";

const app = express();

/* ======================================================
   Middleware
====================================================== */

// CORS explícito (demo)
app.use(
  cors({
    origin: "*", // en producción: dominio del frontend
    methods: ["GET", "POST"],
  })
);

// JSON (para /call/start)
app.use(express.json({ limit: "2mb" }));

// Routes
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
  console.log(`API running on http://localhost:${PORT}`);
});
