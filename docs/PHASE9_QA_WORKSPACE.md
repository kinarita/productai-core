# Phase 9-9 — QA Workspace

## 目的

ProductAI のワークフローを

CEO → Product Planner → Director → Architect → Designer → Developer → QA Reviewer

まで連結し、**品質保証（QA）の計画整理**を行うための可視化 Workspace を追加する。

重要: QA は **テスト実行担当ではない**。本フェーズは **quality planning only** を維持する。

## 禁止事項（継続）

- Auto Testing
- Auto QA Approval / Auto Release Approval
- Auto Repository Changes / Auto Pull Request
- Autonomous Execution
- GitHub Actions / MCP Execution / Deployment

## 追加ルート

- `/qa-workspace`

## 入力（Phase 9-8 から）

Developer Workspace 由来の内容を QA の前提として表示する。

- Implementation Plan（summary / scope）
- Repository Plan（review & documentation strategy）
- Technical Risks（constraints / open questions）
- Development Review Context（review notes）

## QA Workspace 構成

### 1. Development Intake

表示（可視化のみ）:

- Mission Name
- Implementation Summary
- Frontend Scope / Backend Scope / Database Scope / AI Scope
- Technical Risks

### 2. Test Plan

モデル: `TestPlanRecord`

- `testPlanId`
- `missionId`
- `title`
- `objectives`
- `scope`
- `testAreas`
- `assumptions`
- `exclusions`
- `createdAt`
- `updatedAt`

Artifact Review deep link:

- `/artifact-review?artifact={missionId}-test_plan`

### 3. Validation Checklist

表示:

- Functional Validation
- UX Validation
- Integration Validation
- Data Validation
- Security Review
- Documentation Review

状態:

- `planned`
- `in_review`
- `completed`

### 4. Acceptance Criteria

表示:

- Criterion
- Related Feature
- Validation Notes

### 5. Quality Risk Review

表示（推奨のみ）:

- Quality Risks
- Validation Gaps
- Integration Concerns
- Regression Concerns
- Open QA Questions

自動判定はしない。

### 6. Release Validation

表示（Release Workspace の前提情報として利用）:

- QA Checklist Status
- Validation Coverage
- Open Risks
- Review Notes

実行はしない。

### 7. QA Readiness

Readiness Areas:

- Test Plan Available
- Acceptance Criteria Defined
- Validation Checklist Available
- Quality Risks Reviewed
- Release Validation Prepared
- Review Notes Available

Status:

- Not Ready
- Preparing
- Review Candidate
- Ready For Release Review

推奨のみ。自動承認は禁止。

## 統合

### CEO Home

- Quality Overview カード追加
  - Test Plans / QA Reviews / Validation Risks / Release Review Candidates
  - Link: Open QA Workspace

### Developer Workspace

- QA Handoff Context パネル追加（可視化）
  - Implementation Plan / Technical Risks / QA Readiness

### Mission Detail

- Quality Context パネル追加
  - Test Plan / Validation Checklist / Acceptance Criteria / QA Readiness

### Release Readiness Workspace

- QA Validation Context を追加し、Release Readiness の前提情報として参照

## Feed Integration

追加イベント:

- `test_plan_created`
- `qa_review_requested`
- `quality_risk_identified`
- `qa_review_completed`
- `qa_snapshot`

`data/mockData.ts` に seed を追加し、Organization Feed のラベル/variant を拡張。

## Persistence

localStorage:

- `productai-qa-workspace`

保存:

- `selectedMissionId`
- `selectedTestPlanId`
- `selectedView`
- `selectedReviewState`

## 完了条件

以下が成立し、企画 → 設計 → 実装計画 → 品質保証（計画）まで一貫して可視化できること。

Idea → Product Brief → Mission Plan → Technical Specification → Design Specification → Implementation Plan → Test Plan → Ready For Release Review

