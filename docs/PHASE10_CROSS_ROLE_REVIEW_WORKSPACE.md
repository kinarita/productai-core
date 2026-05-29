# Phase 10-2 — Cross-Role Review Workspace

## 目的

Product Brief / Mission Plan / Architecture / Design / Development / QA のレビュー活動を横断的に可視化し、CEO が **どの成果物が誰のレビュー待ちか** を一画面で把握できるようにする。

重要: **レビュー状況の可視化のみ**。自動承認・自動優先順位付け・自律実行は禁止。

## 追加ルート

- `/review-workspace`
- Deep link: `/review-workspace?artifact={artifactId}`（`mission` / `review` も可）

## Review Model

`CrossRoleReviewRecord`

| フィールド | 説明 |
|-----------|------|
| `reviewId` | `review-{artifactId}` |
| `artifactId` | 成果物 ID |
| `artifactType` | `ReviewTargetTypeId` |
| `missionId` | Mission |
| `ownerRole` | オーナーロール |
| `reviewerRole` | レビュー担当ロール（handoff の receivesFrom） |
| `reviewState` | 共通 7 状態 |
| `createdAt` / `updatedAt` | タイムスタンプ |

## Review States（共通）

Draft · Ready For Review · In Review · Review Requested · Changes Requested · Approved · Archived

## Workspace 構成

1. **Review Overview** — Total / Pending / In Review / Changes Requested / Approved  
2. **Review Board** — Artifact, Type, Mission, Owner, Reviewer, State, Updated + フィルタ  
3. **Role Review Matrix** — Planner〜QA × Requested / In Progress / Completed  
4. **Review Inspector** — Summary, History, Feed, Workspaces, Lineage  
5. **Review Dependencies** — Lineage 連携の依存チェーン  
6. **Review Traceability** — Requested By, Reviewed By, Feed  
7. **Review Concentration** — By Role / Mission / Type（推奨文言のみ）

## 統合

| 画面 | 内容 |
|------|------|
| CEO Home | Review Overview カード |
| Artifact Lineage | Open Review Context |
| Mission Detail | Review Context パネル |
| Team Handoff | Review Context（Timeline） |
| Artifact Review | Review Workspace リンク |

## Feed

- `review_workspace_created`
- `review_context_updated`
- `review_traceability_updated`
- `review_snapshot`

## Persistence

`localStorage` key: `productai-review-workspace`

- `selectedMissionId`, `selectedArtifactId`, `selectedReviewId`, `selectedView`, `selectedRole`

## ライブラリ

- `lib/cross-review/crossRoleReviewRecord.ts`
- `lib/cross-review/crossRoleReviewAnalysis.ts`
- `lib/cross-review/reviewDependencies.ts`
- `lib/store/crossReviewWorkspaceStore.ts`
- `lib/hooks/useCrossReviewWorkspace.ts`
