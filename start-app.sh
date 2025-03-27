#!/bin/bash

# Bash script to start both frontend and backend

echo -e "\e[36mStarting Metaverse Doctor Application with Blockchain Integration...\e[0m"
echo -e "\e[36m======================================================\e[0m"

# Function to check if a port is in use
function is_port_in_use() {
  netstat -tuln | grep LISTEN | grep :$1 > /dev/null
  return $?
}

# Check if the ports are already in use
BACKEND_PORT=3001
FRONTEND_PORT=3000

if is_port_in_use $BACKEND_PORT; then
  echo -e "\e[33mWarning: Port $BACKEND_PORT is already in use. Backend might fail to start.\e[0m"
fi

if is_port_in_use $FRONTEND_PORT; then
  echo -e "\e[33mWarning: Port $FRONTEND_PORT is already in use. Frontend might fail to start.\e[0m"
fi

# Function to run in background and save PID
function run_background() {
  echo -e "\e[32mStarting $1...\e[0m"
  cd "$2" && PORT=$FRONTEND_PORT REACT_APP_API_URL=http://localhost:$BACKEND_PORT $3 > "$1.log" 2>&1 &
  echo $! > "$1.pid"
  echo -e "\e[32m$1 started with PID $(cat "$1.pid")\e[0m"
}

# Go to the project root directory
cd "$(dirname "$0")"

# Test the blockchain integration
echo -e "\e[36mTesting blockchain integration (mock implementation)...\e[0m"
cd backend
node src/test-blockchain.js
TEST_RESULT=$?
if [ $TEST_RESULT -ne 0 ]; then
  echo -e "\e[31mBlockchain integration test failed. Please check the logs above.\e[0m"
  exit 1
fi

# Test API routes
echo -e "\e[36mTesting blockchain API routes (mock implementation)...\e[0m"
node src/test-api-routes.js
TEST_RESULT=$?
cd ..
if [ $TEST_RESULT -ne 0 ]; then
  echo -e "\e[31mAPI routes test failed. Please check the logs above.\e[0m"
  exit 1
fi

# Start the backend server
run_background "backend" "$(pwd)/backend" "npm start"

# Wait for the backend to start up
echo -e "\e[33mWaiting for backend to start up...\e[0m"
sleep 5

# Start the frontend with environment variables
echo -e "\e[32mStarting frontend on port $FRONTEND_PORT connecting to backend on port $BACKEND_PORT...\e[0m"
run_background "frontend" "$(pwd)/frontend" "npm run dev -- --port $FRONTEND_PORT"

# Check if frontend started correctly
sleep 5
if ! is_port_in_use $FRONTEND_PORT; then
  echo -e "\e[31mFrontend failed to start on port $FRONTEND_PORT. Check frontend.log for details.\e[0m"
  echo -e "\e[33mAttempting to start with Vite's default port...\e[0m"
  kill -15 $(cat frontend.pid) 2>/dev/null
  rm frontend.pid
  run_background "frontend" "$(pwd)/frontend" "npm run dev"
  echo -e "\e[33mFrontend may be running on a different port. Check frontend.log for the actual port.\e[0m"
fi

# Provide information to the user
echo -e "\n\e[36mMetaverse Doctor with Blockchain Integration is starting up!\e[0m"
echo -e "Backend API: http://localhost:$BACKEND_PORT/api"
echo -e "Frontend UI: http://localhost:$FRONTEND_PORT"
echo -e "\n\e[33mNote: Using mock blockchain implementation for demonstration purposes.\e[0m"
echo -e "\n\e[33mTo stop all services, press Ctrl+C\e[0m"

# Cleanup function
function cleanup() {
  echo -e "\n\e[31mShutting down services...\e[0m"
  
  if [ -f backend.pid ]; then
    kill -15 $(cat backend.pid) 2>/dev/null
    rm backend.pid
  fi
  
  if [ -f frontend.pid ]; then
    kill -15 $(cat frontend.pid) 2>/dev/null
    rm frontend.pid
  fi
  
  echo -e "\e[31mAll services stopped.\e[0m"
  exit 0
}

# Set up trap for cleanup on exit
trap cleanup EXIT INT TERM

# Keep script running
echo -e "\n\e[90mPress Ctrl+C to stop all services...\e[0m"
while true; do
  sleep 10
done 