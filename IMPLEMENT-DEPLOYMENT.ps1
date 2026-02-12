#!/usr/bin/env pwsh
# LLM-FW Complete Deployment Implementation Script
# Run this in PowerShell to deploy everything step by step

param(
    [switch]$SkipConfirmation = $false
)

# Colors
$Red = "`e[91m"
$Green = "`e[92m"
$Yellow = "`e[93m"
$Blue = "`e[94m"
$Cyan = "`e[96m"
$Reset = "`e[0m"

# Configuration
$WorkerName = "llm-fw-edge"
$DashboardName = "llm-fw-dashboard"
$DatabaseName = "llm-fw-db"

function Write-Header($text) {
    Write-Host ""
    Write-Host "$Blue========================================$Reset"
    Write-Host "$Blue  $text$Reset"
    Write-Host "$Blue========================================$Reset"
    Write-Host ""
}

function Write-Success($text) {
    Write-Host "$Green✓ $text$Reset"
}

function Write-Error($text) {
    Write-Host "$Red✗ $text$Reset"
}

function Write-Warning($text) {
    Write-Host "$Yellow⚠ $text$Reset"
}

function Write-Info($text) {
    Write-Host "$Cyan→ $text$Reset"
}

function Wait-ForInput($prompt = "Press Enter to continue...") {
    Write-Host ""
    Read-Host -Prompt $prompt
}

function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# ============================================
# STEP 0: Pre-flight Checks
# ============================================
Write-Header "STEP 0: Pre-flight Checks"

# Check Node.js
if (-not (Test-Command "node")) {
    Write-Error "Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
}
$nodeVersion = (node --version).Substring(1)
Write-Success "Node.js version: $nodeVersion"

# Check Wrangler
if (-not (Test-Command "wrangler")) {
    Write-Error "Wrangler not found. Installing..."
    npm install -g wrangler
}
$wranglerVersion = (wrangler --version)
Write-Success "Wrangler version: $wranglerVersion"

# Check Git
if (-not (Test-Command "git")) {
    Write-Warning "Git not found. Some features may not work."
}

Write-Success "All prerequisites met!"

# ============================================
# STEP 1: Authenticate with Cloudflare
# ============================================
Write-Header "STEP 1: Authenticate with Cloudflare"

Write-Info "Checking current authentication status..."
$authCheck = wrangler whoami 2>&1
if ($authCheck -match "You are logged in") {
    Write-Success "Already authenticated with Cloudflare!"
    Write-Info $authCheck
} else {
    Write-Warning "Not authenticated. Please login:"
    Write-Info "Running: wrangler login"
    Write-Host ""
    Write-Host "$YellowThis will open a browser window. Please complete the login process.$Reset"
    Wait-ForInput "Press Enter to open browser..."
    
    wrangler login
    
    Write-Host ""
    Wait-ForInput "Press Enter after completing browser login..."
    
    # Verify login
    $authCheck = wrangler whoami 2>&1
    if ($authCheck -match "You are logged in") {
        Write-Success "Successfully authenticated!"
    } else {
        Write-Error "Authentication failed. Please try again."
        exit 1
    }
}

# ============================================
# STEP 2: Navigate to Worker Directory
# ============================================
Write-Header "STEP 2: Setting up Worker Directory"

$workerDir = Join-Path $PSScriptRoot "cf-worker"
if (-not (Test-Path $workerDir)) {
    Write-Error "cf-worker directory not found at: $workerDir"
    Write-Info "Please ensure you're running this script from the API Security directory"
    exit 1
}

Set-Location $workerDir
Write-Success "Changed to directory: $workerDir"

# ============================================
# STEP 3: Install Dependencies
# ============================================
Write-Header "STEP 3: Installing Dependencies"

if (-not (Test-Path "node_modules")) {
    Write-Info "Installing npm packages..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "npm install failed"
        exit 1
    }
    Write-Success "Dependencies installed"
} else {
    Write-Success "Dependencies already installed (node_modules exists)"
}

# ============================================
# STEP 4: Create D1 Database
# ============================================
Write-Header "STEP 4: Creating D1 Database"

Write-Info "Creating database: $DatabaseName"
Write-Host "$YellowNote: If the database already exists, you'll see an error. That's OK - continue to next step.$Reset"
Write-Host ""

