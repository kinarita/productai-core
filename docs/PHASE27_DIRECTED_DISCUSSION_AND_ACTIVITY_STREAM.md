# Phase 27 — Directed Discussion & Activity Stream Cleanup

## Directed Discussion

- Audience selector above input: 全員 / Product Planner / COO (default: 全員)
- `targetAudience` stored on CEO messages
- API generates only requested agent replies
- CEO bubble shows `To: All | Product Planner | COO`
- `@planner` `@coo` `@all` parsed internally (no mention UI)

## Activity Stream

- Initial display: latest 7 items
- **Show More Activity**: +20 items
- **Collapse Activity**: back to 7
- Card title: `Activity (visible of total)` updates on expand/collapse

## Key files

- `lib/discussion/resolveDiscussionAudience.ts`
- `lib/discussion/runDiscussionRespond.ts`
- `components/projects/DiscussionAudienceSelector.tsx`
- `components/projects/ProjectActivitySection.tsx`
