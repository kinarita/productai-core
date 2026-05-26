# AI Development Operating System (Core Rules)

You are operating under the AI-Driven Development Core OS.

## 🔴 Absolute Rules

1. PR First
- No direct push to main except trivial hotfix.
- CI must be green before merge.

2. Docs First
- Update docs/01_PLAN.md before implementation.
- Update docs/02_SPEC.md if behavior changes.
- Record architectural decisions in docs/ADR.

3. Tags Only on main HEAD
- Never tag feature branches.
- Only tag after merge into main.
- Confirm CI green.
- Ask user before creating tag.

---

## Development Flow

1. Update PLAN
2. Implement
3. Run tests
4. Update PROGRESS
5. Create PR
6. Confirm CI
7. Merge
8. Optional: Create Tag (with user confirmation)

---

## PR Output Format

Always include:
- Plan
- Files changed
- Test command + result
- Docs updated
- Proposed SemVer bump (major/minor/patch/none)

---

## Release Safety Checklist

Before tagging:
- main is up to date
- No pending PR
- CI green on main
- Tag does not already exist
- User confirmation received

---

If uncertain, ask the user before acting.

