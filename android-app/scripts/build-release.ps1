$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$localToolchain = Join-Path $env:LOCALAPPDATA 'AndroidToolchain'
$keyStorePath = Join-Path $localToolchain 'controle-nc-release.p12'
$passwordPath = Join-Path $localToolchain 'controle-nc-signing-password.dpapi'
$androidSdk = $env:ANDROID_SDK_ROOT
if (-not $androidSdk) {
    $androidSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
}
if (-not $env:JAVA_HOME) {
    $jdk21 = Join-Path $env:LOCALAPPDATA 'Programs\Temurin21'
    if (Test-Path (Join-Path $jdk21 'bin\java.exe')) {
        $env:JAVA_HOME = $jdk21
    }
}

if (-not (Test-Path $keyStorePath)) {
    throw "Release keystore not found at $keyStorePath."
}
if (-not (Test-Path $passwordPath)) {
    throw "Release password file not found at $passwordPath."
}
if (-not $env:JAVA_HOME) {
    throw 'JDK 21 is required. Set JAVA_HOME to a JDK 21 installation.'
}
if (-not (Test-Path (Join-Path $env:JAVA_HOME 'bin\java.exe'))) {
    throw 'JDK 21 is required. Set JAVA_HOME to a JDK 21 installation.'
}
if (-not (Test-Path (Join-Path $androidSdk 'build-tools\36.0.0\apksigner.bat'))) {
    throw 'Android SDK build-tools 36.0.0 are required. Set ANDROID_SDK_ROOT.'
}

$encryptedPassword = (Get-Content -LiteralPath $passwordPath -Raw).Trim()
$securePassword = ConvertTo-SecureString -String $encryptedPassword
$password = ([System.Net.NetworkCredential]::new('', $securePassword)).Password
$env:ANDROID_SDK_ROOT = $androidSdk
$env:ANDROID_HOME = $androidSdk
$env:NC_KEYSTORE_PATH = $keyStorePath
$env:NC_KEY_ALIAS = 'controle-nc-release'
$env:NC_KEYSTORE_PASSWORD = $password
$env:NC_KEY_PASSWORD = $password

try {
    Push-Location $projectRoot
    try {
        & (Join-Path $projectRoot 'android\gradlew.bat') -p (Join-Path $projectRoot 'android') assembleRelease
        if ($LASTEXITCODE -ne 0) {
            throw "Gradle release build failed ($LASTEXITCODE)."
        }
    } finally {
        Pop-Location
    }

    $unsignedApk = Join-Path $projectRoot 'android\app\build\outputs\apk\release\app-release-unsigned.apk'
    if (-not (Test-Path $unsignedApk)) {
        throw "Unsigned release APK not found at $unsignedApk."
    }

    $distPath = Join-Path $projectRoot 'dist'
    New-Item -ItemType Directory -Path $distPath -Force | Out-Null
    $signedApk = Join-Path $distPath 'Controle-NC-v1.0.apk'
    $apksigner = Join-Path $androidSdk 'build-tools\36.0.0\apksigner.bat'
    & $apksigner sign --ks $keyStorePath --ks-key-alias $env:NC_KEY_ALIAS --ks-pass env:NC_KEYSTORE_PASSWORD --key-pass env:NC_KEY_PASSWORD --out $signedApk $unsignedApk
    if ($LASTEXITCODE -ne 0) {
        throw "APK signing failed ($LASTEXITCODE)."
    }

    & $apksigner verify --verbose --print-certs $signedApk
    if ($LASTEXITCODE -ne 0) {
        throw "APK signature verification failed ($LASTEXITCODE)."
    }

    Get-Item -LiteralPath $signedApk | Select-Object FullName, Length, LastWriteTime
} finally {
    $env:NC_KEYSTORE_PATH = $null
    $env:NC_KEY_ALIAS = $null
    $env:NC_KEYSTORE_PASSWORD = $null
    $env:NC_KEY_PASSWORD = $null
    $password = $null
    if ($securePassword) {
        $securePassword.Dispose()
    }
}
