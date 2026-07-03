param(
  [string]$EnvPath = "",
  [string]$DriveSaverUrl = "",
  [string]$AllowedOrigins = "null,http://127.0.0.1:8787,http://localhost:8787,https://mvp.jus9tecnologia.com.br",
  [switch]$GerarApiToken,
  [switch]$Forcar
)

$ErrorActionPreference = "Stop"

function ConvertFrom-SecureStringToPlainText {
  param(
    [Parameter(Mandatory = $true)]
    [System.Security.SecureString]$SecureString
  )

  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    if ($bstr -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
  }
}

function Set-EnvLine {
  param(
    [AllowEmptyCollection()]
    [string[]]$Lines,
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  $escapedName = [Regex]::Escape($Name)
  $found = $false
  $next = foreach ($line in $Lines) {
    if ($line -match "^\s*$escapedName\s*=") {
      $found = $true
      "$Name=$Value"
    } else {
      $line
    }
  }

  if (-not $found) {
    $next += "$Name=$Value"
  }

  $next
}

function New-UrlSafeToken {
  param(
    [int]$Bytes = 32
  )

  $apiTokenBytes = New-Object byte[] $Bytes
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($apiTokenBytes)
  } finally {
    if ($rng) {
      $rng.Dispose()
    }
  }

  [Convert]::ToBase64String($apiTokenBytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")
}

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
if (-not $EnvPath) {
  $EnvPath = Join-Path $repoRoot ".env"
}

if (-not $DriveSaverUrl) {
  $DriveSaverUrl = Read-Host -Prompt "URL do Web App do Apps Script"
}

if (-not $DriveSaverUrl) {
  throw "JUS9_DRIVE_SAVER_URL e obrigatoria."
}

if ($DriveSaverUrl -notmatch "^https://") {
  throw "Use uma URL https:// para o Web App do Apps Script."
}

$secureDriveKey = Read-Host -Prompt "JUS9_DRIVE_SAVER_CHAVE_INTERNA" -AsSecureString
$driveKey = ConvertFrom-SecureStringToPlainText -SecureString $secureDriveKey
if (-not $driveKey) {
  throw "JUS9_DRIVE_SAVER_CHAVE_INTERNA e obrigatoria."
}

if ($GerarApiToken) {
  $apiToken = New-UrlSafeToken -Bytes 32
} else {
  $secureApiToken = Read-Host -Prompt "JUS9_DRIVE_SAVER_API_TOKEN" -AsSecureString
  $apiToken = ConvertFrom-SecureStringToPlainText -SecureString $secureApiToken
}

if (-not $apiToken) {
  throw "JUS9_DRIVE_SAVER_API_TOKEN e obrigatorio. Use -GerarApiToken para criar um token local forte."
}

if ((Test-Path -LiteralPath $EnvPath) -and -not $Forcar) {
  Write-Host ".env existente encontrado. Atualizando apenas chaves do Drive Saver."
}

$lines = @()
if (Test-Path -LiteralPath $EnvPath) {
  $lines = Get-Content -LiteralPath $EnvPath
}

if ($null -eq $lines) {
  $lines = @()
}

$lines = Set-EnvLine -Lines $lines -Name "JUS9_DRIVE_SAVER_URL" -Value $DriveSaverUrl
$lines = Set-EnvLine -Lines $lines -Name "JUS9_DRIVE_SAVER_CHAVE_INTERNA" -Value $driveKey
$lines = Set-EnvLine -Lines $lines -Name "JUS9_DRIVE_SAVER_API_TOKEN" -Value $apiToken
$lines = Set-EnvLine -Lines $lines -Name "JUS9_DRIVE_SAVER_ALLOWED_ORIGINS" -Value $AllowedOrigins

$directory = Split-Path -Parent $EnvPath
if (-not (Test-Path -LiteralPath $directory)) {
  New-Item -ItemType Directory -Path $directory | Out-Null
}

$lines | Set-Content -LiteralPath $EnvPath -Encoding UTF8

Write-Host "Drive Saver configurado em .env local."
Write-Host "Nao publique este arquivo. O .gitignore ja protege .env."
