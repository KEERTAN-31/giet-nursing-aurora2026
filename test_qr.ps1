param (
    [string]$Url = "https://giet-nursing-aurora2026.netlify.app",
    [string]$OutputFile = "assets\wall_qr_code.png"
)

Add-Type -AssemblyName System.Drawing

# Helper to create QR code bitmap using pure PowerShell/.NET
# For high reliability, let's create a clean script that can generate standard QR matrices
# We can also call a headless Edge/Chrome or generate directly

Write-Host "Target URL: $Url"
Write-Host "Generating QR image at: $OutputFile"
