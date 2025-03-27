# PowerShell script to start both frontend and backend

Write-Host "Starting Metaverse Doctor Application with Blockchain Integration..." -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# Verify npm is installed
try {
    $npmVersion = npm -v
    Write-Host "Using npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm is not installed or not in PATH. Please install Node.js and npm." -ForegroundColor Red
    exit 1
}

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    $netstatOutput = netstat -ano | Select-String "[:.]$Port\s"
    return $null -ne $netstatOutput
}

# Function to find process using a port
function Get-ProcessIdByPort {
    param (
        [int]$Port
    )
    
    $netstatOutput = netstat -ano | Select-String "[:.]$Port\s"
    if ($netstatOutput) {
        $line = $netstatOutput.Line | Select-Object -First 1
        $processId = [regex]::Match($line, '\s+(\d+)$').Groups[1].Value
        return $processId
    }
    return $null
}

# Clear any existing processes on our ports
$BACKEND_PORT = 3001
$FRONTEND_PORT = 3000

function Clear-PortIfNeeded {
    param (
        [int]$Port,
        [string]$ServiceName
    )
    
    if (Test-PortInUse -Port $Port) {
        Write-Host "Warning: Port $Port is already in use. Attempting to free it..." -ForegroundColor Yellow
        $processId = Get-ProcessIdByPort -Port $Port
        
        if ($processId) {
            try {
                Stop-Process -Id $processId -Force
                Write-Host "Stopped process $processId using port $Port" -ForegroundColor Green
                Start-Sleep -Seconds 2
            } catch {
                Write-Host "Could not stop process using port $Port. Please stop it manually." -ForegroundColor Red
            }
        }
    }
}

# Clear ports
Clear-PortIfNeeded -Port $BACKEND_PORT -ServiceName "Backend"
Clear-PortIfNeeded -Port $FRONTEND_PORT -ServiceName "Frontend"

# Stop any existing node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping existing node process: $($_.Id)" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# Function to run a process in the background and save its PID
function Start-BackgroundProcess {
    param (
        [string]$Name,
        [string]$WorkingDirectory,
        [string]$Command
    )
    
    Write-Host "Starting $Name..." -ForegroundColor Green
    
    Push-Location $WorkingDirectory
    
    # Set environment variables
    $env:PORT = $FRONTEND_PORT
    $env:REACT_APP_API_URL = "http://localhost:$BACKEND_PORT"
    
    # Start the process
    $process = Start-Process -FilePath "powershell" -ArgumentList "-Command", $Command -NoNewWindow -PassThru
    
    # Save PID to file
    $process.Id | Out-File -FilePath "$PSScriptRoot\$Name.pid"
    
    Write-Host "$Name started with PID $($process.Id)" -ForegroundColor Green
    
    Pop-Location
    
    return $process.Id
}

# Function to verify a service is running
function Test-ServiceIsRunning {
    param (
        [string]$Name,
        [string]$Url,
        [int]$MaxAttempts = 10
    )
    
    Write-Host "Verifying $Name is running at $Url..." -ForegroundColor Yellow
    
    $attempt = 1
    $running = $false
    
    while (-not $running -and $attempt -le $MaxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method HEAD -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $running = $true
                Write-Host "$Name is running and responding on $Url" -ForegroundColor Green
            }
        } catch {
            Write-Host "Attempt $attempt: $Name not responding yet..." -ForegroundColor Yellow
        }
        
        if (-not $running) {
            Start-Sleep -Seconds 3
            $attempt++
        }
    }
    
    return $running
}

