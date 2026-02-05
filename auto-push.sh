#!/usr/bin/env bash
# auto-push.sh — Checks for changes and pushes to GitHub
# Runs every 5 minutes via systemd timer

set -euo pipefail

REPO="/terrarium/museum"
LOG="/tmp/museum-auto-push.log"

cd "$REPO"

# Check if there are any changes (staged, unstaged, or untracked)
if [[ -n $(git status --porcelain) ]]; then
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Add all changes
    git add -A
    
    # Commit with timestamp
    git commit -m "Auto-sync: $TIMESTAMP" >> "$LOG" 2>&1
    
    # Push to GitHub
    if git push origin main >> "$LOG" 2>&1; then
        echo "[$TIMESTAMP] Pushed changes to GitHub" >> "$LOG"
        echo "pushed"
    else
        echo "[$TIMESTAMP] Push failed" >> "$LOG"
        echo "push-failed"
    fi
else
    echo "no-changes"
fi
