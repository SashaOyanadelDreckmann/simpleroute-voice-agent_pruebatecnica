// apps/api/src/routes/call.route.ts
import { Router, Response } from "express";
import multer from "multer";
import crypto from "crypto";

import { decideNext } from "../agent/callAgent.js";
import { createCase, getCase, updateCase } from "../db/fakeDb.js";
import { asr, tts } from "../voice/voicePipeline.js";
import type { CallContext, CallGoal } from "../types/call.types.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ======================================================
   START CALL
====================================================== */
router.post("/start", (req, res) => {
  const { name } = (req.body ?? {}) as { name?: string };

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  const caseId = crypto.randomUUID();

  const ctx: CallContext = {
    caseId,
    state: "IN_CALL",
    goalsCompleted: [],
    profile: { name: name.trim() },
  };

  createCase(caseId);
  updateCase(caseId, ctx);

  const message = `Hola ${ctx.profile.name}, gracias por atender. Antes de continuar, necesito validar algunos datos contigo.`;

  res.json({
    caseId,
    ctx,
    message,
  });
});

/* ======================================================
   VOICE STEP
====================================================== */
router.post(
  "/voice-step",
  upload.single("audio"),
  async (req, res: Response) => {
    try {
      const file = req.file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json({ error: "Audio requerido" });
      }

      const raw = req.body?.ctx;
      if (!raw) {
        return res.status(400).json({ error: "ctx inválido" });
      }

      const { caseId } = JSON.parse(raw) as { caseId?: string };
      if (!caseId) {
        return res.status(400).json({ error: "caseId es requerido" });
      }

      const ctx = getCase(caseId);
      if (!ctx) {
        return res.status(404).json({ error: "Call not found" });
      }

      const userText = await asr(file.buffer);

      if (!userText || !userText.trim()) {
        return res.json({
          audio: "",
          transcript: "",
          say: "Disculpa, no te escuché bien. ¿Podrías repetirlo?",
          ctx,
        });
      }

      const decision = await decideNext(ctx, userText);

      if (decision.updates) {
        ctx.profile = { ...ctx.profile, ...decision.updates };
      }

      if (decision.validations) {
        const { field, confirmed } = decision.validations;

        if (field === "name") {
          ctx.profile.confirmedName = confirmed;
          if (confirmed) pushGoal(ctx, "NAME_CONFIRMED");
        }

        if (field === "email") {
          ctx.profile.confirmedEmail = confirmed;
          if (confirmed) pushGoal(ctx, "EMAIL_CONFIRMED");
        }
      }

      if (
        ctx.profile.address &&
        !ctx.goalsCompleted.includes("ADDRESS_COLLECTED")
      ) {
        pushGoal(ctx, "ADDRESS_COLLECTED");
      }

      if (isProfileComplete(ctx)) {
        ctx.state = "DONE";
      }

      updateCase(ctx.caseId, ctx);

      const audio = await tts(decision.say);

      res.json({
        audio: audio.toString("base64"),
        transcript: userText,
        say: decision.say,
        ctx,
      });
    } catch (err) {
      console.error("[VOICE STEP ERROR]", err);
      res.status(500).json({ error: "voice-step failed" });
    }
  }
);

/* ======================================================
   GET CALL CONTEXT (FALLBACK)
====================================================== */
router.get("/:caseId", (req, res) => {
  const { caseId } = req.params;

  const ctx = getCase(caseId);
  if (!ctx) {
    return res.status(404).json({ error: "Call not found" });
  }

  res.json({
    ctx,
    message: "Continuamos donde quedamos.",
  });
});

/* ======================================================
   Helpers
====================================================== */
function pushGoal(ctx: CallContext, goal: CallGoal) {
  if (!ctx.goalsCompleted.includes(goal)) {
    ctx.goalsCompleted.push(goal);
  }
}

function isProfileComplete(ctx: CallContext): boolean {
  return (
    ctx.goalsCompleted.includes("NAME_CONFIRMED") &&
    ctx.goalsCompleted.includes("EMAIL_CONFIRMED") &&
    ctx.goalsCompleted.includes("ADDRESS_COLLECTED")
  );
}

export default router;
