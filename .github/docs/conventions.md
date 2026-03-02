# Project Conventions

Shared conventions referenced by all agents. Update this file — not individual agent files — when changing shared patterns.

---

## Model Tier Strategy (Cost Optimization)

| Tier | Model | Use When |
|---|---|---|
| **T1 — Fast & Cheap** | `GPT-5 mini` | Structured output, pattern matching, template-based work, OWASP checklists, test generation, backlog updates, task decomposition |
| **T2 — Balanced** | `GPT-4.1` | Orchestration, architecture decisions, user-facing strategy, complex multi-step reasoning |
| **T3 — Quality** | `Claude Sonnet 4.5` | Code generation where output quality directly impacts the product |

**Rule**: Default to T1. Escalate only when the task requires reasoning beyond pattern-matching or the output has long-term structural impact.

---

## Pipeline Context File

Every feature pipeline maintains a shared context file that all agents read and update:

**Location**: `docs/pipeline-context/[FEAT-ID]-context.json`

**Schema**:
```json
{
  "feat_id": "FEAT-003",
  "version": 1,
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "git_branch": "feat/FEAT-003-task-management-api",
  "deployment_scope": "local | staging | production",
  "requires_devops": false,
  "stages_completed": ["requirement_analysis", "architecture"],
  "requirement_spec": "docs/requirement-specs/FEAT-003-spec.md",
  "openapi_spec": "docs/api-specs/FEAT-003-openapi.yaml",
  "architecture_notes": "short summary of key decisions",
  "task_manifest": "docs/task-manifests/FEAT-003-tasks.json",
  "generated_files": [
    { "path": "src/models/task.ts", "task_id": "TASK-001", "action": "created" }
  ],
  "security_findings": [],
  "test_results": { "unit_coverage": 0, "integration_pass": false },
  "api_contract_validated": false,
  "retrospective": "docs/pipeline-logs/FEAT-003-retro.md"
}
```

**Protocol**:
- **RequirementAnalyzer** initializes the file with `feat_id`, `version: 1`, `git_branch`, `deployment_scope`
- Each agent reads the context file at the start of its work
- Each agent updates `stages_completed` and its own output fields when done
- **Conductor** is the only agent that updates `version` (increments on each stage completion)
- Never write to the context file without reading it first (optimistic concurrency: check `version` matches before writing)

---

## Git Branch Lifecycle

- **Branch name**: `feat/[FEAT-ID]-[kebab-case-title]` (e.g., `feat/FEAT-003-task-management-api`)
- **Created by**: Conductor at pipeline start, before RequirementAnalyzer is called
- **All generated code** goes to this branch — Developer never commits to `main` directly
- **Merge**: Only after all pipeline stages pass, by Conductor or human
- **Rollback**: If pipeline fails unrecoverably, Conductor deletes the branch: `git branch -D feat/[FEAT-ID]-...`
- **Partial rollback**: Use `generated_files` list in pipeline context to revert individual files

---

## File Locking

To prevent write conflicts on shared documents when multiple pipelines run:

**Lock file**: `docs/.pipeline-locks.json`

```json
{
  "docs/backlog.md": { "locked_by": "FEAT-003", "since": "ISO8601" },
  "docs/architecture.md": { "locked_by": "FEAT-005", "since": "ISO8601" }
}
```

**Protocol**:
- Check lock file before writing any shared document
- Acquire lock, write, release lock within the same agent turn
- Locks older than 30 minutes are considered stale and can be overridden
- Per-feature files (pipeline context, task manifests, requirement specs) do NOT need locks

---

## Async Human Checkpoints

Instead of blocking the pipeline, checkpoints are written to `docs/pending-approvals.md`:

```markdown
## [FEAT-003] Approve Requirement Specification
- **Feature**: Task Management API
- **Stage**: Requirement Analysis → Architecture
- **Spec File**: docs/requirement-specs/FEAT-003-spec.md
- **Auto-approve after**: 4 hours (low-risk)
- **Requested at**: ISO8601
- **To approve**: Add `<!-- APPROVED: your-name DATE -->` below this section
- **To reject**: Add `<!-- REJECTED: reason -->` below

<!-- APPROVED: devgsingh 2026-02-19 -->
```

**Timeout policy**:
- Low-risk stages (requirement approval, task plan): auto-approve after 4 hours
- High-risk stages (production deploy): no auto-approval, must block
- Conductor polls `docs/pending-approvals.md` every 15 minutes

---

## File Naming

| Artifact | Path Pattern |
|---|---|
| Requirement spec | `docs/requirement-specs/[FEAT-ID]-spec.md` |
| OpenAPI spec | `docs/api-specs/[FEAT-ID]-openapi.yaml` |
| Task manifest | `docs/task-manifests/[FEAT-ID]-tasks.json` |
| Pipeline context | `docs/pipeline-context/[FEAT-ID]-context.json` |
| Pipeline log | `docs/pipeline-logs/[FEAT-ID]-log.md` |
| Pipeline retro | `docs/pipeline-logs/[FEAT-ID]-retro.md` |
| Error snapshots | `docs/pipeline-logs/[FEAT-ID]-[TASK-ID]-errors.md` |

---

## Active Agent Indicator

Every agent response starts with:
```
**Active agent: [AgentName]**
```

---

## Backlog Item Status Flow

```
Ideation → Refinement → Ready → In Pipeline → [stage name] → Complete | Blocked
```

Valid stage names for "In Pipeline": `Requirement Analysis`, `Architecture`, `Task Splitting`, `Code Generation`, `Security Review`, `Testing`, `Integration Testing`, `Deployment`

---

## Parallel Execution Protocol

After code generation completes, these agents run **in parallel** (two simultaneous sessions):
1. **EthicalHacker** — security review
2. **CodeReviewer** — code quality review

These also run in parallel after both reviews pass:
1. **Tester** (unit tests)
2. **DocumentationWriter** (auto-generate docs)

Conductor waits for all parallel agents to report before advancing the pipeline.

---

## Retrospective Format

After each completed pipeline, write `docs/pipeline-logs/[FEAT-ID]-retro.md`:

```markdown
# Retrospective: [FEAT-ID] [Title]

- **Completed**: ISO8601
- **Actual Duration**: Xh Ym vs Xh estimated
- **Stage Durations**: (table)
- **Retry Count**: Developer N retries, total
- **Test Coverage**: X%
- **Security Findings**: N (N resolved)
- **Patterns Learned**: (bullet list of reusable insights)
- **Estimate Accuracy**: X% (actual/estimated)
```

Conductor appends key `Patterns Learned` to `docs/team-learnings.md` for future pipeline context.
