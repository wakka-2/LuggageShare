@echo off
setlocal

set ANDROID_HOME=E:\sdk
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%

echo ANDROID_HOME=%ANDROID_HOME%
echo JAVA_HOME=%JAVA_HOME%
echo.

cd /d E:\work\Github\LuggageShare\apps\mobile\android

echo Starting Gradle build...
call gradlew.bat assembleRelease --no-daemon 2>&1

echo.
echo Build finished with exit code %ERRORLEVEL%
