#!/bin/bash

# Theme 3: Advanced Analytics & Reporting
echo "📌 Creating Theme 3: Advanced Analytics & Reporting..."

gh issue create \
  --title "[Theme] 3: Advanced Analytics & Reporting" \
  --body "Implement cycle time analysis, custom reports, and automated report generation" \
  --label "theme" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Theme 3"

# Epic 3.1
gh issue create \
  --title "[Epic] 3.1: Cycle Time & Lead Time Analysis" \
  --body "Analyze and compare cycle time and lead time metrics across teams and issue types\n\n**Includes:** Stories 3.1.1, 3.1.2" \
  --label "epic" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Epic 3.1"

gh issue create \
  --title "[Story] 3.1.1: Cycle Time Analysis by Issue Type" \
  --body "As a team lead, I want to see average cycle time per issue type so that I can identify process improvements\n\n**Acceptance Criteria:**\n- Filter by issue type\n- Export CSV\n- Trend over time\n\n**Story Points:** 8\n\n**Part of:** Epic 3.1" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 3.1.1"

gh issue create \
  --title "[Story] 3.1.2: Multi-Team Lead Time Comparison" \
  --body "As a manager, I want to compare lead time across teams so that I can benchmark performance\n\n**Acceptance Criteria:**\n- Multi-team comparison\n- Bar chart\n- Percentile stats\n\n**Story Points:** 8\n\n**Part of:** Epic 3.1" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 3.1.2"

# Epic 3.2
gh issue create \
  --title "[Epic] 3.2: Custom Reports & Exports" \
  --body "Enable custom report generation with field selection, scheduling, and multi-format exports\n\n**Includes:** Stories 3.2.1, 3.2.2" \
  --label "epic" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Epic 3.2"

gh issue create \
  --title "[Story] 3.2.1: Custom Report Generation" \
  --body "As a user, I want to generate custom reports with selected fields so that I can share insights with stakeholders\n\n**Acceptance Criteria:**\n- Field picker\n- PDF/CSV export\n- Save report templates\n\n**Story Points:** 8\n\n**Part of:** Epic 3.2" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 3.2.1"

gh issue create \
  --title "[Story] 3.2.2: Scheduled Report Emails" \
  --body "As a user, I want to schedule automated report emails so that I stay informed without manual effort\n\n**Acceptance Criteria:**\n- Email integration\n- Schedule UI\n- Opt-in/out\n\n**Story Points:** 5\n\n**Part of:** Epic 3.2" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 3.2.2"

echo ""
echo "✅ Theme 3 sync complete! (1 theme + 2 epics + 4 stories)"
