"use client";

import { useRef, useState } from "react";
import MicButton from "./MicButton";
import AudioPlayer from "./AudioPlayer";
import { sendVoiceStep } from "@/lib/api";
import type { CallContext } from "shared-types/call.contract";

type UiState = "IDLE" | "CALLING" | "CONNECTED" | "DONE";

type Props = {
  initialCtx: CallContext;
  initialMessage: string;
};

export default function CallShell({ initialCtx, initialMessage }: Props) {
  const [ctx, setCtx] = useState(initialCtx);
  const [uiState, setUiState] = useState<UiState>("IDLE");
  const [agentText, setAgentText] = useState(initialMessage);
  const [replyAudio, setReplyAudio] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  /* ===============================
     START CALL
  ================================ */
  function startCall() {
    if (uiState !== "IDLE") return;

    setUiState("CALLING");

    const ringtone = new Audio("/ringtone.mp3");
    ringtone.loop = true;
    ringtone.play().catch(() => {});

    setTimeout(() => {
      ringtone.pause();
      ringtone.currentTime = 0;
      setUiState("CONNECTED");
    }, 1500);
  }

  /* ===============================
     PRESS → START RECORDING
  ================================ */
  async function handlePress() {
    if (uiState !== "CONNECTED") return;
    if (ctx.state !== "IN_CALL") return;
    if (recording || agentSpeaking) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("🎤 Error al acceder al micrófono", err);
    }
  }

  /* ===============================
     RELEASE → STOP & SEND
  ================================ */
  async function handleRelease() {
    if (!recording || !mediaRecorderRef.current) return;

    setRecording(false);

    const mediaRecorder = mediaRecorderRef.current;

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, {
        type: "audio/webm",
      });

      streamRef.current?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;

      try {
        const res = await sendVoiceStep(audioBlob, { caseId: ctx.caseId });

        setCtx(res.ctx);
        setAgentText(res.say);

        if (res.audio?.size) {
          setReplyAudio(res.audio);
        }

        if (res.ctx.state === "DONE") {
          setUiState("DONE");
        }
      } catch (err) {
        console.error("❌ Error en voice-step", err);
      }
    };

    mediaRecorder.stop();
  }

  return (
    <main
  style={{
    maxWidth: 960,
    margin: "0 auto",
    padding: "30px 24px",
    minHeight: "90vh",
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: 38,
    alignItems: "center", // 👈 CLAVE
  }}
>
    
      {/* CALL CORE */}
<section
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 28,
  }}
>
  {/* TITLE */}
  <div style={{ textAlign: "center", maxWidth: 520 }}>
    <h1
      style={{
        margin: 0,
        marginBottom: 8,
        fontSize: 28,
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
    >
      Simulación de llamada
    </h1>

    <p
      style={{
        margin: 0,
        fontSize: 14,
        lineHeight: "22px",
        opacity: 0.7,
      }}
    >
      Luego de comenzar la llamada debes hablar y esperar a que el agente
      responda. Generalmente es rápido, pero en algunos casos puede demorar un
      poco más de lo esperado. Puedes hablarle de cualquier cosa  (hasta de china si quieres) pero la
      llamada finalizará únicamente cuando el bot logre validar todos los datos
      requeridos.
    </p>
  </div>
      
        {/* 🔁 SOLO CAMBIO VISUAL CONTROLADO */}
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 20, // ⬅️ cuadrado premium
            backgroundImage: "url(/foto1.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",

            boxShadow: recording
              ? "0 0 0 14px rgba(255,255,255,0.15)"
              : agentSpeaking
              ? "0 0 0 18px rgba(255,255,255,0.25)"
              : "0 12px 32px rgba(0,0,0,0.35)",

            transform: agentSpeaking
              ? "scale(1.03)"
              : recording
              ? "scale(1.015)"
              : "scale(1)",

            transition: "all 0.3s ease",
          }}
        />

        <div style={{ textAlign: "center", maxWidth: 420 }}>
          {uiState === "DONE" ? "La llamada ha finalizado." : agentText}
        </div>

        {uiState === "IDLE" && (
          <button onClick={startCall}>COMENZAR LLAMADA</button>
        )}

        {uiState === "CONNECTED" && (
          <MicButton
            onPress={handlePress}
            onRelease={handleRelease}
            active={recording}
          />
        )}

        {replyAudio && (
          <AudioPlayer
            audio={replyAudio}
            onStart={() => setAgentSpeaking(true)}
            onEnd={() => setAgentSpeaking(false)}
          />
        )}
      </section>

      {/* PROFILE */}
      <aside
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: 24,
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <ProfileRow
          label="Nombre"
          value={ctx.profile.name}
          confirmed={ctx.profile.confirmedName}
        />
        <ProfileRow
          label="Email"
          value={ctx.profile.email}
          confirmed={ctx.profile.confirmedEmail}
        />
        <ProfileRow
          label="Dirección"
          value={ctx.profile.address}
          confirmed={ctx.goalsCompleted.includes("ADDRESS_COLLECTED")}
        />
      </aside>
    </main>
  );
}

/* ===============================
   PROFILE ROW
================================ */
function ProfileRow({
  label,
  value,
  confirmed,
}: {
  label: string;
  value?: string;
  confirmed?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr 32px",
        gap: 12,
      }}
    >
      <span style={{ opacity: 0.6 }}>{label}</span>
      <span style={{ opacity: value ? 1 : 0.4 }}>{value ?? "—"}</span>
      <span>{confirmed === undefined ? "-" : confirmed ? "✓" : "✕"}</span>
    </div>
  );
}
