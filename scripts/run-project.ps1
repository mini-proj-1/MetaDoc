# PowerShell script to run the Metaverse Doctor project
# This script provides instructions and options for running the project

Write-Host "=== Metaverse Doctor Project Runner ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Select an option:" -ForegroundColor Yellow
Write-Host "1. Start both servers (backend and frontend)" -ForegroundColor Green
Write-Host "2. Start backend server only" -ForegroundColor Green
Write-Host "3. Start frontend server only" -ForegroundColor Green
Write-Host "4. Stop all Node.js processes" -ForegroundColor Red
Write-Host "5. Exit" -ForegroundColor Gray
Write-Host ""

$option = Read-Host "Enter option number"

switch ($option) {
    "1" {
        Write-Host "Starting both servers in separate windows..." -ForegroundColor Cyan
        Start-Process PowerShell -ArgumentList "-NoExit", "-File", "C:\metadoc\scripts\start-backend.ps1"
        Start-Process PowerShell -ArgumentList "-NoExit", "-File", "C:\metadoc\scripts\start-frontend.ps1"
        Write-Host "Started both servers in separate windows." -ForegroundColor Green
        Write-Host "Backend API: http://localhost:3001" -ForegroundColor Yellow
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "Starting backend server..." -ForegroundColor Cyan
        Start-Process PowerShell -ArgumentList "-NoExit", "-File", "C:\metadoc\scripts\start-backend.ps1"
        Write-Host "Backend API started at: http://localhost:3001" -ForegroundColor Yellow
    }
    "3" {
        Write-Host "Starting frontend server..." -ForegroundColor Cyan
        Start-Process PowerShell -ArgumentList "-NoExit", "-File", "C:\metadoc\scripts\start-frontend.ps1"
        Write-Host "Frontend started at: http://localhost:3000" -ForegroundColor Yellow
    }
    "4" {
        Write-Host "Stopping all Node.js processes..." -ForegroundColor Red
        taskkill /f /im node.exe
        Write-Host "All Node.js processes have been terminated." -ForegroundColor Green
    }
    "5" {
        Write-Host "Exiting..." -ForegroundColor Gray
        exit
    }
    default {
        Write-Host "Invalid option. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Script completed. Check the new windows for server output." -ForegroundColor Cyan 