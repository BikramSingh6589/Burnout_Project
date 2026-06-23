# Zip the extension folder contents and put it in frontend/public
$extensionPath = "extension\*"
$outputPath = "frontend\public\burnout-guard-extension.zip"

# Remove existing zip if present
if (Test-Path $outputPath) {
    Remove-Item $outputPath -Force
}

# Create the zip (zip only the contents, not the folder itself)
Compress-Archive -Path $extensionPath -DestinationPath $outputPath -Force

Write-Host "Extension zipped successfully to: $outputPath"
