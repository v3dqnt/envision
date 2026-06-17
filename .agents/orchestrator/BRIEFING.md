# BRIEFING — 2026-06-16T22:56:09Z

## Mission
Build ENVIS, the Crisis-to-Action Translator, using a dual-track Project Orchestrator pattern.

## 🔒 My Identity
- Archetype: teamwork (orchestrator, user_liaison, human_reporter, successor)
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\.agents\orchestrator
- Original parent: top-level
- Original parent conversation ID: ea5aac72-8bed-43f4-a1e9-8360161e13b9

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\.agents\orchestrator\PROJECT.md
1. **Decompose**: Decompose the project into milestones (E2E testing track and implementation track) and record in PROJECT.md.
2. **Dispatch & Execute** (pick ONE):
   - **Delegate (sub-orchestrator)**: Spawn sub-orchestrators for milestones.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns. Write handoff.md, spawn successor, and exit.
- **Work items**:
  1. Decompose & Plan [pending]
  2. Implement E2E tests [pending]
  3. Implement Core features [pending]
  4. Integration & Adversarial Hardening [pending]
- **Current phase**: 1
- **Current focus**: Decompose & Plan

## 🔒 Key Constraints
- Never write, modify, or create source code files directly.
- Never run build/test commands yourself — require workers to do so.
- If a Forensic Auditor reports INTEGRITY VIOLATION, the milestone FAILS UNCONDITIONALLY.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh

## Current Parent
- Conversation ID: ea5aac72-8bed-43f4-a1e9-8360161e13b9
- Updated: not yet

## Key Decisions Made
- Use Project Orchestrator pattern.
- Dual-track execution: E2E testing track and implementation track.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| E2E Testing Orch | self | Test Suite & Harness | completed | bf626df8-e57c-4554-9ed4-67d9551a0f63 |
| Impl Orch | self | Next.js Implementation | in-progress | 7a44050b-f92d-4fdb-bc76-84355bfa8448 |

## Succession Status
- Succession required: no
- Spawn count: 2 / 16
- Pending subagents: [bf626df8-e57c-4554-9ed4-67d9551a0f63, 7a44050b-f92d-4fdb-bc76-84355bfa8448]
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-15
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\.agents\orchestrator\PROJECT.md — Global index: architecture, milestones, interfaces, code layout
- c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\.agents\orchestrator\progress.md — Status tracking and heartbeat
