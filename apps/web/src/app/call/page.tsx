// apps/web/src/app/call/page.tsx
import { Suspense } from "react";
import CallPageClient from "./CallPageClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 24 }}>
          <p>Cargando llamada…</p>
        </div>
      }
    >
      <CallPageClient />
    </Suspense>
  );
}
