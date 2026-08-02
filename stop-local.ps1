# Fresh Dry Fruits — stop the local stack
# Stops the API/web dev servers (node on :4000 and :5173) and the PostgreSQL instance.

$pgBin  = 'C:\Users\Kirti\pgsql-local\pgsql\bin'
$pgData = 'C:\Users\Kirti\pgsql-local\data'

Write-Host '== Fresh Dry Fruits: stopping local stack ==' -ForegroundColor Cyan

# Stop node dev servers listening on 4000 / 5173
foreach ($port in 4000, 5173) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        try {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction Stop
            Write-Host "[stop] killed process on :$port (PID $($c.OwningProcess))" -ForegroundColor Yellow
        } catch {}
    }
}

# Stop PostgreSQL
& "$pgBin\pg_ctl.exe" -D $pgData status *> $null
if ($LASTEXITCODE -eq 0) {
    & "$pgBin\pg_ctl.exe" -D $pgData stop -m fast
    Write-Host '[db]  PostgreSQL stopped' -ForegroundColor Yellow
} else {
    Write-Host '[db]  PostgreSQL was not running' -ForegroundColor DarkGray
}

Write-Host 'Done.' -ForegroundColor Cyan
