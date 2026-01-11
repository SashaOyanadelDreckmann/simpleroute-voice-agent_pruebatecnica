import type { CallContext } from "shared-types/call.contract";

export const callState = {
  ctx: null as CallContext | null,
  messages: [] as { role: "agent" | "user"; text: string }[],
};
