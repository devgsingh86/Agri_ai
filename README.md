# Agri AI — AI-Powered Yield Improvement for Farmers

Agri AI is a multimodal mobile app that helps farmers improve their crop yield using artificial intelligence. Farmers provide farm details — size, geo-location, soil photos, and other parameters — and the AI builds a personalized farm profile with actionable recommendations to maximise yield.

## Key Features

- **Farm Profiling**: Input farm size, GPS location, soil images, and crop history to build an AI-powered farm profile.
- **Multimodal AI**: Combines text, image (soil analysis), and structured data inputs for richer insights.
- **Yield Recommendations**: AI-driven advice tailored to the farm's specific conditions and goals.
- **Weather Integration**: Real-time and forecast weather data factored into recommendations.
- **Horticulture Intelligence**: Incorporates crop science, soil health, and agronomy best practices.
- **Continuous Learning**: Profile improves over time as more data is collected from the farm.

## How It Works

1. Farmer creates a profile by entering farm size, location, and uploading soil/crop images.
2. App analyses the data using AI (vision + language models).
3. System cross-references weather forecasts, regional horticultural data, and soil analysis.
4. Farmer receives personalised yield improvement recommendations.
5. Recommendations are updated as conditions change (weather, season, growth stage).

## Development Workflow

This project uses a team of specialized AI agents for automated development:

### Quickstart

1. **Clone this repo** to your new project directory.
2. **Review and update** `.github/docs/backlog.md` for your features and priorities.
3. **Customize** `.github/docs/architecture.md` to reflect your project's architecture.
4. **Start the AI agent workflow** by opening the BacklogManager agent in VS Code Copilot.

## Agent Team (AI DevOps Pipeline)

| Agent | Model | Role |
|---|---|---|
| BacklogManager | GPT-5 mini | Backlog management, sprint planning, pipeline trigger |
| Conductor | GPT-4.1 | Pipeline orchestration, DAG execution, rollback |
| RequirementAnalyzer | GPT-5 mini | Requirement parsing, pipeline context init |
| SolutionArchitect | GPT-4.1 | Architecture design, OpenAPI spec output |
| TaskSplitter | GPT-5 mini | Task decomposition with parallel groups |
| Developer | Claude Sonnet 4.5 | Code generation on feature branch |
| EthicalHacker | GPT-5 mini | OWASP security review (parallel) |
| CodeReviewer | GPT-5 mini | Code quality review (parallel) |
| Tester | GPT-5 mini | API contract validation + tests |
| DocumentationWriter | GPT-5 mini | README, API docs, changelog (parallel) |
| ProductManager | GPT-4.1 | Feature strategy and prioritization |
| DevOps | GPT-4.1 | CI/CD and infrastructure (conditional: staging/production only) |

## Pipeline Flow



## Key Files

| File | Purpose |
|---|---|
| `.github/agents/` | Agent definitions |
| `.github/docs/conventions.md` | Shared conventions, model tiers, protocols |
| `docs/backlog.md` | Product backlog |
| `docs/pipeline-context/[FEAT-ID]-context.json` | Shared pipeline state per feature |
| `docs/api-specs/[FEAT-ID]-openapi.yaml` | Machine-readable API contracts |
| `docs/pending-approvals.md` | Async human checkpoints |
| `docs/team-learnings.md` | Accumulated pipeline retrospective insights |
| `docs/.pipeline-locks.json` | File lock registry for concurrent pipelines |

## Cost Optimization

Models are assigned by task complexity — 7 of 12 agents use GPT-5 mini (cheapest tier).
See `.github/docs/conventions.md` → Model Tier Strategy for the full rationale.

## Support
See `.github/docs/dev-notes.md` for development tips and troubleshooting.
