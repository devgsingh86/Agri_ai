# GitHub Project Sync Guide

## Overview
This document provides instructions for syncing all backlog items from `docs/backlog.md` to GitHub Projects.

## Parsed Items
**Total: 38 items**
- Themes: 5
- Epics: 10
- Stories: 23

## Prerequisites

### 1. GitHub CLI Authentication
```bash
gh auth login
# Follow prompts to authenticate with GitHub
gh auth status  # Verify authentication
```

### 2. GitHub Project Setup
```bash
# Run the project field setup script
.github/scripts/setup-project-fields.sh
```

### 3. Project Configuration
- **Project Number:** 3
- **Owner:** devgsingh86
- **Repository:** jira_dashboard

## Sync Process

### Option A: Manual Creation (Recommended for First Review)
1. Go to: https://github.com/devgsingh86/jira_dashboard/projects/3
2. Create items manually from the parsed list above
3. Adjust fields/labels as needed
4. Once satisfied, update the automated script to replicate

### Option B: Automated Sync (After Reviewing)
```bash
npx ts-node .github/scripts/sync-backlog-to-github.ts
```

## Field Mapping Reference

| Field | GitHub Project | Type |
|-------|---|---|
| Type | Labels | `theme`, `epic`, `story`, `task` |
| Status | Status Field | Backlog, Sprint Ready, In Progress, In Review, Done, Blocked |
| Priority | Priority Field | P0 - Critical, P1 - High, P2 - Medium, P3 - Low |
| Story Points | Story Points Field (Number) | 1-21 |
| Hierarchy | Labels + References | Parent issue references in description |
| AI Agent | Labels | `ai-agent:BacklogManager` |
| Deployment Scope | Labels | `local`, `staging`, `production` |

## Sample gh CLI Commands

### Create Theme
```bash
gh issue create \
  --title "[Theme] 1: Jira Cloud Integration" \
  --body "Complete Jira Cloud integration and data extraction\n\nEpics: 1.1, 1.2" \
  --label "theme,P2" \
  --repo devgsingh86/jira_dashboard
```

### Create Epic
```bash
gh issue create \
  --title "[Epic] 1.1: Jira Cloud Authentication & Connection" \
  --body "Implement OAuth 2.0 authentication and API connection\n\nPart of Theme #1. Includes stories 1.1.1, 1.1.2, 1.1.3" \
  --label "epic,P2" \
  --repo devgsingh86/jira_dashboard
```

### Create Story
```bash
gh issue create \
  --title "[Story] 1.1.1: OAuth 2.0 Authentication" \
  --body "As a system admin, I want to authenticate with Jira Cloud using OAuth 2.0 so that the dashboard can securely access our organizational data\n\n**Acceptance Criteria:**\n- OAuth flow complete\n- Tokens stored encrypted\n- Auto-refresh implemented\n\nPart of Epic #1.1" \
  --label "story,P2" \
  --repo devgsingh86/jira_dashboard
```

## Next Steps

1. **Review Parsed Items** - Verify the 38 items were correctly parsed
2. **Create Project Items** - Choose manual or automated sync
3. **Setup Custom Workflow** - Configure GitHub Actions for continuous sync
4. **Link to Development** - Associate issues with PRs and development work
5. **Monitor Progress** - Use GitHub Project views for tracking

## Troubleshooting

### Authentication Issues
```bash
gh auth refresh
gh auth status
```

### Project Not Found
```bash
gh project list --owner devgsingh86
# Find correct project number
# Update manifest and script if needed
```

### Issues Not Appearing
1. Verify `setup-project-fields.sh` was run
2. Check project is not archived
3. Ensure labels exist in the repository

## Automation (Future)

Once satisfied with sync, enable the GitHub Action workflow:
- `.github/workflows/project-sync.yml` - Auto-sync on backlog.md changes
- `.github/workflows/auto-label.yml` - Auto-label based on content
- `.github/workflows/ai-prioritize.yml` - AI-powered prioritization

## Resources

- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [GitHub CLI Reference](https://cli.github.com/manual/)
- [GraphQL API for Projects](https://docs.github.com/en/graphql/reference/objects#projectv2)
