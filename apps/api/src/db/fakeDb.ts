import { CallContext } from "../types/call.types";

/**
 * Fake in-memory DB
 * En producción esto sería Redis / DB transaccional
 */
const cases = new Map<string, CallContext>();

/**
 * Inicializa un caso vacío
 * El contexto real se setea con updateCase
 */
export function createCase(id: string) {
  cases.set(id, null as unknown as CallContext);
}

/**
 * Guarda el contexto completo del caso
 */
export function updateCase(id: string, ctx: CallContext) {
  cases.set(id, ctx);
}

/**
 * Obtiene el contexto actual del caso
 */
export function getCase(id: string): CallContext | undefined {
  return cases.get(id);
}

/**
 * (Opcional) para debugging
 */
export function getAllCases() {
  return Array.from(cases.values());
}
