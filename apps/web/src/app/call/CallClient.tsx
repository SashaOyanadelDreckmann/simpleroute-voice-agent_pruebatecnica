"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CallShell from "@/components/CallShell";
import type { CallContext } from "shared-types/call.contract";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function CallClient() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [ctx, setCtx] = useState<CallContext | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!caseId) return;

    fetch(`${API_BASE}/call/${caseId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Call not found");
        return res.json();
      })
      .then((data) => {
        setCtx(data.ctx);
        setMessage(data.message);
      })
      .catch((err) => {
        console.error("❌ Error loading call", err);
      });
  }, [caseId]);

  if (!ctx) {
    return <div style={{ padding: 24 }}>Cargando llamada…</div>;
  }

  return <CallShell initialCtx={ctx} initialMessage={message} />;
}

