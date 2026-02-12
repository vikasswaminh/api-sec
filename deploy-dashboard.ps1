#!/usr/bin/env pwsh
# Cloudflare Pages Dashboard Deployment Script
# Usage: .\deploy-dashboard.ps1

param(
    [string]$ProjectName = "llm-fw-dashboard"
)

$Red = "`e[91m"
$Green = "`e[92m"
$Yellow = "`e[93m"
$Cyan = "`e[96m"
$Reset = "`e[0m"

Write-Host ""
Write-Host "$Cyan╔══════════════════════════════════════════════════════════╗$Reset"
Write-Host "$Cyan║     Cloudflare Pages Dashboard Deployment                ║$Reset"
Write-Host "$Cyan╚══════════════════════════════════════════════════════════╝$Reset"
Write-Host ""

$DashboardDir = "C:\api-security\cf-dashboard"

# Check if we're in the right directory
if (-not (Test-Path $DashboardDir)) {
    Write-Host "$Red Error: Dashboard directory not found at:$Reset"
    Write-Host "  $DashboardDir"
    exit 1
}

Set-Location $DashboardDir

# Step 1: Clean install dependencies
Write-Host "$Yellow Step 1: Installing dependencies...$Reset"
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "$Red Failed to install dependencies$Reset"
    exit 1
}
Write-Host "$Green ✓ Dependencies installed$Reset"
Write-Host ""

# Step 2: Build for production
Write-Host "$Yellow Step 2: Building for production...$Reset"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "$Red Build failed$Reset"
    exit 1
}
Write-Host "$Green ✓ Build successful$Reset"
Write-Host ""

# Step 3: Verify dist folder exists
if (-not (Test-Path "dist\index.html")) {
    Write-Host "$Red Error: dist/index.html not found$Reset"
    exit 1
}

# Step 4: Check if project exists
Write-Host "$Yellow Step 3: Checking Cloudflare Pages project...$Reset"
$ProjectList = wrangler pages project list 2>&1
if ($ProjectList -match $ProjectName) {
    Write-Host "$Green ✓ Project '$ProjectName' exists$Reset"
} else {
    Write-Host "$Yellow ⚠ Project '$ProjectName' not found$Reset"
    Write-Host ""
    Write-Host "$Cyan Please create the project first:$Reset"
    Write-Host "  1. Go to https://dash.cloudflare.com/pages"
    Write-Host "  2. Click 'Create a project'"
    Write-Host "  3. Choose 'Direct Upload'"
    Write-Host "  4. Name: $ProjectName"
    Write-Host ""
    $CreateProject = Read-Host "Have you created the project? (y/n)"
    if ($CreateProject -ne "y") {
        Write-Host "$Red Please create the project first, then run this script again.$Reset"
        exit 1
    }
}
Write-Host ""

# Step 5: Deploy to Pages
Write-Host "$Yellow Step 4: Deploying to Cloudflare Pages...$Reset"
Write-Host ""

wrangler pages deploy dist --project-name=$ProjectName

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "$Green══════════════════════════════════════════════════════════$Reset"
    Write-Host "$Green  ✓ Dashboard deployed successfully!                      $Reset"
    Write-Host "$Green══════════════════════════════════════════════════════════$Reset"
    Write-Host ""
    Write-Host "$Cyan Your dashboard is live at:$Reset"
    Write-Host "  https://${ProjectName}.pages.dev"
    Write-Host ""
    Write-Host "$Yellow Note: It may take 1-2 minutes for changes to propagate.$Reset"
    Write-Host ""
    
    # Open browser
    $OpenBrowser = Read-Host "Open dashboard in browser? (y/n)"
    if ($OpenBrowser -eq "y") {
        Start-Process "https://${ProjectName}.pages.dev"
    }
} else {
    Write-Host ""
    Write-Host "$Red══════════════════════════════════════════════════════════$Reset"
    Write-Host "$Red  ✗ Deployment failed                                      $Reset"
    Write-Host "$Red══════════════════════════════════════════════════════════$Reset"
    Write-Host ""
    Write-Host "$Yellow Troubleshooting:$Reset"
    Write-Host "  1. Make sure you're logged in: wrangler login"
    Write-Host "  2. Check project name is correct: wrangler pages project list"
    Write-Host "  3. Try deploying manually: wrangler pages deploy dist"
}

Write-Host ""
