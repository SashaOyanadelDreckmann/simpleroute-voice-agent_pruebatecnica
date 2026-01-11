"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (!name.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/call/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        throw new Error("No se pudo iniciar la llamada");
      }

      const data = (await res.json()) as {
        caseId: string;
        firstMessage: string;
      };

      router.push(`/call?caseId=${encodeURIComponent(data.caseId)}`);
    } catch (err) {
      console.error(err);
      setError("Error iniciando la llamada. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <main
        className={styles.main}
        style={{
          justifyContent: "flex-start", // ⬅️ evita que todo se vaya abajo
          gap: 56,
        }}
      >
        {/* ===============================
            INTRO
        ================================ */}
        <div className={styles.intro}>
          <h1>
            Prototipo basico para prueba tecnica
            <br />
            SimpliRoute
          </h1>

          <p>
            Este proyecto demuestra un agente de voz orientado a validación basico,
            diseñado con control de estado, trazabilidad y separación
            estricta entre lógica de negocio e IA generativa.
          </p>

          <p>
            La interacción simula una llamada real, donde el sistema confirma
            identidad, valida datos y registra información en tiempo
            real.
          </p>
        </div>

        {/* ===============================
            CTAs (subidos y claros)
        ================================ */}
        <div
          className={styles.ctas}
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 14,
            marginTop: 8,
          }}
        >
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 320,
              height: 44,
              padding: "0 16px",
              borderRadius: 10,
              border: "1px solid var(--button-secondary-border)",
              background: "rgba(255,255,255,0.06)",
              color: "var(--text-primary)",
              fontSize: 14,
            }}
          />

          <button
            onClick={handleStart}
            disabled={loading}
            className={styles.primary}
            style={{
              height: 44,
              padding: "0 24px",
              borderRadius: 999,
              background: "var(--sr-purple)", // 💜 SimpliRoute
              color: "#fff",
              fontWeight: 500,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.25s ease",
            }}
          >
            {loading ? "Iniciando…" : "Continuar"}
          </button>

          {error && (
            <span
              style={{
                marginTop: 6,
                color: "#ff6b6b",
                fontSize: 13,
              }}
            >
              {error}
            </span>
          )}

          <a
            href={`${API_BASE}/health`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
            style={{
              marginTop: 12,
              opacity: 0.8,
            }}
          >
            Estado del sistema
          </a>
        </div>
      </main>
    </div>
  );
}
