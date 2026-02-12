@echo off
@echo ===========================================
@echo  LLM-FW Dashboard Deploy to Cloudflare
@echo ===========================================
@echo.

cd /d "C:\api-security\cf-dashboard"

@echo Step 1: Installing dependencies...
call npm ci
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

@echo.
@echo Step 2: Building...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

@echo.
@echo Step 3: Deploying to Cloudflare Pages...
call wrangler pages deploy dist --project-name=llm-fw-dashboard

if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed
    echo.
    echo Troubleshooting:
    echo   1. Make sure you're logged in: wrangler login
    echo   2. Check project exists at https://dash.cloudflare.com/pages
    echo   3. Try: wrangler pages project list
    pause
    exit /b 1
)

@echo.
@echo ===========================================
@echo  ✓ Deployment Complete!
@echo ===========================================
@echo.
@echo Your dashboard is live at:
@echo   https://llm-fw-dashboard.pages.dev
@echo.
@echo It may take 1-2 minutes to update.
@echo.
pause
