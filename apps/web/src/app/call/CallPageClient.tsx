// apps/web/src/app/call/CallPageClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CallShell from "@/components/CallShell";
import type { CallContext } from "shared-types/call.contract";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function CallPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const caseId = useMemo(() => searchParams.get("caseId"), [searchParams]);

  const [initialCtx, setInitialCtx] = useState<CallContext | null>(null);
  const [initialMessage, setInitialMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setError(null);

        const res = await fetch(
          `${API_BASE}/call/${encodeURIComponent(caseId)}`,
          { method: "GET" }
        );

        if (!res.ok) {
          throw new Error(`No se pudo cargar la llamada (${res.status})`);
        }

        const data = (await res.json()) as {
          ctx: CallContext;
          message: string;
        };

        if (cancelled) return;

        setInitialCtx(data.ctx);
        setInitialMessage(data.message);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError("No se pudo cargar la llamada. Vuelve a intentarlo.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [caseId, router]);

  // ---------- RENDER STATES ----------

  if (!caseId) return null;

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "#c00" }}>{error}</p>
        <button onClick={() => router.replace("/")}>Volver</button>
      </div>
    );
  }

  if (!initialCtx) {
    return (
      <div style={{ padding: 24 }}>
        <p>Cargando llamada…</p>
      </div>
    );
  }

  return (
    <CallShell
      initialCtx={initialCtx}
      initialMessage={initialMessage}
    />
  );
}
