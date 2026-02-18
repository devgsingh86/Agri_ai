#!/bin/bash

# Theme 2: Dashboard UI/UX & Visualization
echo "📌 Creating Theme 2: Dashboard UI/UX & Visualization..."

gh issue create \
  --title "[Theme] 2: Dashboard UI/UX & Visualization" \
  --body "Build responsive, customizable dashboard with modern visualization widgets" \
  --label "theme" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Theme 2"

# Epic 2.1
gh issue create \
  --title "[Epic] 2.1: Dashboard Layout & Navigation" \
  --body "Implement responsive dashboard layout and project/view switching\n\n**Includes:** Stories 2.1.1, 2.1.2" \
  --label "epic" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Epic 2.1"

gh issue create \
  --title "[Story] 2.1.1: Responsive Dashboard Layout" \
  --body "As a user, I want a responsive dashboard layout so that I can use it on desktop and mobile\n\n**Acceptance Criteria:**\n- CSS grid/flex\n- Mobile breakpoints\n- Hamburger menu\n\n**Story Points:** 8\n\n**Part of:** Epic 2.1" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 2.1.1"

gh issue create \
  --title "[Story] 2.1.2: Project Switcher & View Tabs" \
  --body "As a user, I want to quickly switch between Jira projects and views so that I can analyze different teams\n\n**Acceptance Criteria:**\n- Project switcher\n- View tabs\n- Persistent selection\n\n**Story Points:** 5\n\n**Part of:** Epic 2.1" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 2.1.2"

# Epic 2.2
gh issue create \
  --title "[Epic] 2.2: Visualization Widgets" \
  --body "Implement burndown charts, cumulative flow diagrams, and customizable widgets\n\n**Includes:** Stories 2.2.1, 2.2.2, 2.2.3" \
  --label "epic" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Epic 2.2"

gh issue create \
  --title "[Story] 2.2.1: Burndown Chart Widget" \
  --body "As a product manager, I want to see a burndown chart for each sprint so that I can track progress\n\n**Acceptance Criteria:**\n- Chart.js integration\n- Real Jira data\n- Sprint selector\n\n**Story Points:** 8\n\n**Part of:** Epic 2.2" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 2.2.1"

gh issue create \
  --title "[Story] 2.2.2: Cumulative Flow Diagram" \
  --body "As a team lead, I want a cumulative flow diagram so that I can monitor bottlenecks\n\n**Acceptance Criteria:**\n- WIP states\n- Time series\n- Hover tooltips\n\n**Story Points:** 8\n\n**Part of:** Epic 2.2" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 2.2.2"

gh issue create \
  --title "[Story] 2.2.3: Widget Customization" \
  --body "As a user, I want to customize which widgets are visible so that my dashboard fits my workflow\n\n**Acceptance Criteria:**\n- Widget config UI\n- Drag-and-drop\n- Save preferences\n\n**Story Points:** 5\n\n**Part of:** Epic 2.2" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 2.2.3"

echo ""
echo "✅ Theme 2 sync complete! (1 theme + 2 epics + 5 stories)"
