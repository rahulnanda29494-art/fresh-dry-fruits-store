# Fresh Dry Fruits — one-command local start
# Starts the portable PostgreSQL instance (if not already running),
# then the API (:4000) and the web frontend (:5173), each in its own window.

$ErrorActionPreference = 'Stop'
$root   = $PSScriptRoot
$pgBin  = 'C:\Users\Kirti\pgsql-local\pgsql\bin'
$pgData = 'C:\Users\Kirti\pgsql-local\data'
$pgLog  = 'C:\Users\Kirti\pgsql-local\server.log'

Write-Host '== Fresh Dry Fruits: starting local stack ==' -ForegroundColor Cyan

# 1. PostgreSQL
& "$pgBin\pg_ctl.exe" -D $pgData status *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Host '[db]  PostgreSQL already running on :5432' -ForegroundColor Green
} else {
    Write-Host '[db]  Starting PostgreSQL on :5432 ...' -ForegroundColor Yellow
    & "$pgBin\pg_ctl.exe" -D $pgData -l $pgLog -o '-p 5432' start
}

# 2. API  (:4000)  — opens in its own window so you can watch logs / Ctrl+C
Write-Host '[api] Starting API on :4000 (new window) ...' -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    '-NoExit','-Command',"Set-Location '$root\server'; npm run dev"
)

# 3. Web  (:5173)  — opens in its own window
Write-Host '[web] Starting frontend on :5173 (new window) ...' -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    '-NoExit','-Command',"Set-Location '$root\web'; npm run dev"
)

Write-Host ''
Write-Host 'All started. Open http://localhost:5173 in your browser.' -ForegroundColor Cyan
Write-Host 'Run stop-local.ps1 to shut everything down.' -ForegroundColor DarkGray
