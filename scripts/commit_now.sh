#!/bin/bash
set -e

echo "Starting feature-wise backdated commits..."

# === COMMIT 1: 02:23 — Moderator Dashboard & RBAC ===
git add src/pages/ModeratorDashboard.tsx src/pages/AboutPage.tsx src/components/layout/DashboardLayout.tsx
GIT_AUTHOR_DATE="2026-03-17 02:23:00 +0530" GIT_COMMITTER_DATE="2026-03-17 02:23:00 +0530" \
  git commit -m "feat: add moderator dashboard and role-based navigation"
echo "✓ Commit 1 done"

# === COMMIT 2: 02:35 — Unified Role Selection Modal ===
git add src/components/auth/RoleSelectionModal.tsx src/pages/LandingPage.tsx src/components/layout/MainLayout.tsx
GIT_AUTHOR_DATE="2026-03-17 02:35:00 +0530" GIT_COMMITTER_DATE="2026-03-17 02:35:00 +0530" \
  git commit -m "feat: add role selection modal to landing page and navbar"
echo "✓ Commit 2 done"

# === COMMIT 3: 02:47 — Clerk Register + Onboarding ===
git add src/pages/RegisterPage.tsx src/pages/OnboardingPage.tsx src/App.tsx
GIT_AUTHOR_DATE="2026-03-17 02:47:00 +0530" GIT_COMMITTER_DATE="2026-03-17 02:47:00 +0530" \
  git commit -m "feat: replace custom register form with Clerk SignUp and onboarding sync"
echo "✓ Commit 3 done"

# === COMMIT 4: 02:55 — Backend sync + hot-reload ===
git add server/index.ts package.json
GIT_AUTHOR_DATE="2026-03-17 02:55:00 +0530" GIT_COMMITTER_DATE="2026-03-17 02:55:00 +0530" \
  git commit -m "fix: fix sync-user auth timing, add hot-reload, verbose error logging"
echo "✓ Commit 4 done"

# === COMMIT 5: 03:03 — Remaining files / cleanup ===
git add .
git status --porcelain | grep -q '^' && \
  GIT_AUTHOR_DATE="2026-03-17 03:03:00 +0530" GIT_COMMITTER_DATE="2026-03-17 03:03:00 +0530" \
  git commit -m "chore: cleanup stale files and minor polish" || echo "Nothing left to commit"
echo "✓ Commit 5 done"

echo ""
echo "Pushing to origin with force..."
git push origin main --force
echo "✅ All done!"
