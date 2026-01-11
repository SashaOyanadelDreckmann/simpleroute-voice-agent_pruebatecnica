"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CallShell from "@/components/CallShell";
import type { CallContext } from "shared-types/call.contract";

export default function CallClientPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [ctx, setCtx] = useState<CallContext | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!caseId) return;

    // 1️⃣ Intentar desde sessionStorage (cache)
    const raw = sessionStorage.getItem(`call:${caseId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      setCtx(parsed.ctx);
      setMessage(parsed.message);
      return;
    }

    // 2️⃣ FALLBACK: pedir al backend
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/call/${caseId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setCtx(data.ctx);
        setMessage(data.message);
      })
      .catch(() => {
        // opcional: manejo de error
      });
  }, [caseId]);

  if (!caseId) {
    return <div style={{ padding: 24 }}>Call not found</div>;
  }

  if (!ctx) {
    return <div style={{ padding: 24 }}>Cargando llamada…</div>;
  }

  return <CallShell initialCtx={ctx} initialMessage={message} />;
}
