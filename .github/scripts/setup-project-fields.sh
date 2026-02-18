#!/bin/bash

# Configuration
PROJECT_NUMBER=3  # Your project number
OWNER="devgsingh86"  # or organization name

echo "Creating custom fields for Project #${PROJECT_NUMBER}..."

# Get project ID first
PROJECT_ID=$(gh project list --owner $OWNER --format json | jq -r ".projects[] | select(.number == $PROJECT_NUMBER) | .id")

echo "Project ID: $PROJECT_ID"

# Create Status field (Single Select)
gh project field-create $PROJECT_NUMBER \
  --owner $OWNER \
  --name "Status" \
  --data-type SINGLE_SELECT \
  --single-select-options "📋 Backlog,🎯 Sprint Ready,🏗️ In Progress,👀 In Review,✅ Done,🚫 Blocked"

echo "✓ Created Status field"

# Create Priority field (Single Select)
gh project field-create $PROJECT_NUMBER \
  --owner $OWNER \
  --name "Priority" \
  --data-type SINGLE_SELECT \
  --single-select-options "P0 - Critical,P1 - High,P2 - Medium,P3 - Low"

echo "✓ Created Priority field"

# Create Story Points field (Number)
gh project field-create $PROJECT_NUMBER \
  --owner $OWNER \
  --name "Story Points" \
  --data-type NUMBER

echo "✓ Created Story Points field"

# Create Complexity field (Single Select)
gh project field-create $PROJECT_NUMBER \
  --owner $OWNER \
  --name "Complexity" \
  --data-type SINGLE_SELECT \
  --single-select-options "Low,Medium,High"

echo "✓ Created Complexity field"

# Create AI Agent field (Single Select)
gh project field-create $PROJECT_NUMBER \
  --owner $OWNER \
  --name "AI Agent" \
  --data-type SINGLE_SELECT \
  --single-select-options "backend-agent,frontend-agent,data-agent,ml-agent,none"

echo "✓ Created AI Agent field"

# Create Theme field (Single Select)
gh project field-create $PROJECT_NUMBER \
  --owner $OWNER \
  --name "Theme" \
  --data-type SINGLE_SELECT \
  --single-select-options "Foundation,Hierarchy Detection,Dashboard,Status & Health,Forecasting,Performance,Security,UX & Mobile,Testing,Documentation"

echo "✓ Created Theme field"

# Create Blocked By field (Text)
gh project field-create $PROJECT_NUMBER \
  --owner $OWNER \
  --name "Blocked By" \
  --data-type TEXT

echo "✓ Created Blocked By field"

# Create Health Score field (Number)
gh project field-create $PROJECT_NUMBER \
  --owner $OWNER \
  --name "Health Score" \
  --data-type NUMBER

echo "✓ Created Health Score field"

# Create Target Date field (Date)
gh project field-create $PROJECT_NUMBER \
  --owner $OWNER \
  --name "Target Date" \
  --data-type DATE

echo "✓ Created Target Date field"

echo ""
echo "✅ All custom fields created successfully!"
echo "You can now use these fields in your project cards to track status, priority, story points, complexity, assigned AI agent, theme, blockers, health score, and target dates."