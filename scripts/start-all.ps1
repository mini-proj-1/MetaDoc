# PowerShell script to start both backend and frontend servers
# Start backend in a new PowerShell window
Start-Process PowerShell -ArgumentList "-NoExit", "-File", "C:\metadoc\scripts\start-backend.ps1"

# Start frontend in a new PowerShell window
Start-Process PowerShell -ArgumentList "-NoExit", "-File", "C:\metadoc\scripts\start-frontend.ps1"

Write-Host "Started both servers in separate windows. Check those windows for output." 