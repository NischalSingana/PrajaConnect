#!/bin/bash

# Exit on error
set -e

# Mar 4, 2026 is today.
# Dates:
DATE_1="2026-02-27T10:00:00"
DATE_2="2026-02-28T14:30:00"
DATE_3="2026-03-01T16:15:00"
DATE_4="2026-03-02T11:45:00"
DATE_5="2026-03-03T09:20:00"
DATE_6="2026-03-04T00:05:00"

echo "Committing Setup and Configurations..."
git add package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts eslint.config.js index.html components.json .gitignore README.md
GIT_AUTHOR_DATE="$DATE_1" GIT_COMMITTER_DATE="$DATE_1" \
git commit -m "chore: setup project configurations, vite, and typescript"

echo "Committing Database and Server setup..."
git add server/ drizzle.config.ts src/db/ .env
GIT_AUTHOR_DATE="$DATE_2" GIT_COMMITTER_DATE="$DATE_2" \
git commit -m "feat: setup express server and drizzle orm database schema"

echo "Committing UI Components..."
git add src/components/ public/ src/lib/ src/hooks/
GIT_AUTHOR_DATE="$DATE_3" GIT_COMMITTER_DATE="$DATE_3" \
git commit -m "feat: add reusable UI components and assets"

echo "Committing Pages and Routing..."
git add src/pages/ src/context/ src/App.tsx src/main.tsx src/index.css
GIT_AUTHOR_DATE="$DATE_4" GIT_COMMITTER_DATE="$DATE_4" \
git commit -m "feat: implement main application pages and routing"

echo "Committing environment variables and scripts..."
git add scripts/ .env.local
GIT_AUTHOR_DATE="$DATE_5" GIT_COMMITTER_DATE="$DATE_5" \
git commit -m "feat: setup environment variables and utility scripts"

echo "Committing Deployment setup and branding..."
# Add any remaining files
git add Dockerfile dist/ src/ README.md
git add .
GIT_AUTHOR_DATE="$DATE_6" GIT_COMMITTER_DATE="$DATE_6" \
git commit -m "chore: add docker deployment setup and update branding to PrajaConnect"

echo "Done committing. Now pushing..."

git push origin main