# Install dependencies if needed
if (-not (Test-Path "$PSScriptRoot\backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location -Path "$PSScriptRoot\backend"
    npm install
}

if (-not (Test-Path "$PSScriptRoot\frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location -Path "$PSScriptRoot\frontend"
    npm install
}

# Test the blockchain integration
Write-Host "Testing blockchain integration (mock implementation)..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
node src/test-blockchain.js
$TEST_RESULT = $LASTEXITCODE
if ($TEST_RESULT -ne 0) {
    Write-Host "Blockchain integration test failed. Please check the logs above." -ForegroundColor Red
    exit 1
}

# Test API routes
Write-Host "Testing blockchain API routes (mock implementation)..." -ForegroundColor Cyan
node src/test-api-routes.js
$TEST_RESULT = $LASTEXITCODE
Set-Location -Path $PSScriptRoot
if ($TEST_RESULT -ne 0) {
    Write-Host "API routes test failed. Please check the logs above." -ForegroundColor Red
    exit 1
}

# Start the backend server
$backendPid = Start-BackgroundProcess -Name "backend" -WorkingDirectory "$PSScriptRoot\backend" -Command "npm start | Out-File -FilePath '$PSScriptRoot\backend.log' -Append"

# Wait for the backend to start up
Write-Host "Waiting for backend to start up..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verify backend is running
$backendRunning = Test-ServiceIsRunning -Name "Backend" -Url "http://localhost:$BACKEND_PORT/api/health"
if (-not $backendRunning) {
    Write-Host "Backend failed to start properly. Check backend.log for details." -ForegroundColor Red
    
    # Show last few lines of backend log
    if (Test-Path "$PSScriptRoot\backend.log") {
        Write-Host "Last 10 lines of backend log:" -ForegroundColor Cyan
        Get-Content -Path "$PSScriptRoot\backend.log" -Tail 10
    }
    
    Write-Host "Continuing anyway, but the application may not function correctly." -ForegroundColor Yellow
}

# Start the frontend
$frontendPid = Start-BackgroundProcess -Name "frontend" -WorkingDirectory "$PSScriptRoot\frontend" -Command "npm run dev -- --port $FRONTEND_PORT --host | Out-File -FilePath '$PSScriptRoot\frontend.log' -Append"

# Verify frontend is running
Start-Sleep -Seconds 5
$frontendRunning = Test-ServiceIsRunning -Name "Frontend" -Url "http://localhost:$FRONTEND_PORT"

if (-not $frontendRunning) {
    Write-Host "Frontend failed to start on port $FRONTEND_PORT. Checking logs..." -ForegroundColor Red
    
    # Show last few lines of frontend log
    if (Test-Path "$PSScriptRoot\frontend.log") {
        Write-Host "Last 10 lines of frontend log:" -ForegroundColor Cyan
        Get-Content -Path "$PSScriptRoot\frontend.log" -Tail 10
    }
    
    Write-Host "Trying alternate Vite port 5173..." -ForegroundColor Yellow
    $frontendRunning = Test-ServiceIsRunning -Name "Frontend" -Url "http://localhost:5173"
    
    if ($frontendRunning) {
        Write-Host "Frontend is running on port 5173 instead of $FRONTEND_PORT" -ForegroundColor Green
        $FRONTEND_PORT = 5173
    } else {
        Write-Host "Frontend still not running. Please check frontend.log for details." -ForegroundColor Red
    }
}

# Provide information to the user
Write-Host "`nMetaverse Doctor with Blockchain Integration is starting up!" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:$BACKEND_PORT/api"
Write-Host "Frontend UI: http://localhost:$FRONTEND_PORT"
Write-Host "`nNote: Using mock blockchain implementation for demonstration purposes." -ForegroundColor Yellow
Write-Host "`nTo stop all services, press Ctrl+C or close this window." -ForegroundColor Yellow

# Open browser to the frontend
Start-Process "http://localhost:$FRONTEND_PORT"

# Cleanup function
function Stop-AllServices {
    Write-Host "`nShutting down services..." -ForegroundColor Red
    
    # Stop backend process
    if (Test-Path "$PSScriptRoot\backend.pid") {
        $backendProcessId = Get-Content "$PSScriptRoot\backend.pid"
        try {
            Stop-Process -Id $backendProcessId -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped backend process: $backendProcessId" -ForegroundColor Green
        } catch {
            Write-Host "Could not stop backend process: $backendProcessId" -ForegroundColor Red
        }
        Remove-Item "$PSScriptRoot\backend.pid" -ErrorAction SilentlyContinue
    }
    
    # Stop frontend process
    if (Test-Path "$PSScriptRoot\frontend.pid") {
        $frontendProcessId = Get-Content "$PSScriptRoot\frontend.pid"
        try {
            Stop-Process -Id $frontendProcessId -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped frontend process: $frontendProcessId" -ForegroundColor Green
        } catch {
            Write-Host "Could not stop frontend process: $frontendProcessId" -ForegroundColor Red
        }
        Remove-Item "$PSScriptRoot\frontend.pid" -ErrorAction SilentlyContinue
    }
    
    # Stop all node processes to be sure
    Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped node process: $($_.Id)" -ForegroundColor Green
    }
    
    Write-Host "All services stopped." -ForegroundColor Red
}

# Keep script running with clean exit on Ctrl+C
try {
    Write-Host "`nPress Ctrl+C to stop all services..." -ForegroundColor Gray
    while ($true) {
        Start-Sleep -Seconds 10
    }
} finally {
    Stop-AllServices
    exit 0
} 