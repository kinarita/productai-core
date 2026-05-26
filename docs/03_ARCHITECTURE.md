# ProductAI Architecture v1

Version: 0.1
Status: Draft

---

# 1. Overview

ProductAI is an AI Product Organization Platform.

The system is designed around:
- Human leadership
- AI organizational execution
- Mission-based product teams
- Memory-driven improvement
- Reflection-centered learning

---

# 2. High-level Architecture

```text
Human CEO
    ↓
AI COO
    ↓
Mission Product Teams
    ├─ Architect Agent
    ├─ Developer Agent
    ├─ Designer Agent
    ├─ QA Agent
    ├─ Memory Manager
    ├─ Repository Manager
    └─ Support Agent
```

---

# 3. Core System Layers

```text
┌─────────────────────────────┐
│        Dashboard UI         │
├─────────────────────────────┤
│        COO Layer            │
├─────────────────────────────┤
│      Worker Agent Layer     │
├─────────────────────────────┤
│      Mission Management     │
├─────────────────────────────┤
│        Memory Layer         │
├─────────────────────────────┤
│     GitHub / Repository     │
├─────────────────────────────┤
│     Local Runtime Layer     │
└─────────────────────────────┘
```

---

# 4. Dashboard Layer

The Dashboard acts as Mission Control.

Responsibilities:
- Mission monitoring
- Worker visibility
- Risk visualization
- GitHub visibility
- Operational transparency
- Memory insights
- Incident tracking

---

# 5. COO Layer

The AI COO orchestrates the organization.

Responsibilities:
- Mission planning
- Task decomposition
- Worker assignment
- Progress monitoring
- Review coordination
- Risk escalation

The COO does not replace human leadership.

---

# 6. Worker Layer

Workers execute tasks.

## Worker Types

### Architect Agent
- system design
- architecture consistency
- technical decisions

### Developer Agent
- implementation
- testing
- refactoring
- debugging

### Designer Agent
- UI/UX
- visual systems
- layout refinement

### QA Agent
- code review
- regression detection
- release quality

### Memory Manager
- lesson storage
- reflection generation
- recall suggestions

### Repository Manager
- GitHub operations
- branching
- PR management
- releases

### Support Agent
- incident management
- support reports
- FAQ generation

---

# 7. Mission Management Layer

1 Mission = 1 Product Team

Each mission contains:

- isolated memory
- isolated workers
- isolated GitHub repository
- isolated task queue
- operational history
- reflection history

Mission examples:
- AI Browser
- ProductAI Dashboard
- Landing Page Builder
- BusinessAI

---

# 8. Memory Architecture

## Philosophy

Memory is the foundation of organizational intelligence.

---

## Memory Layers

### Raw Memory

Stores:
- prompts
- logs
- conversations
- diffs
- events

---

### Semantic Memory

Stores:
- summaries
- reflections
- lessons learned
- decisions

---

### Wisdom Layer

Stores:
- long-term philosophy
- reusable organization knowledge
- strategic insights

---

# 9. GitHub Layer

GitHub acts as the official source of truth.

Responsibilities:
- code versioning
- pull requests
- releases
- branch management
- changelog management

---

## Branch Model

```text
main
develop
feature/*
fix/*
release/*
```

---

# 10. Operational Interface

ProductAI should support future integration with operational systems.

Inputs:
- incidents
- customer feedback
- support tickets
- KPI summaries
- uptime alerts

Outputs:
- improvement recommendations
- FAQ generation
- operational reports
- roadmap suggestions

---

# 11. BusinessAI Integration

Future architecture:

```text
ProductAI
    ↕
Operational Memory Bus
    ↕
BusinessAI
```

ProductAI:
- build responsibility

BusinessAI:
- operational responsibility

---

# 12. Rendering Architecture

Knowledge should be separated from presentation.

```text
Markdown Memory
      ↓
Rendering Engine
      ↓
HTML Dashboard UI
```

---

## Storage Format

Primary storage:
- Markdown
- SQLite

Primary UI:
- HTML
- React / Next.js

---

# 13. Technical Stack

Frontend:
- React
- Next.js
- Tailwind

Backend:
- Python
- FastAPI

Database:
- SQLite

Memory:
- Markdown
- Vector Search

AI Runtime:
- Claude Code
- OpenAI
- Codex (future)
- Local LLMs (future)

---

# 14. Long-term Vision

ProductAI aims to become:

A scalable AI Product Organization Platform
that enables individuals and small teams
to operate AI-supported software organizations.
