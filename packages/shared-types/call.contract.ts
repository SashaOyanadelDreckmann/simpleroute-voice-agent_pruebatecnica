export type CallState =
  | "PRE_CALL"        // nombre ingresado, aún no comienza la llamada
  | "IN_CALL"         // llamada activa
  | "ESCALATED"       // derivado a humano
  | "DONE";           // llamada finalizada

  export type CallGoal =
  | "NAME_CONFIRMED"
  | "EMAIL_CONFIRMED"
  | "ADDRESS_COLLECTED";

export interface UserProfile {
  name?: string;
  email?: string;
  address?: string;

  confirmedName?: boolean;
  confirmedEmail?: boolean;
}

export interface CallContext {
  caseId: string;

  state: CallState;

  // objetivos ya logrados
  goalsCompleted: CallGoal[];

  // datos recolectados / validados
  profile: UserProfile;
}

export interface StartCallRequest {
  name: string;
}

export type StartCallResponse = {
  caseId: string;
  firstMessage: string;
};