#!/bin/bash

# env-integrity-checker: Compares .env with sample.env for frontend and backend.

check_env() {
  local dir=$1
  local sample="$dir/sample.env"
  local actual="$dir/.env"

  echo "--- Checking $dir ---"
  if [ ! -f "$actual" ]; then
    echo "⚠️  WARNING: $actual not found! Use $sample as a template."
    return
  fi

  # Extract keys (ignoring comments and empty lines)
  local sample_keys=$(grep -v '^#' "$sample" | grep '=' | cut -d'=' -f1 | sort)
  local actual_keys=$(grep -v '^#' "$actual" | grep '=' | cut -d'=' -f1 | sort)

  # Check for missing keys in .env
  local missing=$(comm -23 <(echo "$sample_keys") <(echo "$actual_keys"))
  if [ -n "$missing" ]; then
    echo "❌ Missing keys in $actual:"
    echo "$missing"
  else
    echo "✅ All keys from $sample are present in $actual."
  fi
}

check_env "backend"
check_env "frontend"
