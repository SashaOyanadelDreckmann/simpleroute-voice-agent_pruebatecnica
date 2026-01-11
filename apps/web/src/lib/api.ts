import type { CallContext, StartCallResponse } from "shared-types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/$/, "");

/* ===============================
   START CALL
================================ */
export async function startCall(name: string): Promise<StartCallResponse> {
  const res = await fetch(`${API_BASE}/call/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error("Failed to start call");
  }

  return res.json();
}

/* ===============================
   VOICE STEP
================================ */
export async function sendVoiceStep(audio: Blob, ctx: { caseId: string }) {
  const form = new FormData();
  form.append("audio", audio, "audio.wav");
  form.append("ctx", JSON.stringify({ caseId: ctx.caseId }));

  const res = await fetch(`${API_BASE}/call/voice-step`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Error en voice-step");

  const json = await res.json();

  return {
    audio: base64ToAudio(json.audio),
    transcript: json.transcript as string,
    say: json.say as string,
    ctx: json.ctx,
  };
}

function base64ToAudio(b64: string): Blob {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "audio/wav" });
}
