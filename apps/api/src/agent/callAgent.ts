// apps/api/src/agent/callAgent.ts
import OpenAI from "openai";
import type {
  CallContext,
  UserProfile,
} from "../types/call.types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ======================================================
   Agent Decision Contract (IA → Sistema)
====================================================== */
export interface AgentDecision {
  say: string;

  updates?: Partial<UserProfile>;

  validations?: {
    field: "name" | "email";
    confirmed: boolean;
  };

  // ⚠️ sugerencia semántica, NO control de estado
  done?: boolean;
}

/* ======================================================
   Main Agent Entry
====================================================== */
export async function decideNext(
  ctx: CallContext,
  userText: string
): Promise<AgentDecision> {
  // cortocircuito defensivo
  if (ctx.state === "DONE" || ctx.state === "ESCALATED") {
    return {
      say: "Gracias por tu tiempo. La llamada ha finalizado.",
      done: true,
    };
  }

  const systemPrompt = buildSystemPrompt(ctx);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Respuesta del usuario: "${userText}"`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "agent_decision",
        schema: {
          type: "object",
          properties: {
            say: { type: "string" },

            updates: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                address: { type: "string" },
              },
              additionalProperties: false,
            },

            validations: {
              type: "object",
              properties: {
                field: { type: "string", enum: ["name", "email"] },
                confirmed: { type: "boolean" },
              },
              additionalProperties: false,
            },

            done: { type: "boolean" },
          },
          required: ["say"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = completion.choices[0].message.content;

  if (!raw) {
    throw new Error("LLM returned empty response");
  }

  let decision: AgentDecision;
  try {
    decision = JSON.parse(raw) as AgentDecision;
  } catch {
    throw new Error("Failed to parse agent decision JSON");
  }

  return decision;
}

/* ======================================================
   System Prompt Builder
====================================================== */
function buildSystemPrompt(ctx: CallContext): string {
  const completedGoals =
    ctx.goalsCompleted.length > 0
      ? ctx.goalsCompleted.join(", ")
      : "ninguno";

  return `
Eres un agente de validación telefónica profesional de simpliroute, cordial y natural.

OBJETIVO GENERAL
Confirmar la identidad del usuario, validar su correo electrónico y registrar su dirección.

CONTEXTO ACTUAL
- Nombre esperado: ${ctx.profile.name ?? "desconocido"}
- Email registrado: ${ctx.profile.email ?? "no registrado"}
- Dirección registrada: ${ctx.profile.address ?? "no registrada"}
- Objetivos ya completados: ${completedGoals}

REGLAS CLAVE
- Tú NO controlas el estado de la llamada.
- Tú solo propones texto, actualizaciones y validaciones.
- El sistema decide cuándo terminar la llamada.

FORMATO DE RESPUESTA (OBLIGATORIO)
Responde EXCLUSIVAMENTE en JSON con esta estructura:

{
  "say": "texto que dirá el agente",
  "updates": { "email": "...", "address": "..." },
  "validations": { "field": "name", "confirmed": true },
  "done": false
}

No agregues texto fuera del JSON.
`;
}
