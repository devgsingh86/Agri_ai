#!/bin/bash

# Theme 4: User Management & Security
echo "📌 Creating Theme 4: User Management & Security..."

gh issue create \
  --title "[Theme] 4: User Management & Security" \
  --body "Implement role-based access control, SSO integration, and security auditing" \
  --label "theme" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Theme 4"

# Epic 4.1
gh issue create \
  --title "[Epic] 4.1: Role-Based Access Control (RBAC)" \
  --body "Implement user roles and permission-based data access controls\n\n**Includes:** Stories 4.1.1, 4.1.2" \
  --label "epic" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Epic 4.1"

gh issue create \
  --title "[Story] 4.1.1: Role Assignment System" \
  --body "As an admin, I want to assign roles (admin, manager, user) so that access is restricted appropriately\n\n**Acceptance Criteria:**\n- Role assignment UI\n- Permission checks\n- Audit log\n\n**Story Points:** 8\n\n**Part of:** Epic 4.1" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 4.1.1"

gh issue create \
  --title "[Story] 4.1.2: Data Access Control by Role" \
  --body "As a user, I want to see only the data I have access to so that sensitive info is protected\n\n**Acceptance Criteria:**\n- Data filtering by role\n- Error handling\n- Test coverage\n\n**Story Points:** 5\n\n**Part of:** Epic 4.1" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 4.1.2"

# Epic 4.2
gh issue create \
  --title "[Epic] 4.2: SSO & Security Enhancements" \
  --body "Implement single sign-on and comprehensive audit logging\n\n**Includes:** Stories 4.2.1, 4.2.2" \
  --label "epic" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Epic 4.2"

gh issue create \
  --title "[Story] 4.2.1: Google Workspace SSO" \
  --body "As an admin, I want to enable SSO with Google Workspace so that users can log in with their org accounts\n\n**Acceptance Criteria:**\n- Google SSO integration\n- Fallback to email/password\n- Session timeout\n\n**Story Points:** 8\n\n**Part of:** Epic 4.2" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 4.2.1"

gh issue create \
  --title "[Story] 4.2.2: Audit Logging for Compliance" \
  --body "As a security officer, I want audit logs of all access and changes so that we meet compliance requirements\n\n**Acceptance Criteria:**\n- Log all logins\n- Log data changes\n- Export logs\n\n**Story Points:** 5\n\n**Part of:** Epic 4.2" \
  --label "story" \
  --repo "devgsingh86/jira_dashboard" > /dev/null

echo "✓ Created Story 4.2.2"

echo ""
echo "✅ Theme 4 sync complete! (1 theme + 2 epics + 4 stories)"
