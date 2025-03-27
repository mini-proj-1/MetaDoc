#!/bin/bash
# Bash script to start frontend on port 3000

echo -e "\e[36mStarting Metaverse Doctor Frontend on port 3000...\e[0m"

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Start frontend on port 3000
npm run dev -- --port 3000 