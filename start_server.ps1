# Simple Local Web Server for Testing on Phone
param (
    [int]$Port = 8080
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://*:$Port/"
try {
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Write-Host "=========================================================="
    Write-Host "Server running at: http://172.26.175.76:$Port/index.html"
    Write-Host "Connect your phone to the same Wi-Fi and open that link!"
    Write-Host "Press Ctrl+C to stop."
    Write-Host "=========================================================="
} catch {
    # If wildcard requires admin, bind to localhost
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Start()
    Write-Host "Server running locally at: http://localhost:$Port/index.html"
}

$baseDir = $PSScriptRoot

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $rawPath = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($rawPath) -or $rawPath -eq "/") {
        $rawPath = "index.html"
    }

    $filePath = Join-Path $baseDir $rawPath

    if (Test-Path $filePath -PathType Leaf) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = "text/plain"
        switch ($ext) {
            ".html" { $contentType = "text/html; charset=utf-8" }
            ".css"  { $contentType = "text/css; charset=utf-8" }
            ".js"   { $contentType = "application/javascript; charset=utf-8" }
            ".jpg"  { $contentType = "image/jpeg" }
            ".jpeg" { $contentType = "image/jpeg" }
            ".png"  { $contentType = "image/png" }
            ".svg"  { $contentType = "image/svg+xml" }
            ".json" { $contentType = "application/json" }
        }

        $response.ContentType = $contentType
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $notFoundMsg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($notFoundMsg, 0, $notFoundMsg.Length)
    }

    $response.OutputStream.Close()
}
