#!/bin/bash

# rails-schema-monitor: Summarizes the latest changes in backend/db/schema.rb.

SCHEMA_FILE="backend/db/schema.rb"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "⚠️  WARNING: $SCHEMA_FILE not found! Has bin/rails db:migrate been run?"
  exit 1
fi

echo "--- Rails Schema Summary ---"
echo "Latest Update: $(date -r "$SCHEMA_FILE")"
echo "Tables Found:"
grep "create_table" "$SCHEMA_FILE" | cut -d'"' -f2 | sed 's/^/  - /'

echo ""
echo "Recently Added Columns (last 10 lines of schema changes):"
grep "t\." "$SCHEMA_FILE" | tail -n 10 | sed 's/^/  /'
