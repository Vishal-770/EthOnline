# Quick Setup Script for Windows PowerShell
# Run this script from the apps/frontend directory

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "EthOnline Frontend Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y") {
        Write-Host "Keeping existing .env.local" -ForegroundColor Yellow
        exit
    }
}

# Copy example file
if (Test-Path ".env.local.example") {
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "✓ Created .env.local from example" -ForegroundColor Green
} else {
    Write-Host "✗ .env.local.example not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Environment Configuration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for backend URL
Write-Host "Backend API Configuration:" -ForegroundColor Yellow
$defaultBackend = "http://localhost:3001"
$backendUrl = Read-Host "Enter your backend API URL (default: $defaultBackend)"
if ([string]::IsNullOrWhiteSpace($backendUrl)) {
    $backendUrl = $defaultBackend
}

# Prompt for Twitter API key (optional)
Write-Host ""
Write-Host "Twitter Integration (Optional):" -ForegroundColor Yellow
$twitterKey = Read-Host "Enter Twitter API Key (press Enter to skip)"

# Update .env.local
$envContent = Get-Content ".env.local"
$envContent = $envContent -replace "NEXT_PUBLIC_ENVIO_API_URL=.*", "NEXT_PUBLIC_ENVIO_API_URL=$backendUrl"
if (-not [string]::IsNullOrWhiteSpace($twitterKey)) {
    $envContent = $envContent -replace "NEXT_PUBLIC_TWITTER_API_KEY=.*", "NEXT_PUBLIC_TWITTER_API_KEY=$twitterKey"
}
$envContent | Set-Content ".env.local"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your configuration:" -ForegroundColor Yellow
Write-Host "  Backend API: $backendUrl" -ForegroundColor White
if (-not [string]::IsNullOrWhiteSpace($twitterKey)) {
    Write-Host "  Twitter API: Configured" -ForegroundColor White
} else {
    Write-Host "  Twitter API: Not configured (optional)" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Install dependencies: npm install" -ForegroundColor White
Write-Host "  2. Run development server: npm run dev" -ForegroundColor White
Write-Host "  3. Open http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "For deployment instructions, see DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host ""
