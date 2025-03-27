# PowerShell script to run both backend and frontend servers in the same terminal
# This script uses background jobs instead of new windows

# Function to stop jobs on exit
function Cleanup {
    if ($backendJob) {
        Stop-Job -Job $backendJob
        Remove-Job -Job $backendJob -Force
    }
    if ($frontendJob) {
        Stop-Job -Job $frontendJob
        Remove-Job -Job $frontendJob -Force
    }
    Write-Host "Stopped all servers" -ForegroundColor Yellow
}

# Register cleanup on script termination
trap {
    Cleanup
    break
}

# Clear the console for a clean start
Clear-Host

# Display header
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "         METAVERSE DOCTOR - DEVELOPMENT SERVER      " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes to free up ports
Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null
Write-Host "Done!" -ForegroundColor Green
Write-Host ""

# Start backend server as a background job
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location -Path "C:\metadoc\backend"
    npm run dev
}

# Wait a moment to ensure backend starts first
Start-Sleep -Seconds 2

# Start frontend server as a background job
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location -Path "C:\metadoc\frontend"
    npm run dev
}

# Wait a moment for servers to initialize
Start-Sleep -Seconds 2

# Display access information
Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Servers are running!" -ForegroundColor Green
Write-Host "Backend API: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Magenta
Write-Host ""

# Function to display recent logs
function Show-RecentLogs {
    Write-Host "===== BACKEND LOGS =====" -ForegroundColor Cyan
    Receive-Job -Job $backendJob -Keep
    Write-Host ""
    Write-Host "===== FRONTEND LOGS =====" -ForegroundColor Cyan
    Receive-Job -Job $frontendJob -Keep
    Write-Host ""
}

# Main loop to keep script running and display logs periodically
try {
    while ($true) {
        Show-RecentLogs
        Start-Sleep -Seconds 5
    }
} finally {
    # Clean up when the script exits
    Cleanup
} 