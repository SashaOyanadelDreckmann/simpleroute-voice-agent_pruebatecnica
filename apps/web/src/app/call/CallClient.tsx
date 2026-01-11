"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startCall } from "@/lib/api";

export default function CallClient() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleStart() {
    if (!name) return;

    try {
      setLoading(true);
      setError(null);

      const res = await startCall(name);

      // 🔑 GUARDAR POR caseId (CLAVE)
      sessionStorage.setItem(
        `call:${res.caseId}`,
        JSON.stringify(res)
      );

      // 🔁 NAVEGAR CON caseId
      router.push(`/call?caseId=${res.caseId}`);
    } catch (err) {
      console.error(err);
      setError("Error iniciando la llamada. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
      />

      <button onClick={handleStart} disabled={loading}>
        {loading ? "Iniciando..." : "Continuar"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
