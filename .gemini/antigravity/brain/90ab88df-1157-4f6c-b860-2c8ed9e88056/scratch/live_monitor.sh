#!/bin/bash
echo "--- KNOWLEDGE POOL MONITOR STARTED ---"
while true; do
  echo "--- $(date +%H:%M:%S) ---"
  psql "postgresql://hazarekiz:Vol1872017@localhost:5432/aluplan_support" -c "SELECT ks.name, sl.status, sl.sync_started_at FROM knowledge_source_sync_logs sl JOIN knowledge_sources ks ON sl.source_id = ks.id WHERE sl.sync_started_at > NOW() - INTERVAL '1 minute' ORDER BY sl.sync_started_at DESC LIMIT 5;"
  psql "postgresql://hazarekiz:Vol1872017@localhost:5432/aluplan_support" -c "SELECT COUNT(*) as syncing_count FROM knowledge_sources WHERE status = 'SYNCING';"
  sleep 2
done
