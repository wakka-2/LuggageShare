# LuggageShare Development Commands
# Usage: .\scripts\dev.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host ""
    Write-Host "LuggageShare Development Commands" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts\dev.ps1 [command]"
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host "  install      Install all dependencies"
    Write-Host "  mobile       Start mobile app (Expo)"
    Write-Host "  web          Start web app (Next.js)"
    Write-Host "  api          Start API server (NestJS)"
    Write-Host "  all          Start all apps"
    Write-Host "  build        Build all apps"
    Write-Host "  lint         Run linting"
    Write-Host "  typecheck    Run TypeScript checks"
    Write-Host "  test         Run tests"
    Write-Host "  db:generate  Generate Prisma client"
    Write-Host "  db:push      Push database schema"
    Write-Host "  db:studio    Open Prisma Studio"
    Write-Host "  clean        Clean all build artifacts"
    Write-Host "  format       Format all files"
    Write-Host "  help         Show this help"
    Write-Host ""
}

switch ($Command) {
    "help" { Show-Help }
    "install" {
        Write-Host "Installing dependencies..." -ForegroundColor Green
        npm install
    }
    "mobile" {
        Write-Host "Starting mobile app..." -ForegroundColor Green
        npm run dev:mobile
    }
    "web" {
        Write-Host "Starting web app..." -ForegroundColor Green
        npm run dev:web
    }
    "api" {
        Write-Host "Starting API server..." -ForegroundColor Green
        npm run dev:api
    }
    "all" {
        Write-Host "Starting all apps..." -ForegroundColor Green
        npm run dev
    }
    "build" {
        Write-Host "Building all apps..." -ForegroundColor Green
        npm run build
    }
    "lint" {
        Write-Host "Running linting..." -ForegroundColor Green
        npm run lint
    }
    "typecheck" {
        Write-Host "Running TypeScript checks..." -ForegroundColor Green
        npm run typecheck
    }
    "test" {
        Write-Host "Running tests..." -ForegroundColor Green
        npm run test
    }
    "db:generate" {
        Write-Host "Generating Prisma client..." -ForegroundColor Green
        npm run db:generate
    }
    "db:push" {
        Write-Host "Pushing database schema..." -ForegroundColor Green
        npm run db:push
    }
    "db:studio" {
        Write-Host "Opening Prisma Studio..." -ForegroundColor Green
        npm run db:studio
    }
    "clean" {
        Write-Host "Cleaning build artifacts..." -ForegroundColor Green
        npm run clean
    }
    "format" {
        Write-Host "Formatting files..." -ForegroundColor Green
        npm run format
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Help
    }
}
