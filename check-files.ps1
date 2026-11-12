# CommuteSafe SA - check that every updated file is the correct, latest version.
# It only READS files; it never changes anything.
#
# Run it as a file (don't paste it into the window):
#   powershell -ExecutionPolicy Bypass -File .\check-files.ps1

param([string]$Project = "C:\Users\27780\Documents\CommuteSafe SA")

# Fingerprint of the correct version of each file
$expected = [ordered]@{
  "backend\db\migration_002_features.sql" = "2cefa36e31b23970"
  "backend\src\app.js" = "28147f04e01678d4"
  "backend\src\models\Report.js" = "60825629c1016cc4"
  "backend\src\models\Contact.js" = "8c61d26b113bbbd4"
  "backend\src\models\Trip.js" = "e74d085612cabac5"
  "backend\src\models\Rank.js" = "b0934294b4cac70a"
  "backend\src\models\Notification.js" = "abda14ab34b44bb7"
  "backend\src\controllers\reportController.js" = "dbcc4d50e74735bb"
  "backend\src\controllers\sosController.js" = "0699a4eecf562b49"
  "backend\src\controllers\contactController.js" = "e005d7b8b44bcda5"
  "backend\src\controllers\tripController.js" = "e9623d5f34ac7919"
  "backend\src\controllers\rankController.js" = "cad0e9043349098d"
  "backend\src\controllers\notificationController.js" = "addc511eece2fefe"
  "backend\src\routes\contactRoutes.js" = "f6010de755c14ed6"
  "backend\src\routes\tripRoutes.js" = "7ced9a252cf47b00"
  "backend\src\routes\rankRoutes.js" = "a4767c2b355135d5"
  "backend\src\routes\notificationRoutes.js" = "89d88b8e750d7d42"
  "backend\src\services\flagService.js" = "bfe6ac8a2294de62"
  "backend\src\services\photoService.js" = "38115df34d741412"
  "mobile\App.js" = "4c0cd2389f747f43"
  "mobile\app.json" = "9f5534f4686dbdd8"
  "mobile\assets\icon.png" = "b3dc04fc09262ddf"
  "mobile\assets\splash-icon.png" = "3901beed85f31a71"
  "mobile\assets\favicon.png" = "034b8723256e04a6"
  "mobile\assets\android-icon-foreground.png" = "8bd59b8d1d66573f"
  "mobile\assets\android-icon-background.png" = "698193772c7c2d19"
  "mobile\assets\android-icon-monochrome.png" = "33a5c36c66ff5540"
  "mobile\src\theme\colors.js" = "4739f1ea24a77116"
  "mobile\src\navigation\MainTabs.js" = "63219e32b4b1d59d"
  "mobile\src\navigation\RootNavigator.js" = "4be18d825b1c06a5"
  "mobile\src\i18n\strings.js" = "657ef19f112732bd"
  "mobile\src\i18n\LanguageContext.js" = "707c9cad6cf36118"
  "mobile\src\context\NotificationsContext.js" = "c1720804f78cd9cd"
  "mobile\src\components\ActionCard.js" = "34769a1531df59d4"
  "mobile\src\components\TextField.js" = "9759d3bfd7a8193f"
  "mobile\src\components\Skeleton.js" = "b4ed101d3a4977b7"
  "mobile\src\components\Toast.js" = "fdc9606f12acc983"
  "mobile\src\components\ScreenHeader.js" = "a71da8301ebb4d3e"
  "mobile\src\components\MapPreview.native.js" = "31ddfa3bcaad6f12"
  "mobile\src\components\MapPreview.web.js" = "a1c67c84fe5127e5"
  "mobile\src\components\mapUtils.js" = "1b0ffc47a615647c"
  "mobile\src\utils\location.js" = "b8d5083c8ea9da46"
  "mobile\src\utils\messaging.js" = "89d1493f741a6c12"
  "mobile\src\utils\photo.js" = "57ead425ede2ceef"
  "mobile\src\utils\settings.js" = "7ac9ece373db8b4c"
  "mobile\src\utils\notify.native.js" = "3a5c43c8ecb4d0f9"
  "mobile\src\utils\notify.web.js" = "8b4a2cf8bbdc2483"
  "mobile\src\screens\HomeScreen.js" = "4bdd51e50fc4f28d"
  "mobile\src\screens\ReportScreen.js" = "c4e8a8d754d85c7d"
  "mobile\src\screens\SosScreen.js" = "caa37b9de7379cb0"
  "mobile\src\screens\ProfileScreen.js" = "41f4bf645d402ec7"
  "mobile\src\screens\MyReportsScreen.js" = "47eff2ae7a153fcc"
  "mobile\src\screens\CheckVehicleScreen.js" = "00d1dfeef9027915"
  "mobile\src\screens\RouteRiskScreen.js" = "f83385aaef60a3fc"
  "mobile\src\screens\RegisterScreen.js" = "887b913ce4130091"
  "mobile\src\screens\ContactsScreen.js" = "7e3d2a27329e5cfe"
  "mobile\src\screens\TripScreen.js" = "61c1756e0e9265cf"
  "mobile\src\screens\RanksScreen.js" = "fb7f3f1b660330ba"
  "mobile\src\screens\NotificationsScreen.js" = "4c0a4e87fb16c2e3"
  "mobile\src\screens\NotificationSettingsScreen.js" = "551d8a3485e245e9"
  "mobile\src\screens\LanguageScreen.js" = "0c10c75ce39ea074"
}

function Get-Fingerprint([string]$path) {
  if ($path.ToLower().EndsWith(".png")) {
    return (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash.ToLower().Substring(0, 16)
  }
  # Ignore differences that pasting can cause: Windows line endings, a BOM, trailing blank lines
  $text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
  $text = $text.Replace("`r`n", "`n").TrimEnd()
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
  $sha = [System.Security.Cryptography.SHA256]::Create()
  $hex = -join ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString("x2") })
  return $hex.Substring(0, 16)
}

if (-not (Test-Path -LiteralPath $Project)) {
  Write-Host "Project folder not found: $Project" -ForegroundColor Red
  exit 1
}

$ok = 0; $outdated = @(); $missing = @()
foreach ($rel in $expected.Keys) {
  $path = Join-Path $Project $rel
  if (-not (Test-Path -LiteralPath $path)) { $missing += $rel; continue }
  if ((Get-Fingerprint $path) -eq $expected[$rel]) { $ok++ } else { $outdated += $rel }
}

Write-Host ""
Write-Host "Correct: $ok of $($expected.Count) files" -ForegroundColor Green

if ($outdated.Count) {
  Write-Host ""
  Write-Host "OUTDATED or different ($($outdated.Count)) - replace with the version from the chat:" -ForegroundColor Yellow
  $outdated | ForEach-Object { Write-Host "  OUTDATED  $_" -ForegroundColor Yellow }
}
if ($missing.Count) {
  Write-Host ""
  Write-Host "MISSING ($($missing.Count)) - create these from the chat:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host "  MISSING   $_" -ForegroundColor Red }
}
if (-not $outdated.Count -and -not $missing.Count) {
  Write-Host "Everything is up to date." -ForegroundColor Green
}
Write-Host ""
