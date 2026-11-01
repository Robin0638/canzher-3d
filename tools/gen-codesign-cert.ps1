# 生成 CanZher 自签代码签名证书（仅本机/内网分发使用；对外发布建议购买正式代码签名证书）
# 输出: cert/canzher-codesign.pfx（含私钥，签 exe 用）+ cert/canzher-codesign.cer（公钥，供用户信任）

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$certDir = Join-Path $projectRoot 'cert'

# 随机生成 PFX 密码（不写进任何入库文件；自动记录到 cert/desktop-signing-readme.txt）
$bytes = New-Object byte[] 24
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$certPasswordPlain = [Convert]::ToBase64String($bytes).TrimEnd('=')

$cert = New-SelfSignedCertificate `
    -Type CodeSigningCert `
    -Subject 'CN=CanZher, O=CanZher, C=CN' `
    -KeyUsage DigitalSignature `
    -KeySpec Signature `
    -KeyExportPolicy Exportable `
    -KeyLength 3072 `
    -HashAlgorithm SHA256 `
    -NotAfter (Get-Date).AddYears(10) `
    -CertStoreLocation Cert:\CurrentUser\My `
    -FriendlyName 'CanZher Code Signing'

$pwd = ConvertTo-SecureString -String $certPasswordPlain -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath (Join-Path $certDir 'canzher-codesign.pfx') -Password $pwd | Out-Null
Export-Certificate  -Cert $cert -FilePath (Join-Path $certDir 'canzher-codesign.cer') | Out-Null

$sha256 = (Get-FileHash (Join-Path $certDir 'canzher-codesign.cer') -Algorithm SHA256).Hash
$record = @"

----------------------------------------------------------------
追加记录：$(Get-Date -Format 'yyyy-MM-dd HH:mm') 重新生成的证书
    主题     : $($cert.Subject)
    指纹     : $($cert.Thumbprint)
    有效期至 : $($cert.NotAfter.ToString('yyyy-MM-dd'))
    PFX 密码 : $certPasswordPlain
"@
Add-Content -Path (Join-Path $certDir 'desktop-signing-readme.txt') -Value $record

Write-Output ('THUMBPRINT=' + $cert.Thumbprint)
Write-Output ('SUBJECT=' + $cert.Subject)
Write-Output ('NOTAFTER=' + $cert.NotAfter.ToString('yyyy-MM-dd'))
Write-Output ('PFXPASSWORD=' + $certPasswordPlain)
Write-Output ('CER-SHA256=' + $sha256)
