#!/bin/bash

# Portfolio Knowledge Base Refresh Script
# This script syncs data to MongoDB and regenerates the vector index

cd "$(dirname "$0")"

echo "[$(date)] Starting portfolio data sync..."

# Activate virtual environment
source ../venv/bin/activate

# Sync data to MongoDB and generate stats.md
echo "[$(date)] Syncing GitHub, LeetCode data to MongoDB..."
python sync_portfolio_data.py

# Regenerate vector index
echo "[$(date)] Regenerating vector index..."
python app/vectorstore/indexer.py

echo "[$(date)] Portfolio data sync complete!"
