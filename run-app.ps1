# Simple script to start the Metaverse Doctor application

Write-Host "Starting Metaverse Doctor application..." -ForegroundColor Green

# Kill existing node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping node process: $($_.Id)" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$PSScriptRoot\backend'; npm start" -NoNewWindow

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$PSScriptRoot\frontend'; npm run dev -- --port 3000 --host" -NoNewWindow

# Wait for frontend to start
Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser
Write-Host "Opening browser to frontend..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`nApplication started! The frontend is available at: http://localhost:3000" -ForegroundColor Green
Write-Host "The backend API is available at: http://localhost:3001/api" -ForegroundColor Green
Write-Host "`nPress Ctrl+C in the terminal windows to stop the servers" -ForegroundColor Yellow 