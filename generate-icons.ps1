
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$iconDir = Join-Path (Join-Path $PSScriptRoot "extension") "icons"

if (-not (Test-Path $iconDir)) {
    New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
}

$sizes = @(16, 48, 128)

foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($size, $size),
        [System.Drawing.Color]::FromArgb(79, 70, 229),
        [System.Drawing.Color]::FromArgb(139, 92, 246)
    )
    
    $radius = [int]($size * 0.2)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
    $path.AddArc($size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
    $path.AddArc($size - $radius * 2, $size - $radius * 2, $radius * 2, $radius * 2, 0, 90)
    $path.AddArc(0, $size - $radius * 2, $radius * 2, $radius * 2, 90, 90)
    $path.CloseFigure()
    
    $graphics.FillPath($gradient, $path)
    
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [int]($size * 0.08))
    $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    
    $centerX = $size / 2
    $centerY = $size / 2
    $boltWidth = $size * 0.35
    $boltHeight = $size * 0.5
    
    $pathBolt = New-Object System.Drawing.Drawing2D.GraphicsPath
    $pathBolt.StartFigure()
    $pathBolt.AddLine(
        [int]($centerX + $boltWidth * 0.15),
        [int]($centerY - $boltHeight * 0.45),
        [int]($centerX - $boltWidth * 0.35),
        [int]($centerY)
    )
    $pathBolt.AddLine(
        [int]($centerX - $boltWidth * 0.35),
        [int]($centerY),
        [int]($centerX - $boltWidth * 0.05),
        [int]($centerY)
    )
    $pathBolt.AddLine(
        [int]($centerX - $boltWidth * 0.05),
        [int]($centerY),
        [int]($centerX - $boltWidth * 0.15),
        [int]($centerY + $boltHeight * 0.45)
    )
    $pathBolt.AddLine(
        [int]($centerX - $boltWidth * 0.15),
        [int]($centerY + $boltHeight * 0.45),
        [int]($centerX + $boltWidth * 0.35),
        [int]($centerY)
    )
    $pathBolt.AddLine(
        [int]($centerX + $boltWidth * 0.35),
        [int]($centerY),
        [int]($centerX + $boltWidth * 0.05),
        [int]($centerY)
    )
    $pathBolt.CloseFigure()
    
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $graphics.FillPath($whiteBrush, $pathBolt)
    
    $outputPath = Join-Path $iconDir "icon$size.png"
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
    $gradient.Dispose()
    $whitePen.Dispose()
    $whiteBrush.Dispose()
    
    Write-Host "✅ Generated icon$size.png"
}

Write-Host "`n🎉 All icons generated successfully!"
