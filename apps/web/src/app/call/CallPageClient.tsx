// apps/web/src/app/call/page.tsx
"use client";

import { useEffect, useState } from "react";
import CallShell from "@/components/CallShell";
import type { CallContext } from "shared-types/call.contract";

export default function CallPage() {
  const [ctx, setCtx] = useState<CallContext | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem("call:init");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    setCtx(parsed.ctx);
    setMessage(parsed.message);
  }, []);

  if (!ctx) {
    return <div style={{ padding: 24 }}>Cargando llamada…</div>;
  }

  return <CallShell initialCtx={ctx} initialMessage={message} />;
}
