# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

### Added

- Phase 20: Problem Solution Fit Engine — `ProblemSolutionFitReport`, MVP MoSCoW panel, PSF API
- `ProblemSolutionFitCard`, validation/MVP discovery insights, PSF audit and activity events
- `docs/PHASE20_PROBLEM_SOLUTION_FIT_ENGINE.md`
- Phase 19: Customer Problem Fit Engine — `CustomerProblemFitReport` after Opportunity Discovery
- CPF API, `CustomerProblemFitCard`, pain/burning insights, CPF audit fields and activity events
- `docs/PHASE19_CUSTOMER_PROBLEM_FIT_ENGINE.md`
- Phase 18: Opportunity Discovery Engine — `OpportunityBrief` before Product Brief
- `opportunity_discovery` PMF stage; `opportunities` / `threats` in discovery insights
- `OpportunityBriefCard`, `ShouldWeBuildCard`; audit fields for opportunity scoring
- `POST /api/agents/planner/opportunity`; `docs/PHASE18_OPPORTUNITY_DISCOVERY_ENGINE.md`
- Phase 17: Discovery Mode (`quick` / `guided`) in project creation wizard
- PMF Journey model (`lib/pmf/pmfJourney.ts`) with readiness scores and mission fields
- Planner gap analysis: strengths, gaps, next actions; assumption-first clarification caps
- `PMFJourneyPanel` on project hub and `PmfJourneyDashboardCard` on projects dashboard
- PMF fields on agent audit records; discovery activity feed events
- `docs/PHASE17_DISCOVERY_MODE_AND_PMF_JOURNEY.md`

### Changed

- Planner timeline extended with Discovery, Problem, Solution, and MVP stages
- Planner prompts bumped to `planner-v6` (PSF + CPF + Opportunity Discovery + PMF journey)
- Phase 17 UX polish: discovery mode on home hero (まず形にする / しっかり考える), 4-step wizard, Japanese CTAs, 作る価値チェック labels


### Fixed
-

