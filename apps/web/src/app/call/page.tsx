"use client";

import { Suspense } from "react";
import CallClient from "./CallClient";

export default function CallPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando llamada…</div>}>
      <CallClient />
    </Suspense>
  );
}
