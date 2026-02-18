#!/bin/bash
# GitHub Repo Setup Automation Script
# Usage: ./scripts/github-setup.sh <github-repo> <github-token>

REPO="$1"
TOKEN="$2"

if [ -z "$REPO" ] || [ -z "$TOKEN" ]; then
  echo "Usage: $0 <github-repo> <github-token>"
  exit 1
fi

API_URL="https://api.github.com/repos/$REPO"

# Create standard labels
LABELS=("bug" "feature" "documentation" "blocked" "in pipeline" "ready" "complete" "security" "infra")
for label in "${LABELS[@]}"; do
  curl -s -X POST -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "$API_URL/labels" \
    -d "{\"name\": \"$label\"}"
done

echo "Labels created."

# Add branch protection (main branch, basic example)
PROTECTION='{"required_status_checks":null,"enforce_admins":true,"required_pull_request_reviews":{"required_approving_review_count":1},"restrictions":null}'
curl -s -X PUT -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.luke-cage-preview+json" \
  "$API_URL/branches/main/protection" \
  -d "$PROTECTION"

echo "Branch protection applied."

# Add issue template (basic example)
mkdir -p .github/ISSUE_TEMPLATE
cat > .github/ISSUE_TEMPLATE/feature_request.md <<EOL
---
name: Feature request
about: Suggest an idea for this project
---

**Is your feature request related to a problem? Please describe.**

**Describe the solution you'd like**

**Additional context**
EOL

echo "Issue template added."

echo "GitHub repo setup complete."
