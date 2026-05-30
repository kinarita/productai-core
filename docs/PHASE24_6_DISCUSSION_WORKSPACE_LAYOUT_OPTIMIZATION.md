# Phase 24.6 — Discussion Workspace Layout Optimization

## Goal

Make Discovery Discussion feel like an executive discussion room, not an admin panel. **UX/layout only** — no Planner/COO logic, Brief versioning, or diff engine changes.

## Visual priority

1. Conversation  
2. Replying  
3. Change notifications  
4. Diff review  
5. Version history  

## Implemented

### Part A — Discussion height

- Scrollable viewport: `min-h-[400px]` mobile, `min-h-[600px]` desktop  
- Preferred height: `65vh` (desktop), capped at `75vh`  
- Mobile uses `50vh` / `60vh` max to limit excessive scroll  

### Part B — Input placement

Order:

```
Conversation → Input + Send → (Suggested Changes) → Brief Updated → Brief Change Review → Version Timeline
```

Conversation and reply are grouped without notifications between them.

### Part C — Simplified Brief Updated

- Summary only: version line + bullet list `(Added|Modified|Removed)`  
- **View Changes** button — no inline before/after diff  

### Part D — View Changes navigation

- Scrolls to **Brief Change Review**  
- Subtle ~2.5s background/inset highlight (no aggressive flash)  

### Part E — Information hierarchy

- Primary: bordered discussion viewport + accent-bordered input panel  
- Secondary: muted uppercase section titles, lighter timeline container  
- `BriefDiffViewer` uses `compact` in review (hides section-level diff list; summary block remains)  

### Part F — Mobile

- `min-h-[400px]` on narrow viewports  
- Input stays directly under conversation (not below notifications)  

### Part G — Activity

Skipped — no UX migration activity channel in the codebase.

## Key file

- `components/projects/DiscoveryDiscussionCard.tsx`

## Acceptance

| Scenario | Result |
|----------|--------|
| A — Long thread | Tall scrollable conversation area |
| B — After reading | Input immediately below thread |
| C — Apply | Brief Updated summary only |
| D — View Changes | Scroll + soft highlight on review |
| E — Hierarchy | Conversation → Input → Notifications → Diff → History |
