"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CallShell from "@/components/CallShell";
import type { CallContext } from "shared-types/call.contract";

export default function CallPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [ctx, setCtx] = useState<CallContext | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!caseId) return;

    const raw = sessionStorage.getItem(`call:${caseId}`);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    setCtx(parsed.ctx);
    setMessage(parsed.message);
  }, [caseId]);

  if (!caseId) {
    return <div style={{ padding: 24 }}>Call not found</div>;
  }

  if (!ctx) {
    return <div style={{ padding: 24 }}>Cargando llamada…</div>;
  }

  return <CallShell initialCtx={ctx} initialMessage={message} />;
}
