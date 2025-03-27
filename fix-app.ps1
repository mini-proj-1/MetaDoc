# Emergency fix script for Metaverse Doctor application

Write-Host "Starting emergency fix for Metaverse Doctor application..." -ForegroundColor Red

# Kill ALL node processes to ensure clean start
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Forcefully stopping node process: $($_.Id)" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# Check for any processes on our ports
$portsToCheck = @(3000, 3001, 5173)
foreach ($port in $portsToCheck) {
    $processInfo = netstat -ano | Select-String ":$port "
    if ($processInfo) {
        $line = $processInfo | Select-Object -First 1
        $parts = $line -split '\s+'
        $processId = $parts[-1]
        Write-Host "Killing process $processId using port $port" -ForegroundColor Yellow
        try {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "Failed to kill process on port $port" -ForegroundColor Red
        }
    }
}
Start-Sleep -Seconds 2

# Use explicit port 5173 for frontend since that seems to work better
$FRONTEND_PORT = 5173
$BACKEND_PORT = 3001

# Start backend server in a new window
Write-Host "Starting backend server on port $BACKEND_PORT..." -ForegroundColor Cyan
$backendProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$PSScriptRoot\backend'; npm start" -NoNewWindow -PassThru

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Start frontend in a new window with explicit port
Write-Host "Starting frontend on port $FRONTEND_PORT..." -ForegroundColor Cyan
$frontendProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$PSScriptRoot\frontend'; npm run dev -- --port $FRONTEND_PORT --host" -NoNewWindow -PassThru

# Wait for frontend to start
Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Try to open browser
try {
    Write-Host "Opening browser to frontend..." -ForegroundColor Green
    Start-Process "http://localhost:$FRONTEND_PORT"
    
    Write-Host "`nEmergency fix applied!" -ForegroundColor Green
    Write-Host "The frontend should be available at: http://localhost:$FRONTEND_PORT" -ForegroundColor Green
    Write-Host "The backend API is available at: http://localhost:$BACKEND_PORT/api" -ForegroundColor Green
    Write-Host "`nBoth services are running in separate windows. Close those windows to stop the servers." -ForegroundColor Yellow
    
    # Save the PIDs for reference
    "Backend PID: $($backendProcess.Id)" | Out-File -FilePath "$PSScriptRoot\services.txt"
    "Frontend PID: $($frontendProcess.Id)" | Out-File -FilePath "$PSScriptRoot\services.txt" -Append
    "Frontend URL: http://localhost:$FRONTEND_PORT" | Out-File -FilePath "$PSScriptRoot\services.txt" -Append
    "Backend URL: http://localhost:$BACKEND_PORT/api" | Out-File -FilePath "$PSScriptRoot\services.txt" -Append
    
    Write-Host "Service information saved to services.txt" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} 