$dbOutput = wrangler d1 create $DatabaseName 2>&1
Write-Host $dbOutput

if ($dbOutput -match "database_id\s*=\s*`"([^`"]+)`"") {
    $databaseId = $Matches[1]
    Write-Success "Database created with ID: $databaseId"
    Write-Host ""
    Write-Host "$YellowIMPORTANT: Copy this database_id and update wrangler.toml:$Reset"
    Write-Host "$Cyan  database_id = `"$databaseId`"$Reset"
    Write-Host ""
    
    # Update wrangler.toml automatically
    $wranglerToml = Get-Content "wrangler.toml" -Raw
    if ($wranglerToml -match "database_id\s*=\s*`"YOUR_D1_DATABASE_ID`"") {
        $wranglerToml = $wranglerToml -replace "database_id\s*=\s*`"YOUR_D1_DATABASE_ID`"", "database_id = `"$databaseId`""
        Set-Content "wrangler.toml" $wranglerToml
        Write-Success "Updated wrangler.toml with database_id automatically!"
    } else {
        Write-Warning "Could not auto-update wrangler.toml. Please update manually."
    }
} elseif ($dbOutput -match "already exists") {
    Write-Warning "Database already exists. Skipping creation."
    Write-Info "To get the existing database ID, run: wrangler d1 list"
} else {
    Write-Warning "Unexpected output. Please check manually: wrangler d1 list"
}

# ============================================
# STEP 5: Create KV Namespaces
# ============================================
Write-Header "STEP 5: Creating KV Namespaces"

$kvBindings = @("CACHE", "SIGNATURES", "RATE_LIMIT")
foreach ($binding in $kvBindings) {
    Write-Info "Creating KV namespace: $binding"
    $kvOutput = wrangler kv:namespace create $binding 2>&1
    Write-Host $kvOutput
    
    if ($kvOutput -match "id\s*=\s*`"([^`"]+)`"") {
        $kvId = $Matches[1]
        Write-Success "KV namespace '$binding' created with ID: $kvId"
        
        # Update wrangler.toml
        $wranglerToml = Get-Content "wrangler.toml" -Raw
        $pattern = "binding\s*=\s*`"$binding`"\s*\n\s*id\s*=\s*`"[^`"]*`""
        $replacement = "binding = `"$binding`"`n  id = `"$kvId`""
        if ($wranglerToml -match $pattern) {
            $wranglerToml = $wranglerToml -replace $pattern, $replacement
            Set-Content "wrangler.toml" $wranglerToml
            Write-Success "Updated wrangler.toml for $binding"
        }
    } elseif ($kvOutput -match "already exists") {
        Write-Warning "KV namespace '$binding' already exists"
    }
    Write-Host ""
}

# ============================================
# STEP 6: Create R2 Buckets
# ============================================
Write-Header "STEP 6: Creating R2 Buckets"

$r2Buckets = @("llm-fw-logs", "llm-fw-models")
foreach ($bucket in $r2Buckets) {
    Write-Info "Creating R2 bucket: $bucket"
    $r2Output = wrangler r2 bucket create $bucket 2>&1
    Write-Host $r2Output
    
    if ($r2Output -match "Success") {
        Write-Success "R2 bucket '$bucket' created"
    } elseif ($r2Output -match "already exists") {
        Write-Warning "R2 bucket '$bucket' already exists"
    }
    Write-Host ""
}

# ============================================
# STEP 7: Create Queues
# ============================================
Write-Header "STEP 7: Creating Queues"

$queues = @("llm-fw-log-queue", "llm-fw-analytics-queue")
foreach ($queue in $queues) {
    Write-Info "Creating queue: $queue"
    $queueOutput = wrangler queues create $queue 2>&1
    Write-Host $queueOutput
    
    if ($queueOutput -match "created") {
        Write-Success "Queue '$queue' created"
    } elseif ($queueOutput -match "already exists") {
        Write-Warning "Queue '$queue' already exists"
    }
    Write-Host ""
}

# ============================================
# STEP 8: Apply Database Migrations
# ============================================
Write-Header "STEP 8: Applying Database Migrations"

Write-Info "Applying migrations to $DatabaseName..."
$migrateOutput = wrangler d1 migrations apply $DatabaseName 2>&1
Write-Host $migrateOutput

if ($migrateOutput -match "Successfully applied" -or $migrateOutput -match "migrations applied") {
    Write-Success "Migrations applied successfully"
} else {
    Write-Warning "Migration result unclear. Please verify manually."
}

# ============================================
# STEP 9: Seed Attack Signatures
# ============================================
Write-Header "STEP 9: Seeding Attack Signatures to KV"

$scriptsDir = Join-Path $workerDir "scripts"
if (Test-Path $scriptsDir) {
    Set-Location $scriptsDir
    
    Write-Info "Generating signatures..."
    node seed-signatures.js
    
    if (Test-Path "signatures.json") {
        Write-Success "Generated signatures.json"
        Write-Info "Uploading signatures to KV (this may take a minute)..."
        
        $bulkOutput = wrangler kv:bulk put signatures.json --binding SIGNATURES 2>&1
        Write-Host $bulkOutput
        
        if ($bulkOutput -match "success" -or $LASTEXITCODE -eq 0) {
            Write-Success "Signatures uploaded successfully"
        } else {
            Write-Warning "Bulk upload may have failed. Trying individual upload..."
            if (Test-Path "seed-commands.sh") {
                Write-Info "Run: bash seed-commands.sh"
            }
        }
    } else {
        Write-Error "signatures.json not generated"
    }
    
    Set-Location $workerDir
} else {
    Write-Warning "Scripts directory not found, skipping signature seeding"
}

# ============================================
# STEP 10: Configure wrangler.toml
# ============================================
Write-Header "STEP 10: Configuring wrangler.toml"

$wranglerToml = Get-Content "wrangler.toml" -Raw

# Check for placeholder values
$placeholders = @()
if ($wranglerToml -match "YOUR_D1_DATABASE_ID") { $placeholders += "database_id" }
if ($wranglerToml -match "YOUR_KV_CACHE_ID") { $placeholders += "CACHE KV id" }
if ($wranglerToml -match "YOUR_KV_SIGNATURES_ID") { $placeholders += "SIGNATURES KV id" }
if ($wranglerToml -match "YOUR_KV_RATE_LIMIT_ID") { $placeholders += "RATE_LIMIT KV id" }
if ($wranglerToml -match "YOUR_DIGITAL_OCEAN_IP") { $placeholders += "ML_BACKEND_URL" }

if ($placeholders.Count -gt 0) {
    Write-Warning "wrangler.toml still has placeholder values:"
    $placeholders | ForEach-Object { Write-Host "  - $_" }
    Write-Host ""
    Write-Info "Please update these manually before deploying"
    Write-Host "$Cyan  1. Open: $(Join-Path $workerDir "wrangler.toml")$Reset"
    Write-Host "$Cyan  2. Replace all YOUR_XXX placeholders$Reset"
    Write-Host "$Cyan  3. Set a secure JWT_SECRET$Reset"
    Write-Host "$Cyan  4. Set your Digital Ocean IP in ML_BACKEND_URL$Reset"
} else {
    Write-Success "wrangler.toml appears to be configured"
}

# ============================================
# STEP 11: Type Check
# ============================================
Write-Header "STEP 11: Type Checking"

Write-Info "Running TypeScript type check..."
$typeCheck = npm run typecheck 2>&1
Write-Host $typeCheck

if ($LASTEXITCODE -eq 0) {
    Write-Success "Type check passed"
} else {
    Write-Error "Type check failed. Please fix errors before deploying."
    exit 1
}

# ============================================
# STEP 12: Build
# ============================================
Write-Header "STEP 12: Building Worker"

Write-Info "Building worker..."
$buildOutput = npm run build 2>&1
Write-Host $buildOutput

if ($LASTEXITCODE -eq 0) {
    Write-Success "Build successful"
} else {
    Write-Error "Build failed. Please fix errors."
    exit 1
}

# ============================================
# STEP 13: Deploy Worker
# ============================================
Write-Header "STEP 13: Deploying Worker"

Write-Warning "About to deploy to Cloudflare!"
Write-Host "$YellowMake sure:$Reset"
Write-Host "  1. wrangler.toml is fully configured"
Write-Host "  2. JWT_SECRET is set to a secure value"
Write-Host "  3. You're ready to go live"
Write-Host ""

if (-not $SkipConfirmation) {
    $confirm = Read-Host "Deploy now? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Info "Deployment cancelled. Run again when ready."
        exit 0
    }
}

Write-Info "Deploying..."
$deployOutput = wrangler deploy 2>&1
Write-Host $deployOutput

if ($deployOutput -match "Successfully published") {
    Write-Success "Worker deployed successfully!"
    
    if ($deployOutput -match "https://[^\s]+\.workers\.dev") {
        $workerUrl = $Matches[0]
        Write-Host ""
        Write-Host "$Green═══════════════════════════════════════$Reset"
        Write-Host "$Green  WORKER URL: $workerUrl$Reset"
        Write-Host "$Green═══════════════════════════════════════$Reset"
        Write-Host ""
        
        # Save URL for later
        $workerUrl | Set-Content (Join-Path $PSScriptRoot "worker-url.txt")
    }
} else {
    Write-Error "Deployment may have failed. Check output above."
}

# ============================================
# STEP 14: Test Deployment
# ============================================
Write-Header "STEP 14: Testing Deployment"

$workerUrl = Get-Content (Join-Path $PSScriptRoot "worker-url.txt") -ErrorAction SilentlyContinue
if (-not $workerUrl) {
    $workerUrl = Read-Host "Enter your worker URL (from deployment output)"
}

Write-Info "Testing health endpoint..."
try {
    $healthResponse = Invoke-RestMethod -Uri "$workerUrl/health" -Method GET -TimeoutSec 10
    Write-Success "Health check passed!"
    Write-Host ($healthResponse | ConvertTo-Json)
} catch {
    Write-Error "Health check failed: $_"
}

# ============================================
# STEP 15: Deploy Dashboard
# ============================================
Write-Header "STEP 15: Deploying Dashboard"

$dashboardDir = Join-Path $PSScriptRoot "cf-dashboard"
if (Test-Path $dashboardDir) {
    Set-Location $dashboardDir
    
    if (-not (Test-Path "node_modules")) {
        Write-Info "Installing dashboard dependencies..."
        npm install
    }
    
    # Update API URL in wrangler.toml
    $dashboardWrangler = Get-Content "wrangler.toml" -Raw
    if ($dashboardWrangler -match "YOUR_WORKER_URL") {
        $dashboardWrangler = $dashboardWrangler -replace "YOUR_WORKER_URL", $workerUrl
        Set-Content "wrangler.toml" $dashboardWrangler
        Write-Success "Updated dashboard wrangler.toml with worker URL"
    }
    
    Write-Info "Building dashboard..."
    npm run build
    
    Write-Info "Deploying dashboard to Cloudflare Pages..."
    $pagesOutput = wrangler pages deploy dist 2>&1
    Write-Host $pagesOutput
    
    if ($pagesOutput -match "Successfully deployed") {
        Write-Success "Dashboard deployed!"
    }
    
    Set-Location $workerDir
} else {
    Write-Warning "Dashboard directory not found"
}

# ============================================
# COMPLETION
# ============================================
Write-Header "DEPLOYMENT COMPLETE!"

Write-Host "$Green═══════════════════════════════════════════════════$Reset"
Write-Host "$Green  🎉 LLM-FW Infrastructure Successfully Deployed!$Reset"
Write-Host "$Green═══════════════════════════════════════════════════$Reset"
Write-Host ""

if ($workerUrl) {
    Write-Host "$Cyan Worker URL:$Reset $workerUrl"
    Write-Host "$Cyan Health Check:$Reset ${workerUrl}/health"
}

Write-Host ""
Write-Host "$YellowNext Steps:$Reset"
Write-Host "  1. Test the API with the commands in QUICK-START.md"
Write-Host "  2. Set up your Digital Ocean droplet for ML inference"
Write-Host "  3. Update ML_BACKEND_URL in wrangler.toml"
Write-Host "  4. Configure GitHub Actions for CI/CD"
Write-Host "  5. Set up monitoring with health-check.sh"
Write-Host ""
Write-Host "$CyanDocumentation:$Reset"
Write-Host "  - SETUP-GUIDE.md - Detailed setup instructions"
Write-Host "  - QUICK-START.md - Daily reference"
Write-Host "  - DEPLOYMENT.md - Architecture documentation"
Write-Host ""

Read-Host -Prompt "Press Enter to exit"
