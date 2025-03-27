# Simple direct fix for Metaverse Doctor application

Write-Host "Starting quick fix for Metaverse Doctor application..." -ForegroundColor Cyan

# Kill existing processes
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Write-Host "Killed existing Node.js processes" -ForegroundColor Yellow
Start-Sleep -Seconds 2

# EXPLICITLY use port 5173 for frontend
$frontendPort = 5173
$backendPort = 3001

# Create two separate command windows for better visibility
Write-Host "Starting backend on port $backendPort..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command cd C:\metadoc\backend; npm start"

Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Starting frontend on port $frontendPort..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command cd C:\metadoc\frontend; npm run dev -- --port $frontendPort"

Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser to correct URL (port 5173)
Start-Process "http://localhost:$frontendPort"

Write-Host "`nApplication started!" -ForegroundColor Green
Write-Host "FRONTEND URL: http://localhost:$frontendPort" -ForegroundColor Cyan
Write-Host "BACKEND URL: http://localhost:$backendPort/api" -ForegroundColor Cyan
Write-Host "`nClose the command windows to stop the application." -ForegroundColor Yellow 