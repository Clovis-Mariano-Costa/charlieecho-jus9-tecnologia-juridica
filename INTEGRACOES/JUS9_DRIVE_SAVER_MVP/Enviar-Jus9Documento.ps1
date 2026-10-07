param(
  [Parameter(Mandatory = $true)]
  [string]$Uri,

  [string]$ChaveInterna = "",

  [string]$ChaveInternaEnv = "JUS9_DRIVE_SAVER_CHAVE_INTERNA",

  [switch]$PedirChave,

  [switch]$UsarChaveLegada,

  [Parameter(Mandatory = $true)]
  [ValidateSet("PUBLICO", "INTERNO", "JURIDICO_SIGILOSO", "COFRE_NAO_AUTOMATICO", "COFRE_DEPOSITO_ASSISTIDO")]
  [string]$Classificacao,

  [Parameter(Mandatory = $true)]
  [string]$Titulo,

  [Parameter(Mandatory = $true)]
  [string]$Conteudo,

  [string]$TipoDocumento = "MEMORANDO",
  [string]$Origem = "I.A. autorizada / Jus 9",
  [string]$AutorOperacional = "I.A. autorizada",
  [string]$Observacao = "",
  [string]$IdempotencyKey = "",
  [string]$RegistrarEm = "",
  [switch]$CriarLinkDownload,
  [switch]$AbrirUrlCriada
)

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

if ($ChaveInterna) {
  Write-Warning "Preferir -PedirChave ou variavel de ambiente; -ChaveInterna pode aparecer no historico do terminal."
}

if ($PedirChave -or -not $ChaveInterna) {
  if (-not $PedirChave) {
    $ChaveInterna = [Environment]::GetEnvironmentVariable($ChaveInternaEnv, "Process")
  }

  if (-not $ChaveInterna -and -not $PedirChave) {
    $ChaveInterna = [Environment]::GetEnvironmentVariable($ChaveInternaEnv, "User")
  }

  if (-not $ChaveInterna) {
    $secureKey = Read-Host -Prompt "CHAVE_INTERNA" -AsSecureString
    $ChaveInterna = ConvertFrom-SecureStringToPlainText -SecureString $secureKey
  }
}

if (-not $ChaveInterna) {
  throw "CHAVE_INTERNA ausente. Use -PedirChave ou configure a variavel de ambiente $ChaveInternaEnv."
}

if ($ChaveInterna.Length -lt 32) {
  throw "CHAVE_INTERNA deve ter pelo menos 32 caracteres para HMAC-SHA256."
}

function ConvertTo-Base64Url {
  param(
    [Parameter(Mandatory = $true)]
    [byte[]]$Bytes
  )

  ([Convert]::ToBase64String($Bytes)).TrimEnd("=").Replace("+", "-").Replace("/", "_")
}

function Get-HmacSha256Base64Url {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Key,

    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  $hmac = [System.Security.Cryptography.HMACSHA256]::new([Text.Encoding]::UTF8.GetBytes($Key))
  try {
    ConvertTo-Base64Url -Bytes $hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($Value))
  } finally {
    $hmac.Dispose()
  }
}

if (-not $IdempotencyKey) {
  $IdempotencyKey = ([guid]::NewGuid()).ToString("N")
}

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$nonce = ([guid]::NewGuid()).ToString("N")
$criarLink = [bool]($CriarLinkDownload -and $Classificacao -eq "PUBLICO")

$signedFields = [ordered]@{
  acao = $null
  action = $null
  idempotencyKey = $IdempotencyKey
  titulo = $Titulo
  title = $null
  conteudo = $Conteudo
  classificacao = $Classificacao
  tipoDocumento = $TipoDocumento
  origem = $Origem
  autorOperacional = $AutorOperacional
  observacao = $Observacao
  criarLinkDownload = $criarLink
  fileId = $null
  id = $null
  documentId = $null
  motivo = $null
}
$canonicalJson = $signedFields | ConvertTo-Json -Compress -Depth 5
$signatureInput = "{0}.{1}.{2}" -f $timestamp, $nonce, $canonicalJson
$signature = Get-HmacSha256Base64Url -Key $ChaveInterna -Value $signatureInput

$payload = [ordered]@{
  timestamp = $timestamp
  nonce = $nonce
  assinatura = $signature
  idempotencyKey = $IdempotencyKey
  titulo = $Titulo
  conteudo = $Conteudo
  classificacao = $Classificacao
  tipoDocumento = $TipoDocumento
  origem = $Origem
  autorOperacional = $AutorOperacional
  observacao = $Observacao
  criarLinkDownload = $criarLink
}

if ($UsarChaveLegada) {
  Write-Warning "Modo de transicao: a chave sera enviada no JSON. Remova -UsarChaveLegada apos ativar JUS9_REQUIRE_SIGNED_REQUESTS."
  $payload.chaveInterna = $ChaveInterna
}

$body = $payload | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod `
  -Method Post `
  -Uri $Uri `
  -ContentType "application/json" `
  -Body $body

if ($RegistrarEm) {
  $registro = [PSCustomObject]@{
    dataHora = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    classificacao = $Classificacao
    titulo = $Titulo
    resposta = $response
  } | ConvertTo-Json -Depth 8

  $registro | Set-Content -LiteralPath $RegistrarEm -Encoding UTF8
}

if ($AbrirUrlCriada -and $response.url) {
  Start-Process $response.url | Out-Null
}

$response
