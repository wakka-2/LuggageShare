$env:ANDROID_HOME = 'E:\sdk'
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:PATH = $env:JAVA_HOME + '\bin;' + $env:ANDROID_HOME + '\platform-tools;' + $env:ANDROID_HOME + '\tools;' + $env:PATH

Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
Write-Host "JAVA_HOME=$env:JAVA_HOME"

Set-Location 'E:\work\Github\LuggageShare\apps\mobile\android'

& '.\gradlew.bat' assembleRelease --no-daemon 2>&1 | Tee-Object -FilePath 'E:\work\Github\LuggageShare\gradle_full.log'
Write-Host "Exit code: $LASTEXITCODE"
