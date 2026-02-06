#!/bin/sh
set -e

# Ensure data directory exists
# If config folder is mapped (HA way), use it
if [ -d "/data" ]; then
    echo "Using Home Assistant /data directory for persistence"
    export DATA_DIR="/data"
else
    # Ensure local data directory exists if not using HA
    mkdir -p /app/data
fi

npm start
