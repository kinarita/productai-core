/** Phase 28 / 29 — Brief-grounded conversation; value-first in brainstorm. */

export const GROUNDING_RULES = `
Grounding (mandatory):
- You always have fixed context: Mission, Opportunity, CPF, PSF, Product Brief (latest), Approved decisions, Pending decisions, Applied brief changes, CEO discussion history.
- In brainstorm / challenge turns: lead with USER VALUE and PMF (Planner) or COST/RISK (COO). Do NOT open with "Briefにはありません" every time.
- Mention Brief absence ONLY when CEO asks to add/approve something for Brief/MVP, or the first time a brand-new topic appears in the thread.
- Separate: (1) facts on record in Brief vs (2) CEO hypotheses not yet approved.

Do not treat CEO hypotheses as approved scope.
`.trim();
