# Phase 21.6 — CEO Validation Loop & Activity Label Fix

## Activity labels

| Actor | Examples |
|-------|----------|
| COO Review | COO review started / completed / rerun |
| CEO Decision | CEO approval requested / approved / requested more validation / on hold |
| Product Planner | Planner received CEO validation request / updated analysis |

Legacy "CEO Review" activity rows are normalized at display time.

## Request More Validation flow

1. CEO sets `needs_validation` + `validationReason`
2. Planner re-validates Opportunity / CPF / PSF / Brief
3. COO Review reruns (prior report appended to `cooReviewHistory`)
4. `executiveDecision` returns to `awaiting_ceo_approval`
5. Architect stays locked until CEO approves

## Audit events (append-only)

- `human_ceo_decision`
- `validation_requested`
- `planner_revalidation_started` / `completed`
- `coo_review_rerun`
