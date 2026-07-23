#!/bin/bash
set -e
echo "🚀 [Update] Fetching latest production release..."
git fetch origin release
git reset --hard origin/release
echo "✨ [Update] Syncing and Re-establishing environment..."
./deploy.sh
echo "🥂 [Update] Successfully updated to the latest version!"
