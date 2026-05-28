# Phase 5-3 — Processing Review & Reason Taxonomy

## Objective

Introduce structured governance reasons and review-required continuity around `processing_active` without enabling any operational execution.

## Reason taxonomy

`lib/orchestration/processing/reasonTaxonomy.ts` defines categories including:

- runtime_stability
- governance_review
- dependency_blocker
- authorization_continuity
- elevated_risk
- sync_instability
- provider_instability
- execution_boundary_review
- manual_governance_pause
- advisory_review

Each reason provides severity, operational label, governance description, recommendation, and advisory-only semantics.

## Structured model

`ProcessingGovernanceReason` now records:

- category and severity
- title and description
- recommendation
- advisoryOnly
- createdAt

`ProcessingSession` now tracks:

- `activeReasons[]`
- `latestReviewReason`
- `reviewRequired`

## Review lifecycle

`processing_review_required` is a first-class processing governance state.

Flow examples:

- `processing_active` -> `processing_review_required` -> `processing_active`
- `processing_review_required` -> `processing_denied`
- `processing_review_required` -> `processing_revoked`

## Policy and continuity

`processingReviewPolicy.ts` adds:

- `requiresProcessingReview`
- `canResumeProcessing`
- `canDenyProcessing`
- `canRevokeProcessing`

Policy is recommendation-first and human-resolved. Automated revocation remains disabled.

## Scope boundary

- No code execution
- No MCP/GitHub/Claude Code execution
- No deployment automation
- No autonomous orchestration or background execution
