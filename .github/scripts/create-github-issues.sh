#!/bin/bash

# GitHub Project Bulk Issue Creator
# Creates GitHub issues from parsed backlog items with proper field and label assignments

set -e

OWNER="devgsingh86"
REPO="jira_dashboard"
PROJECT_NUMBER="3"

echo "🚀 Starting GitHub Project Issue Sync..."
echo "Repository: $OWNER/$REPO"
echo "Project: #$PROJECT_NUMBER"
echo ""

# Check GitHub CLI authentication
if ! gh auth status > /dev/null 2>&1; then
  echo "❌ GitHub CLI not authenticated. Run: gh auth login"
  exit 1
fi

# Theme 1: Jira Cloud Integration
echo "📌 Creating Theme 1: Jira Cloud Integration..."

THEME_1=$(gh issue create \
  --title "[Theme] 1: Jira Cloud Integration" \
  --body "Complete Jira Cloud integration and data extraction\n\nNote: This theme includes Epics 1.1 and 1.2" \
  --label "theme" \
  --repo "$OWNER/$REPO" \
  --json number \
  --jq '.number')

echo "✓ Created Theme 1 (#$THEME_1)"

# Epic 1.1
EPIC_1_1=$(gh issue create \
  --title "[Epic] 1.1: Jira Cloud Authentication & Connection" \
  --body "Implement OAuth 2.0 authentication, API connection, and multi-project support\n\n**Part of:** Theme #$THEME_1\n\n**Includes:** Stories 1.1.1, 1.1.2, 1.1.3" \
  --label "epic" \
  --repo "$OWNER/$REPO" \
  --json number \
  --jq '.number')

echo "✓ Created Epic 1.1 (#$EPIC_1_1)"

# Story 1.1.1
gh issue create \
  --title "[Story] 1.1.1: OAuth 2.0 Authentication" \
  --body "As a system admin, I want to authenticate with Jira Cloud using OAuth 2.0 so that the dashboard can securely access our organizational data\n\n**Acceptance Criteria:**\n- OAuth flow complete\n- Tokens stored encrypted\n- Auto-refresh implemented\n\n**Story Points:** 8\n\n**Part of:** Epic #$EPIC_1_1" \
  --label "story" \
  --repo "$OWNER/$REPO" > /dev/null

echo "✓ Created Story 1.1.1"

# Story 1.1.2
gh issue create \
  --title "[Story] 1.1.2: Rate Limiting & Retry Logic" \
  --body "As a developer, I want to implement rate limiting and retry logic so that we don't exceed Jira API limits (~150 req/min)\n\n**Acceptance Criteria:**\n- Exponential backoff\n- 3 retry attempts\n- 2s delay between retries\n\n**Story Points:** 5\n\n**Part of:** Epic #$EPIC_1_1" \
  --label "story" \
  --repo "$OWNER/$REPO" > /dev/null

echo "✓ Created Story 1.1.2"

# Story 1.1.3
gh issue create \
  --title "[Story] 1.1.3: Multi-Project Configuration" \
  --body "As a system admin, I want to configure multiple Jira project connections so that we can aggregate data across product portfolios\n\n**Acceptance Criteria:**\n- Multi-project configuration UI\n- Connection validation\n- Health checks\n\n**Story Points:** 5\n\n**Part of:** Epic #$EPIC_1_1" \
  --label "story" \
  --repo "$OWNER/$REPO" > /dev/null

echo "✓ Created Story 1.1.3"

# Epic 1.2
EPIC_1_2=$(gh issue create \
  --title "[Epic] 1.2: Hierarchical Data Extraction" \
  --body "Extract and sync complete Jira hierarchy with incremental updates\n\n**Part of:** Theme #$THEME_1\n\n**Includes:** Stories 1.2.1, 1.2.2, 1.2.3" \
  --label "epic" \
  --repo "$OWNER/$REPO" \
  --json number \
  --jq '.number')

echo "✓ Created Epic 1.2 (#$EPIC_1_2)"

# Story 1.2.1
gh issue create \
  --title "[Story] 1.2.1: Complete Jira Hierarchy Extraction" \
  --body "As a developer, I want to extract the complete Jira hierarchy (Initiative > Epic > Story > Task > Sub-task) so that we can build rollup views\n\n**Acceptance Criteria:**\n- Parse all 5 hierarchy levels\n- Handle custom issue types\n- Store relationships in DB\n\n**Story Points:** 13\n\n**Part of:** Epic #$EPIC_1_2" \
  --label "story" \
  --repo "$OWNER/$REPO" > /dev/null

echo "✓ Created Story 1.2.1"

# Story 1.2.2
gh issue create \
  --title "[Story] 1.2.2: Incremental Sync for Jira Data" \
  --body "As a developer, I want to implement incremental sync for Jira data so that we only pull changed issues since last sync\n\n**Acceptance Criteria:**\n- JQL filtering by updated date\n- Pagination (100 items/page)\n- Delta processing\n\n**Story Points:** 8\n\n**Part of:** Epic #$EPIC_1_2" \
  --label "story" \
  --repo "$OWNER/$REPO" > /dev/null

echo "✓ Created Story 1.2.2"

# Story 1.2.3
gh issue create \
  --title "[Story] 1.2.3: Daily Automated Batch Updates" \
  --body "As a system admin, I want daily automated batch updates so that dashboard data stays current without manual intervention\n\n**Acceptance Criteria:**\n- Scheduled Vercel cron job\n- Failure notifications\n- Sync status dashboard\n\n**Story Points:** 5\n\n**Part of:** Epic #$EPIC_1_2" \
  --label "story" \
  --repo "$OWNER/$REPO" > /dev/null

echo "✓ Created Story 1.2.3"

echo ""
echo "✅ Theme 1 sync complete!"
echo ""
echo "📝 Remaining themes to sync:"
echo "   - Theme 2: Dashboard UI/UX & Visualization (2 epics, 5 stories)"
echo "   - Theme 3: Advanced Analytics & Reporting (2 epics, 4 stories)"
echo "   - Theme 4: User Management & Security (2 epics, 4 stories)"
echo "   - Theme 5: DevOps, Monitoring & Scalability (2 epics, 4 stories)"
echo ""
echo "🔗 View in GitHub Project: https://github.com/$OWNER/$REPO/projects/$PROJECT_NUMBER"
