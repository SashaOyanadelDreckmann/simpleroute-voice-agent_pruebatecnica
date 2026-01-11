"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CallShell from "@/components/CallShell";
import type { CallContext } from "shared-types/call.contract";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function CallPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [ctx, setCtx] = useState<CallContext | null>(null);
  const [message, setMessage] = useState("Cargando llamada…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) {
      setError("Missing caseId");
      return;
    }

    fetch(`${API_BASE}/call/${caseId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Call not found");
        return res.json();
      })
      .then((data) => {
        setCtx(data.ctx);
        setMessage(data.message);
      })
      .catch((err) => {
        console.error(err);
        setError("Call not found");
      });
  }, [caseId]);

  if (error) {
    return <div style={{ padding: 24 }}>{error}</div>;
  }

  if (!ctx) {
    return <div style={{ padding: 24 }}>Cargando llamada…</div>;
  }

  return <CallShell initialCtx={ctx} initialMessage={message} />;
}
