param(
  [Parameter(Mandatory = $true)]
  [string]$Uri,

  [string]$ChaveInterna = "",

  [string]$ChaveInternaEnv = "JUS9_DRIVE_SAVER_CHAVE_INTERNA",

  [switch]$PedirChave,

  [Parameter(Mandatory = $true)]
  [ValidateSet("PUBLICO", "INTERNO", "JURIDICO_SIGILOSO", "COFRE_NAO_AUTOMATICO", "COFRE_DEPOSITO_ASSISTIDO")]
  [string]$Classificacao,

  [Parameter(Mandatory = $true)]
  [string]$Titulo,

  [Parameter(Mandatory = $true)]
  [string]$Conteudo,

  [string]$TipoDocumento = "MEMORANDO",
  [string]$Origem = "Charlie Echo / Jus 9",
  [string]$AutorOperacional = "Charlie Echo / Codex",
  [string]$Observacao = "",
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

$body = @{
  chaveInterna = $ChaveInterna
  titulo = $Titulo
  conteudo = $Conteudo
  classificacao = $Classificacao
  tipoDocumento = $TipoDocumento
  origem = $Origem
  autorOperacional = $AutorOperacional
  observacao = $Observacao
  criarLinkDownload = [bool]($CriarLinkDownload -and $Classificacao -eq "PUBLICO")
} | ConvertTo-Json -Depth 5

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
