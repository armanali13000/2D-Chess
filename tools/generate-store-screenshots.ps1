Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$assets = Join-Path $root "assets"
$outDir = Join-Path $assets "store-listing"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-RectF($x, $y, $w, $h) {
  [System.Drawing.RectangleF]::new([single]$x, [single]$y, [single]$w, [single]$h)
}

function New-RoundPath($rect, $radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = [single]($radius * 2)
  $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $path
}

function Fill-RoundRect($g, $brush, $rect, $radius) {
  $path = New-RoundPath $rect $radius
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function Draw-RoundRect($g, $pen, $rect, $radius) {
  $path = New-RoundPath $rect $radius
  $g.DrawPath($pen, $path)
  $path.Dispose()
}

function Draw-CoverImage($g, $image, $rect) {
  $scale = [Math]::Max($rect.Width / $image.Width, $rect.Height / $image.Height)
  $w = $image.Width * $scale
  $h = $image.Height * $scale
  $x = $rect.X + (($rect.Width - $w) / 2)
  $y = $rect.Y + (($rect.Height - $h) / 2)
  $dest = New-RectF $x $y $w $h
  $g.DrawImage($image, $dest)
}

function Draw-Text([System.Drawing.Graphics]$g, [string]$text, [string]$family, $size, [System.Drawing.FontStyle]$style, [System.Drawing.Brush]$brush, [System.Drawing.RectangleF]$rect, [string]$align = "Center") {
  $font = New-Object System.Drawing.Font($family, [single]$size, $style, [System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::$align
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $g.DrawString($text, $font, $brush, [System.Drawing.RectangleF]$rect, $fmt)
  $fmt.Dispose()
  $font.Dispose()
}

function Draw-Button($g, $text, $rect) {
  $buttonBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 68, 68, 68))
  $white = [System.Drawing.Brushes]::White
  Fill-RoundRect $g $buttonBrush $rect 18
  Draw-Text $g $text "Arial" ($rect.Height * 0.34) ([System.Drawing.FontStyle]::Regular) $white $rect
  $buttonBrush.Dispose()
}

function Draw-AppMenu($g, $rect, $variant) {
  $bgName = if ($variant -eq "settings") { "setting-background.jpg" } else { "background.jpg" }
  $bg = [System.Drawing.Image]::FromFile((Join-Path $assets "background\$bgName"))
  Draw-CoverImage $g $bg $rect
  $bg.Dispose()

  $overlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 0, 0, 0))
  $g.FillRectangle($overlay, $rect)
  $overlay.Dispose()

  $white = [System.Drawing.Brushes]::White
  $muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 255, 255, 255))
  $screenTitle = if ($variant -eq "select") { "Select Mode" } elseif ($variant -eq "settings") { "Settings" } else { "Main Menu" }
  Draw-Text $g "2D Chess" "Arial" ($rect.Width * 0.145) ([System.Drawing.FontStyle]::Bold) $white (New-RectF $rect.X ($rect.Y + $rect.Height * 0.15) $rect.Width ($rect.Height * 0.11))
  Draw-Text $g $screenTitle "Arial" ($rect.Width * 0.08) ([System.Drawing.FontStyle]::Regular) $white (New-RectF $rect.X ($rect.Y + $rect.Height * 0.34) $rect.Width ($rect.Height * 0.08))

  $buttonW = $rect.Width * 0.70
  $buttonH = $rect.Height * 0.064
  $buttonX = $rect.X + (($rect.Width - $buttonW) / 2)
  $startY = $rect.Y + $rect.Height * 0.45
  if ($variant -eq "select") {
    Draw-Button $g "1 Player" (New-RectF $buttonX $startY $buttonW $buttonH)
    Draw-Button $g "2 Player" (New-RectF $buttonX ($startY + $buttonH * 1.55) $buttonW $buttonH)
    Draw-Button $g "Back" (New-RectF $buttonX ($startY + $buttonH * 3.10) $buttonW $buttonH)
  } elseif ($variant -eq "settings") {
    Draw-Button $g "Sound: ON" (New-RectF $buttonX ($startY + $buttonH * 0.80) $buttonW $buttonH)
    Draw-Button $g "Back" (New-RectF $buttonX ($startY + $buttonH * 2.35) $buttonW $buttonH)
  } else {
    Draw-Button $g "Play" (New-RectF $buttonX $startY $buttonW $buttonH)
    Draw-Button $g "Settings" (New-RectF $buttonX ($startY + $buttonH * 1.55) $buttonW $buttonH)
    Draw-Button $g "Exit" (New-RectF $buttonX ($startY + $buttonH * 3.10) $buttonW $buttonH)
  }
  Draw-Text $g "Developed by Arman" "Arial" ($rect.Width * 0.04) ([System.Drawing.FontStyle]::Regular) $muted (New-RectF $rect.X ($rect.Bottom - $rect.Height * 0.075) $rect.Width ($rect.Height * 0.04))
  $muted.Dispose()
}

