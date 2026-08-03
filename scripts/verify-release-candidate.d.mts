export interface ReleaseCandidateValidationInput {
  ledgerText: string;
  evidence: Record<string, unknown> | null;
  repository: Record<string, unknown>;
  operation: "build" | "install" | "upload";
  artifact?: Record<string, unknown>;
}

export function validateReleaseCandidate(
  input: ReleaseCandidateValidationInput
): string[];
