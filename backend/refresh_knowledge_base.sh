#!/bin/bash

# Portfolio Knowledge Base Refresh Script
# This script fetches latest stats and regenerates the vector index

cd "$(dirname "$0")"

echo "[$(date)] Starting knowledge base refresh..."

# Activate virtual environment
source ../venv/bin/activate

# Fetch latest stats
echo "[$(date)] Fetching latest GitHub and LeetCode stats..."
python fetch_stats_to_md.py

# Regenerate vector index
echo "[$(date)] Regenerating vector index..."
python app/vectorstore/indexer.py

echo "[$(date)] Knowledge base refresh complete!"
