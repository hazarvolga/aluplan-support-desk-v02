#!/bin/bash

# Aluplan Support Desk - Dataset Restoration Script
# This script registers files from the /dataset folder into the PostgreSQL database.

PROJECT_ROOT="/Users/hazarekiz/Projects/aluplan-support-desk-V02"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"
SYNC_SCRIPT="$BACKEND_DIR/src/raw-sync.js"

echo "----------------------------------------------------"
echo "🚀 Starting Data Restoration from /dataset..."
echo "----------------------------------------------------"

# Run the registration script
if [ -f "$SYNC_SCRIPT" ]; then
    node "$SYNC_SCRIPT"
else
    echo "❌ Error: Sync script not found at $SYNC_SCRIPT"
    exit 1
fi

echo "----------------------------------------------------"
echo "✅ Registration Complete."
echo "⏳ The AI worker will process the documents in the background."
echo "📝 You can verify progress by checking the knowledge-pool in the dashboard."
echo "----------------------------------------------------"
