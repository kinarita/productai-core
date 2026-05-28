import type { ProcessingGovernanceReason, ProcessingStatus } from "@/lib/orchestration/processing/processingTypes";

interface ProcessingReviewGateInput {
  processingStatus: ProcessingStatus;
  reason?: ProcessingGovernanceReason;
  runtimeLockActive?: boolean;
  unresolvedBlocker?: boolean;
  continuityValid?: boolean;
}

export function requiresProcessingReview(
  input: ProcessingReviewGateInput
): { required: boolean; reason: string } {
  if (input.runtimeLockActive) {
    return { required: true, reason: "Runtime instability trigger requires processing review." };
  }
  if (input.unresolvedBlocker) {
    return { required: true, reason: "Blocker escalation requires governance review." };
  }
  if (input.continuityValid === false) {
    return { required: true, reason: "Governance continuity issue requires review." };
  }
  if (input.reason?.severity === "critical_review" || input.reason?.severity === "elevated") {
    return { required: true, reason: "Elevated risk reason requires review." };
  }
  return { required: false, reason: "No mandatory review trigger detected." };
}

export function canResumeProcessing(
  input: ProcessingReviewGateInput
): { allowed: boolean; reason: string } {
  if (input.processingStatus !== "processing_review_required" && input.processingStatus !== "processing_paused") {
    return { allowed: false, reason: "Only review-required or paused processing can be resumed." };
  }
  if (input.runtimeLockActive) {
    return { allowed: false, reason: "Runtime lock advisory remains active." };
  }
  if (input.continuityValid === false) {
    return { allowed: false, reason: "Governance continuity remains invalid." };
  }
  return { allowed: true, reason: "Processing governance continuity can resume." };
}

export function canDenyProcessing(
  input: ProcessingReviewGateInput
): { allowed: boolean; reason: string } {
  if (input.processingStatus !== "processing_review_required") {
    return { allowed: false, reason: "Processing denial requires review-required status." };
  }
  return { allowed: true, reason: "Processing governance may be denied by human decision." };
}

export function canRevokeProcessing(
  input: ProcessingReviewGateInput
): { allowed: boolean; reason: string } {
  const revocable =
    input.processingStatus === "processing_review_required" ||
    input.processingStatus === "processing_active" ||
    input.processingStatus === "processing_prepared";
  if (!revocable) {
    return { allowed: false, reason: "Only prepared, active, or review-required processing can be revoked." };
  }
  return { allowed: true, reason: "Processing governance can be revoked with explicit human action." };
}
