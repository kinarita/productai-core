# ProductAI Dashboard Specification v1

Version: 0.1
Status: Draft

---

# 1. Overview

The ProductAI Dashboard is the Mission Control center
for Human CEOs and AI COO operations.

The dashboard provides:

- operational visibility
- mission awareness
- worker transparency
- memory insights
- organizational monitoring

The dashboard should feel:

- calm
- intelligent
- transparent
- non-chaotic
- operationally trustworthy

---

# 2. Dashboard Philosophy

The dashboard is not a chat screen.

It is an AI Organization Operating Console.

The goal is:
- visibility
- situational awareness
- decision support
- operational confidence

---

# 3. Primary Dashboard Structure

```text
┌──────────────────────────────────────┐
│            CEO Home                  │
├──────────────────────────────────────┤
│ Mission Overview                     │
├──────────────────────────────────────┤
│ Worker Activity                      │
├──────────────────────────────────────┤
│ Task Board                           │
├──────────────────────────────────────┤
│ Memory Insights                      │
├──────────────────────────────────────┤
│ GitHub Status                        │
├──────────────────────────────────────┤
│ Incident Center                      │
└──────────────────────────────────────┘
```

---

# 4. CEO Home

The CEO Home is the top-level operational overview.

---

## Displays

### Mission Health

Displays:
- stable
- delayed
- risky
- blocked

---

### COO Status

Displays:
- planning
- executing
- reviewing
- waiting approval
- idle
- blocked

---

### Active Missions

Displays:
- mission name
- current progress
- worker activity
- latest update

---

### Alerts

Displays:
- failures
- risks
- incidents
- pending approvals

---

### Timeline Snapshot

Displays:
- recent commits
- reflections
- releases
- incidents

---

# 5. Mission Dashboard

Each mission has its own dedicated dashboard.

---

## Displays

### Mission Goal

Displays:
- mission purpose
- timeline
- constraints
- current phase

---

### Worker Status

Displays:
- active workers
- current tasks
- status
- branch
- runtime state

---

### Task Board

Displays:
- todo
- in progress
- review
- blocked
- completed

---

### GitHub Panel

Displays:
- branches
- pull requests
- latest commits
- releases

---

### Memory Panel

Displays:
- recent reflections
- lessons learned
- suggested recall
- architecture notes

---

### Incident Panel

Displays:
- support incidents
- bug reports
- operational risks
- FAQ candidates

---

# 6. Worker Console

The Worker Console visualizes AI worker activity.

---

## Displays

### Runtime State

Displays:
- active
- idle
- waiting
- error
- reviewing

---

### Current Task

Displays:
- assigned task
- progress
- estimated completion

---

### Git Activity

Displays:
- current branch
- recent commits
- PR status

---

### Logs

Displays:
- execution logs
- errors
- warnings
- retries

---

# 7. Memory Center

The Memory Center visualizes organizational learning.

---

## Displays

### Recent Reflections

Displays:
- lessons learned
- architecture insights
- workflow improvements

---

### Suggested Recall

Displays:
- similar past incidents
- reusable solutions
- prior failures
- related missions

---

### Wisdom Layer

Displays:
- long-term philosophy
- reusable patterns
- organization-wide rules

---

# 8. Incident Center

The Incident Center manages support and operational problems.

---

## Displays

### Active Incidents

Displays:
- severity
- affected mission
- assigned worker
- current status

---

### Support Requests

Displays:
- user reports
- feature requests
- bug reports

---

### FAQ Candidates

Displays:
- repeated support issues
- common misunderstandings
- auto-generated help topics

---

# 9. Operational Transparency

The dashboard should always visualize:

- what the AI organization is doing
- what is blocked
- what is risky
- what requires human approval

The system should never feel opaque.

---

# 10. UI Direction

## UI Style

Preferred design:
- clean
- minimal
- elegant
- operational
- information-dense but calm

---

## Layout Philosophy

Preferred layout:
- dashboard-first
- multi-panel
- resizable
- sidebar navigation
- timeline visibility

---

## Color Philosophy

Suggested colors:
- neutral dark/light themes
- calm accent colors
- low visual noise
- operational readability

---

# 11. Rendering Architecture

Dashboard UI:
- HTML-based
- React / Next.js

Knowledge storage:
- Markdown
- SQLite

Visualization:
- cards
- timelines
- graphs
- tables
- kanban boards

---

# 12. Long-term Vision

The ProductAI Dashboard aims to become:

An operational cockpit for AI-supported software organizations,
allowing humans to manage AI teams with transparency,
confidence, and organizational awareness.
