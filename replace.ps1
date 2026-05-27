$p = (Resolve-Path 'style.css').Path
$utf8 = [System.Text.Encoding]::UTF8
$c = [System.IO.File]::ReadAllText($p, $utf8)
$c = $c -replace '#005959', '#2C9E9E'
$c = $c -replace '#0f766e', '#2C9E9E'
$c = $c -replace '#0d9488', '#3BB8B8'
$c = $c -replace '#f4c542', '#F5A130'
$c = $c -replace '#ffb800', '#F5A130'
$c = $c -replace 'rgba\(15, 118, 110', 'rgba(44, 158, 158'
$c = $c -replace 'rgba\(0, 77, 77', 'rgba(44, 158, 158'
$c = $c -replace 'rgba\(244, 197, 66', 'rgba(245, 161, 48'
$c = $c -replace 'rgba\(14, 165, 233', 'rgba(59, 184, 184'
[System.IO.File]::WriteAllText($p, $c, $utf8)
Write-Host "Replaced successfully with UTF-8 encoding preserved!"
