#!/bin/bash

# Theme 5: DevOps, Monitoring & Scalability
echo "📌 Creating Theme 5: DevOps, Monitoring & Scalability..."

gh issue create \
  --title "[Theme] 5: DevOps, Monitoring & Scalability" \
  --body "Implement CI/CD pipelines, performance monitoring, and error tracking" \
  --label "theme" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Theme 5"

# Epic 5.1
gh issue create \
  --title "[Epic] 5.1: CI/CD Pipeline & Deployment" \
  --body "Automate builds, tests, and deployments to staging and production\n\n**Includes:** Stories 5.1.1, 5.1.2" \
  --label "epic" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Epic 5.1"

gh issue create \
  --title "[Story] 5.1.1: Automated CI/CD Pipeline" \
  --body "As a developer, I want automated builds and tests on every PR so that code quality is maintained\n\n**Acceptance Criteria:**\n- GitHub Actions\n- Test coverage >80%\n- Linting\n\n**Story Points:** 8\n\n**Part of:** Epic 5.1" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 5.1.1"

gh issue create \
  --title "[Story] 5.1.2: One-Click Deployment Tool" \
  --body "As a DevOps engineer, I want one-click deploys to staging and production so that releases are fast and safe\n\n**Acceptance Criteria:**\n- Vercel/Netlify integration\n- Rollback support\n- Status badges\n\n**Story Points:** 5\n\n**Part of:** Epic 5.1" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 5.1.2"

# Epic 5.2
gh issue create \
  --title "[Epic] 5.2: Monitoring & Error Reporting" \
  --body "Implement real-time error monitoring and performance metrics dashboard\n\n**Includes:** Stories 5.2.1, 5.2.2" \
  --label "epic" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Epic 5.2"

gh issue create \
  --title "[Story] 5.2.1: Real-Time Error Monitoring" \
  --body "As an admin, I want real-time error monitoring so that issues are detected quickly\n\n**Acceptance Criteria:**\n- Sentry integration\n- Alerting\n- Error dashboard\n\n**Story Points:** 5\n\n**Part of:** Epic 5.2" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 5.2.1"

gh issue create \
  --title "[Story] 5.2.2: Performance Metrics Dashboard" \
  --body "As a developer, I want performance metrics (API latency, load) so that we can optimize bottlenecks\n\n**Acceptance Criteria:**\n- Metrics dashboard\n- Alerts on thresholds\n- Historical trends\n\n**Story Points:** 5\n\n**Part of:** Epic 5.2" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 5.2.2"

echo ""
echo "✅ Theme 5 sync complete! (1 theme + 2 epics + 4 stories)"
