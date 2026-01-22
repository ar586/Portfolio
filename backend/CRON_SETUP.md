# Cron Job Setup for Knowledge Base Refresh

## Quick Setup

Run this command to edit your crontab:
```bash
crontab -e
```

Add one of these lines (choose your preferred frequency):

### Daily at 3 AM
```
0 3 * * * cd /Users/mac/Desktop/Portfolio/backend && ./refresh_knowledge_base.sh >> logs/refresh.log 2>&1
```

### Every 6 hours
```
0 */6 * * * cd /Users/mac/Desktop/Portfolio/backend && ./refresh_knowledge_base.sh >> logs/refresh.log 2>&1
```

### Every hour
```
0 * * * * cd /Users/mac/Desktop/Portfolio/backend && ./refresh_knowledge_base.sh >> logs/refresh.log 2>&1
```

## Create logs directory
```bash
mkdir -p /Users/mac/Desktop/Portfolio/backend/logs
```

## Test the script manually
```bash
cd /Users/mac/Desktop/Portfolio/backend
./refresh_knowledge_base.sh
```

## View logs
```bash
tail -f /Users/mac/Desktop/Portfolio/backend/logs/refresh.log
```

## What it does
1. Fetches latest GitHub stats (repos, followers, etc.)
2. Fetches latest LeetCode stats (problems solved, ranking)
3. Saves to `backend/data/stats.md`
4. Regenerates FAISS vector index
5. Chat bot now has fresh data!
