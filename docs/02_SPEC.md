# ProductAI Specification v1

Version: 0.1
Status: Draft

---

# 1. Overview

ProductAI is an AI Product Organization Engine.

It enables humans to build software products through AI teams,
memory systems, mission-driven workflows, and reflection-based improvement.

ProductAI is not just an AI coding tool.

It is an AI organization designed to continuously create, improve,
and operate product development workflows.

---

# 2. Philosophy

## Small is Beautiful

- Start small
- Keep systems understandable
- Avoid unnecessary complexity
- Prefer local-first architecture

---

## Human-in-the-loop

Humans define:
- Vision
- Meaning
- Final judgment
- Product philosophy

AI supports:
- Execution
- Organization
- Reflection
- Continuous improvement

---

## Memory is Intelligence

Knowledge accumulation is essential.

ProductAI stores:
- Decisions
- Reflections
- Failures
- Successes
- Operational learnings

to continuously improve future development.

---

## Reflection-driven Growth

Reflection is part of the development lifecycle.

Every mission should generate:
- lessons learned
- architecture insights
- operational knowledge
- future recommendations

---

# 3. Core Structure

```text
Human CEO
    ↓
AI COO
    ↓
Mission Product Teams
```

---

# 4. Mission Model

1 Mission = 1 Product Team

Each mission contains:

- Independent memory
- Independent task queue
- Independent workers
- Independent GitHub repository
- Reflection history
- Operational feedback

---

# 5. AI COO

The COO manages:

- Planning
- Task decomposition
- Worker assignment
- Progress tracking
- Risk management
- Review orchestration

The COO does NOT make:
- final business decisions
- company vision changes
- release authority decisions

---

# 6. Worker Agents

## Architect Agent

Responsible for:
- architecture
- technology selection
- design consistency

---

## Developer Agent

Responsible for:
- implementation
- refactoring
- testing
- bug fixing

---

## Designer Agent

Responsible for:
- UI/UX
- design systems
- layouts
- visual consistency

---

## QA / Reviewer Agent

Responsible for:
- code review
- regression checking
- diff inspection
- release quality

---

## Memory Manager Agent

Responsible for:
- storing lessons
- reflection summaries
- knowledge retrieval
- suggested recall

---

## Repository Manager Agent

Responsible for:
- GitHub operations
- branch management
- pull requests
- release tagging

---

## Support Agent

Responsible for:
- incidents
- user feedback
- FAQ generation
- support reports

---

# 7. Memory Architecture

## Local-first

Memory should primarily remain local.

---

## Memory Layers

### Raw Memory

Stores:
- prompts
- logs
- conversations
- diffs

---

### Semantic Memory

Stores:
- summaries
- lessons learned
- reflections
- decisions

---

### Wisdom Layer

Stores:
- long-term philosophy
- reusable knowledge
- organization-wide wisdom

---

# 8. GitHub Strategy

GitHub is the official source of truth for code.

---

## Branch Model

main
develop
feature/*
fix/*
release/*

---

## Workflow

CEO Request
↓
COO Planning
↓
Developer Implementation
↓
QA Review
↓
PR Creation
↓
CEO Approval
↓
Merge
↓
Reflection

---

# 9. Dashboard Philosophy

ProductAI uses a Dashboard-based Mission Control UI.

The dashboard should visualize:

- Mission status
- Worker activity
- Risks
- GitHub state
- Memory insights
- Incident reports

---

# 10. Operational Interface

ProductAI should be capable of receiving:

- incidents
- support requests
- operational feedback
- KPI summaries

for future product improvements.

---

# 11. Technical Direction

Frontend:
- Web-based UI
- React / Next.js

Backend:
- Python
- FastAPI

Memory:
- SQLite
- Markdown

AI Runtime:
- Claude Code
- OpenAI
- Codex (future)

---

# 12. Long-term Vision

ProductAI aims to become:

An AI Product Organization Platform
that enables anyone to create software products
through AI-supported organizational intelligence.
