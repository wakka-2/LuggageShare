@echo off
REM LuggageShare Development Commands
REM Usage: scripts\dev.bat [command]

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="install" goto install
if "%1"=="mobile" goto mobile
if "%1"=="web" goto web
if "%1"=="api" goto api
if "%1"=="all" goto all
if "%1"=="build" goto build
if "%1"=="lint" goto lint
if "%1"=="typecheck" goto typecheck
if "%1"=="test" goto test
if "%1"=="db:generate" goto db_generate
if "%1"=="db:push" goto db_push
if "%1"=="db:studio" goto db_studio
if "%1"=="clean" goto clean
if "%1"=="format" goto format

echo Unknown command: %1
goto help

:help
echo.
echo LuggageShare Development Commands
echo ==================================
echo.
echo Usage: scripts\dev.bat [command]
echo.
echo Available commands:
echo   install      Install all dependencies
echo   mobile       Start mobile app (Expo)
echo   web          Start web app (Next.js)
echo   api          Start API server (NestJS)
echo   all          Start all apps
echo   build        Build all apps
echo   lint         Run linting
echo   typecheck    Run TypeScript checks
echo   test         Run tests
echo   db:generate  Generate Prisma client
echo   db:push      Push database schema
echo   db:studio    Open Prisma Studio
echo   clean        Clean all build artifacts
echo   format       Format all files
echo   help         Show this help
echo.
goto end

:install
echo Installing dependencies...
npm install
goto end

:mobile
echo Starting mobile app...
npm run dev:mobile
goto end

:web
echo Starting web app...
npm run dev:web
goto end

:api
echo Starting API server...
npm run dev:api
goto end

:all
echo Starting all apps...
npm run dev
goto end

:build
echo Building all apps...
npm run build
goto end

:lint
echo Running linting...
npm run lint
goto end

:typecheck
echo Running TypeScript checks...
npm run typecheck
goto end

:test
echo Running tests...
npm run test
goto end

:db_generate
echo Generating Prisma client...
npm run db:generate
goto end

:db_push
echo Pushing database schema...
npm run db:push
goto end

:db_studio
echo Opening Prisma Studio...
npm run db:studio
goto end

:clean
echo Cleaning build artifacts...
npm run clean
goto end

:format
echo Formatting files...
npm run format
goto end

:end