function Get-Piece($name) {
  [System.Drawing.Image]::FromFile((Join-Path $assets "pieces\$name.png"))
}

function Draw-Board($g, $boardRect) {
  $light = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#f0d9b5"))
  $dark = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#b58863"))
  $last = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#f7ec70"))
  $tile = $boardRect.Width / 8

  for ($r = 0; $r -lt 8; $r++) {
    for ($c = 0; $c -lt 8; $c++) {
      $sq = New-RectF ($boardRect.X + $c * $tile) ($boardRect.Y + $r * $tile) $tile $tile
      $brush = if (($r -eq 6 -and $c -eq 4) -or ($r -eq 4 -and $c -eq 4)) { $last } elseif ((($r + $c) % 2) -eq 0) { $light } else { $dark }
      $g.FillRectangle($brush, $sq)
    }
  }

  $pieces = @{
    "0,0"="black-rook"; "0,1"="black-knight"; "0,2"="black-bishop"; "0,3"="black-queen"; "0,4"="black-king"; "0,5"="black-bishop"; "0,6"="black-knight"; "0,7"="black-rook";
    "1,0"="black-pawn"; "1,1"="black-pawn"; "1,2"="black-pawn"; "1,3"="black-pawn"; "1,5"="black-pawn"; "1,6"="black-pawn"; "1,7"="black-pawn";
    "3,4"="black-pawn"; "4,4"="white-pawn";
    "6,0"="white-pawn"; "6,1"="white-pawn"; "6,2"="white-pawn"; "6,3"="white-pawn"; "6,5"="white-pawn"; "6,6"="white-pawn"; "6,7"="white-pawn";
    "7,0"="white-rook"; "7,1"="white-knight"; "7,2"="white-bishop"; "7,3"="white-queen"; "7,4"="white-king"; "7,5"="white-bishop"; "7,6"="white-knight"; "7,7"="white-rook";
  }

  foreach ($key in $pieces.Keys) {
    $parts = $key.Split(",")
    $r = [int]$parts[0]
    $c = [int]$parts[1]
    $img = Get-Piece $pieces[$key]
    $pad = $tile * 0.05
    $dest = New-RectF ($boardRect.X + $c * $tile + $pad) ($boardRect.Y + $r * $tile + $pad) ($tile - 2 * $pad) ($tile - 2 * $pad)
    $g.DrawImage($img, $dest)
    $img.Dispose()
  }

  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 0, 0, 0), [single]3)
  $g.DrawRectangle($pen, $boardRect.X, $boardRect.Y, $boardRect.Width, $boardRect.Height)
  $pen.Dispose()
  $light.Dispose(); $dark.Dispose(); $last.Dispose()
}

function Draw-AppGame($g, $rect) {
  $bg = [System.Drawing.Image]::FromFile((Join-Path $assets "background\b-bg.jpg"))
  Draw-CoverImage $g $bg $rect
  $bg.Dispose()

  $overlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(50, 0, 0, 0))
  $g.FillRectangle($overlay, $rect)
  $overlay.Dispose()

  $boardSize = [Math]::Min($rect.Width * 0.92, $rect.Height * 0.52)
  $board = New-RectF ($rect.X + ($rect.Width - $boardSize) / 2) ($rect.Y + $rect.Height * 0.25) $boardSize $boardSize
  Draw-Board $g $board

  $buttonW = $rect.Width * 0.28
  $buttonH = $rect.Height * 0.052
  $by = $board.Bottom + $rect.Height * 0.035
  Draw-Button $g "Undo" (New-RectF ($rect.X + $rect.Width * 0.19) $by $buttonW $buttonH)
  Draw-Button $g "Restart" (New-RectF ($rect.X + $rect.Width * 0.53) $by $buttonW $buttonH)
}

function Draw-Device($g, $rect, $screenKind) {
  $shadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(65, 0, 0, 0))
  Fill-RoundRect $g $shadow (New-RectF ($rect.X + 26) ($rect.Y + 38) $rect.Width $rect.Height) 52
  $shadow.Dispose()

  $frame = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 16, 20, 28))
  Fill-RoundRect $g $frame $rect 52
  $frame.Dispose()

  $inset = $rect.Width * 0.045
  $screen = New-RectF ($rect.X + $inset) ($rect.Y + $inset * 1.35) ($rect.Width - 2 * $inset) ($rect.Height - 2.7 * $inset)
  $screenPath = New-RoundPath $screen 34
  $oldClip = $g.Clip
  $g.SetClip($screenPath)
  if ($screenKind -eq "menu" -or $screenKind -eq "select" -or $screenKind -eq "settings") {
    Draw-AppMenu $g $screen $screenKind
  } else {
    Draw-AppGame $g $screen
  }
  $g.Clip = $oldClip
  $screenPath.Dispose()

  $shine = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 255, 255, 255), [single]3)
  Draw-RoundRect $g $shine $rect 52
  $shine.Dispose()
}

