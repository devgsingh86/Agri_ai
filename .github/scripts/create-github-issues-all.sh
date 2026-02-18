#!/bin/bash

# Master Script: Sync All Remaining Themes (2-5) to GitHub Project
# Total: 4 themes + 8 epics + 17 stories

set -e

OWNER="devgsingh86"
REPO="jira_dashboard"

echo "🚀 Starting full backlog sync (Themes 2-5)..."
echo "Repository: $OWNER/$REPO"
echo ""

# Check GitHub CLI authentication
if ! gh auth status > /dev/null 2>&1; then
  echo "❌ GitHub CLI not authenticated. Run: gh auth login"
  exit 1
fi

# Sync Theme 2
echo "📌 Syncing Theme 2..."
bash .github/scripts/create-github-issues-theme2.sh
echo ""

# Sync Theme 3
echo "📌 Syncing Theme 3..."
bash .github/scripts/create-github-issues-theme3.sh
echo ""

# Sync Theme 4
echo "📌 Syncing Theme 4..."
bash .github/scripts/create-github-issues-theme4.sh
echo ""

# Sync Theme 5
echo "📌 Syncing Theme 5..."
bash .github/scripts/create-github-issues-theme5.sh
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FULL BACKLOG SYNC COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  • Theme 1: ✓ Complete (9 issues)"
echo "  • Theme 2: ✓ Complete (7 issues)"
echo "  • Theme 3: ✓ Complete (6 issues)"
echo "  • Theme 4: ✓ Complete (6 issues)"
echo "  • Theme 5: ✓ Complete (6 issues)"
echo "  • TOTAL: 38 issues synced to GitHub Project"
echo ""
echo "🔗 View in GitHub Project:"
echo "   https://github.com/$OWNER/$REPO/projects/3"
echo ""
echo "📝 Next Steps:"
echo "  1. Review all issues in GitHub Project"
echo "  2. Manually add custom field values (Priority, Story Points) in UI"
echo "  3. Link issues to GitHub Project board"
echo "  4. Start working on priority items"
