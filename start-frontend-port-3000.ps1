# PowerShell script to start frontend on port 3000
Write-Host "Starting Metaverse Doctor Frontend on port 3000..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location "$PSScriptRoot\frontend"

# Start frontend on port 3000
npm run dev -- --port 3000 