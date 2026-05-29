# Phase 10-3 — CEO Command Center

## 目的

CEO が複数 Workspace を行き来せず、**今どの製品がどこまで進み、何がレビュー待ちで、何を見ればよいか** を `/ceo-command-center` 一画面で把握する。

重要: **可視化のみ** — 自動指示・自動承認・自律実行は禁止。

## 追加ルート

- `/ceo-command-center`
- Query: `?mission={id}`

## セクション

1. **Executive Overview** — Active Ideas / Missions / Reviews / Release Candidates / Outcomes  
2. **Product Pipeline** — Idea → Brief → Mission → Architecture → Design → Development Plan → QA → Release（件数）  
3. **Review Attention** — Review Workspace 連携  
4. **Mission Attention** — COO Workspace 連携  
5. **Artifact Health** — Artifact Lineage 連携  
6. **Team Activity** — ロール別 Active Work / Reviews / Handoffs  
7. **Executive Feed** — Organization Feed 要約（Idea / Review / Delivery / Release）  
8. **Recommended Reading** — 推奨文言のみ（Approve Now 等は禁止）  
9. **CEO Daily Snapshot** — 日次サマリー  
10. **Mission Deep Links** — Lifecycle / Lineage / Review / Workspace  
11. **CEO Navigation Hub** — 全 Workspace へのリンク  

## Feed

- `ceo_snapshot_created`
- `ceo_command_center_viewed`
- `ceo_attention_context_updated`
- `ceo_workspace_snapshot`

## Persistence

`localStorage` key: `productai-ceo-command-center`

- `selectedMissionId`, `selectedView`, `selectedRole`, `selectedAttentionFilter`

## ライブラリ

- `lib/ceo-command/ceoCommandCenterWorkspace.ts`
- `lib/ceo-command/ceoCommandCenterAnalysis.ts`
- `lib/store/ceoCommandCenterStore.ts`
- `lib/hooks/useCeoCommandCenter.ts`

## Sidebar

- **CEO Command Center** → `/ceo-command-center`
