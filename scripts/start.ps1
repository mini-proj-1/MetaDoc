# PowerShell script to start both backend and frontend servers
# This script uses Start-Process to open separate windows

# Set window titles for easy identification
$backendTitle = "Metaverse Doctor - Backend"
$frontendTitle = "Metaverse Doctor - Frontend"

# Display startup message
Write-Host "Starting Metaverse Doctor services..." -ForegroundColor Cyan

# Start backend in a separate PowerShell window
Start-Process powershell -ArgumentList "-NoExit", 
    "-Command", 
    "Write-Host 'Starting Backend Server...' -ForegroundColor Green; `$host.UI.RawUI.WindowTitle = '$backendTitle'; Set-Location -Path 'C:\metadoc\backend'; npm run dev"

# Wait a moment to ensure backend starts first
Start-Sleep -Seconds 2

# Start frontend in a separate PowerShell window
Start-Process powershell -ArgumentList "-NoExit", 
    "-Command", 
    "Write-Host 'Starting Frontend Server...' -ForegroundColor Green; `$host.UI.RawUI.WindowTitle = '$frontendTitle'; Set-Location -Path 'C:\metadoc\frontend'; npm run dev"

# Success message
Write-Host "Services started in separate windows." -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "You can close this window now." -ForegroundColor Gray 