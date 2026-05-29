# Phase 10-1 — Artifact Lineage Workspace

## 目的

ProductAI のコア価値である **「なぜこの成果物が存在するのか」** を Mission 単位の一本の Lineage（系譜）として可視化する。

組織 OS から **Artifact OS** への移行の第一歩。説明責任のためのトレーサビリティのみ—自動承認・自動進行・自動最適化は行わない。

## 禁止事項（継続）

- Auto Approval / Auto Progression / Auto Optimization
- Autonomous Execution
- GitHub Actions / MCP Execution / Deployment

## 追加ルート

- `/artifact-lineage`
- Deep link: `/artifact-lineage?mission={id}&artifact={artifactId}`

## Artifact Lineage Model

`ArtifactLineageRecord`

| フィールド | 説明 |
|-----------|------|
| `lineageId` | `lineage-{missionId}` |
| `missionId` | Mission 参照 |
| `ideaId` | `idea-{missionId}` |
| `productBriefId` | `brief-{missionId}` |
| `missionPlanId` | `mpl-{missionId}` |
| `technicalSpecificationId` | `tspec-{missionId}` |
| `designSpecificationId` | `dspec-{missionId}` |
| `implementationPlanId` | `iplan-{missionId}` |
| `testPlanId` | `tplan-{missionId}` |
| `createdAt` / `updatedAt` | タイムスタンプ |

## Lineage Chain（表示順）

1. Idea  
2. Product Brief  
3. Mission Plan  
4. Technical Specification  
5. Design Specification  
6. Implementation Plan  
7. Test Plan  

## Workspace 構成

### 1. Lineage Overview

Mission、Current Lifecycle Stage、Current Team Role、Artifact Count、Last Updated。

### 2. Artifact Chain

縦方向チェーン。各ノード: Artifact Name、Type、Status、Last Updated、Owner Role。クリックで Inspector へ。

### 3. Artifact Inspector

Summary、Status、Related Mission、Related Reviews、Related Feed Events、Related Workspace。

### 4. Dependency Context

Parent Artifact、Child Artifact、Related Reviews、Related Lifecycle Stage。

### 5. Review Traceability

Artifact Review Workspace と連携。Review Status、History、Changes Requested、Approval Context。

### 6. Team Ownership

| Artifact | Owner Role |
|----------|------------|
| Product Brief | Planner |
| Mission Plan | Director |
| Technical Specification | Architect |
| Design Specification | Designer |
| Implementation Plan | Developer |
| Test Plan | QA |

## 統合

| 画面 | 追加内容 |
|------|----------|
| CEO Home | Artifact Lineage Overview カード |
| Mission Detail | Artifact Lineage Context パネル |
| Product Lifecycle / Mission Lifecycle Context | Current Lineage Position、Previous/Next Stage Artifact |
| Team Handoff | Artifact Lineage Context（Source → Destination） |
| Artifact Review | Open Artifact Lineage リンク |

## Feed イベント

- `artifact_lineage_created`
- `artifact_lineage_updated`
- `artifact_lineage_reviewed`
- `artifact_lineage_snapshot`

## Persistence

`localStorage` key: `productai-artifact-lineage`

- `selectedMissionId`
- `selectedArtifactId`
- `selectedView`

## ライブラリ

- `lib/lineage/artifactLineageRecord.ts`
- `lib/lineage/artifactChain.ts`
- `lib/lineage/teamOwnership.ts`
- `lib/lineage/dependencyContext.ts`
- `lib/lineage/reviewTraceability.ts`
- `lib/lineage/artifactInspector.ts`
- `lib/lineage/artifactLineageAnalysis.ts`
- `lib/store/artifactLineageStore.ts`
- `lib/hooks/useArtifactLineage.ts`

## Sidebar

- **Artifact Lineage** → `/artifact-lineage`
