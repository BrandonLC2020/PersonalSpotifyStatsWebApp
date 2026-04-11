#!/bin/bash

# service-status-resolver: Checks if ports 3000 (React) and 3001 (Rails) are active.

check_port() {
  local port=$1
  local service_name=$2
  
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
    echo "✅ $service_name is RUNNING on port $port."
  else
    echo "❌ $service_name is NOT running on port $port. Try 'npm start' or 'bin/dev'."
  fi
}

echo "--- Service Status ---"
check_port 3000 "Frontend (React)"
check_port 3001 "Backend (Rails)"
