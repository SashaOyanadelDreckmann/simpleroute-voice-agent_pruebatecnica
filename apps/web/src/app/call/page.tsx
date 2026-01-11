import { Suspense } from "react";
import CallClientPage from "./CallClientpage";

export default function CallPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando llamada…</div>}>
      <CallClientPage />
    </Suspense>
  );
}