function Draw-Promo($path, $w, $h, $kind, $deviceType) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $bgRect = [System.Drawing.Rectangle]::new(0, 0, $w, $h)
  $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bgRect, [System.Drawing.ColorTranslator]::FromHtml("#eaf6ff"), [System.Drawing.ColorTranslator]::FromHtml("#182331"), 45)
  $g.FillRectangle($grad, $bgRect)
  $grad.Dispose()

  $soft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(95, 255, 255, 255))
  $g.FillEllipse($soft, -($w * 0.22), $h * 0.03, $w * 0.70, $w * 0.70)
  $g.FillEllipse($soft, $w * 0.68, $h * 0.18, $w * 0.52, $w * 0.52)
  $soft.Dispose()

  $darkText = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#101820"))
  $subText = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#32465a"))
  $title = if ($kind -eq "menu") { "Start Your Match" } elseif ($kind -eq "select") { "Choose Your Mode" } elseif ($kind -eq "settings") { "Play Your Way" } else { "Classic 2D Chess" }
  $subtitle = if ($kind -eq "menu") { "Quick play, clean menus, and focused chess action." } elseif ($kind -eq "select") { "Enjoy solo practice or local two-player matches." } elseif ($kind -eq "settings") { "Simple controls keep the focus on strategy." } else { "Move pieces, undo turns, and enjoy a clear board." }

  Draw-Text $g $title "Arial" ($w * 0.082) ([System.Drawing.FontStyle]::Bold) $darkText (New-RectF ($w * 0.08) ($h * 0.055) ($w * 0.84) ($h * 0.07))
  Draw-Text $g $subtitle "Arial" ($w * 0.033) ([System.Drawing.FontStyle]::Regular) $subText (New-RectF ($w * 0.10) ($h * 0.125) ($w * 0.80) ($h * 0.055))

  if ($deviceType -eq "phone") {
    $deviceW = $w * 0.58
    $deviceH = $deviceW * 2.05
  } else {
    $deviceW = $w * 0.72
    $deviceH = $deviceW * 1.42
  }
  if ($deviceH -gt $h * 0.75) {
    $deviceH = $h * 0.75
    $deviceW = if ($deviceType -eq "phone") { $deviceH / 2.05 } else { $deviceH / 1.42 }
  }
  $device = New-RectF (($w - $deviceW) / 2) ($h * 0.205) $deviceW $deviceH
  Draw-Device $g $device $kind

  $badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 16, 24, 32))
  $badge = New-RectF ($w * 0.20) ($h * 0.90) ($w * 0.60) ($h * 0.045)
  Fill-RoundRect $g $badgeBrush $badge ($h * 0.02)
  Draw-Text $g "2D Chess" "Arial" ($w * 0.032) ([System.Drawing.FontStyle]::Bold) ([System.Drawing.Brushes]::White) $badge
  $badgeBrush.Dispose()
  $darkText.Dispose(); $subText.Dispose()

  $png = [System.Drawing.Imaging.ImageFormat]::Png
  $bmp.Save($path, $png)
  $g.Dispose()
  $bmp.Dispose()
}

$jobs = @(
  @{ File = "phone-01-gameplay.png"; Width = 1080; Height = 1920; Kind = "game"; Device = "phone" },
  @{ File = "phone-02-menu.png"; Width = 1080; Height = 1920; Kind = "menu"; Device = "phone" },
  @{ File = "phone-03-select-mode.png"; Width = 1080; Height = 1920; Kind = "select"; Device = "phone" },
  @{ File = "phone-04-settings.png"; Width = 1080; Height = 1920; Kind = "settings"; Device = "phone" },
  @{ File = "tablet-7-01-gameplay.png"; Width = 1440; Height = 2560; Kind = "game"; Device = "tablet" },
  @{ File = "tablet-7-02-menu.png"; Width = 1440; Height = 2560; Kind = "menu"; Device = "tablet" },
  @{ File = "tablet-7-03-select-mode.png"; Width = 1440; Height = 2560; Kind = "select"; Device = "tablet" },
  @{ File = "tablet-7-04-settings.png"; Width = 1440; Height = 2560; Kind = "settings"; Device = "tablet" },
  @{ File = "tablet-10-01-gameplay.png"; Width = 1800; Height = 3200; Kind = "game"; Device = "tablet" },
  @{ File = "tablet-10-02-menu.png"; Width = 1800; Height = 3200; Kind = "menu"; Device = "tablet" },
  @{ File = "tablet-10-03-select-mode.png"; Width = 1800; Height = 3200; Kind = "select"; Device = "tablet" },
  @{ File = "tablet-10-04-settings.png"; Width = 1800; Height = 3200; Kind = "settings"; Device = "tablet" }
)

foreach ($job in $jobs) {
  $path = Join-Path $outDir $job.File
  Draw-Promo $path $job.Width $job.Height $job.Kind $job.Device
  $item = Get-Item $path
  "{0} - {1}x{2} - {3:N0} bytes" -f $item.Name, $job.Width, $job.Height, $item.Length
}
