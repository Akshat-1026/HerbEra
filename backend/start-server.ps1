Start-Process -FilePath "node" -ArgumentList "cluster.js" -WorkingDirectory "D:\HerbEra\Herb-Era\Herb-Era\backend" -WindowStyle Hidden
Start-Sleep -Seconds 10
try {
    $r = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Output "SERVER STARTED: $($r.Content)"
} catch {
    Write-Output "SERVER NOT RESPONDING: $($_.Exception.Message)"
}
