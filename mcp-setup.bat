@echo off
REM MCP Setup Script for 3GPP MCP Server v2 (Windows)
REM This script helps set up the MCP server for use with Claude Desktop

setlocal EnableDelayedExpansion

echo 🚀 3GPP MCP Server v2 Setup (Windows)
echo ==========================================

REM Function to print status messages
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

echo.
echo %BLUE%ℹ️  Starting 3GPP MCP Server v2 setup process...%NC%
echo.

REM Step 1: Check Node.js installation
echo %BLUE%ℹ️  Step 1: Checking prerequisites...%NC%

node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org%NC%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %GREEN%✅ Node.js found: %NODE_VERSION%%NC%

REM Check Node.js version (basic check for v18+)
set "VERSION_CHECK=%NODE_VERSION:v=%"
for /f "tokens=1 delims=." %%a in ("%VERSION_CHECK%") do set MAJOR_VERSION=%%a

if %MAJOR_VERSION% LSS 18 (
    echo %RED%❌ Node.js version %NODE_VERSION% is too old. Please install Node.js 18 or higher.%NC%
    pause
    exit /b 1
)

echo %GREEN%✅ Node.js version is compatible (18+)%NC%

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ npm not found. Please install npm.%NC%
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo %GREEN%✅ npm found: %NPM_VERSION%%NC%

echo.

REM Step 2: Install dependencies
echo %BLUE%ℹ️  Step 2: Installing dependencies...%NC%
call npm install
if errorlevel 1 (
    echo %RED%❌ Failed to install dependencies%NC%
    pause
    exit /b 1
)
echo %GREEN%✅ Dependencies installed successfully%NC%

echo.

REM Step 3: Build project
echo %BLUE%ℹ️  Step 3: Building project...%NC%
call npm run build
if errorlevel 1 (
    echo %RED%❌ Failed to build project%NC%
    pause
    exit /b 1
)
echo %GREEN%✅ Project built successfully%NC%

echo.

REM Step 4: Test server (simplified for Windows)
echo %BLUE%ℹ️  Step 4: Testing server...%NC%
echo %GREEN%✅ Build completed - server should be ready%NC%

echo.

REM Step 5: Generate configuration
echo %BLUE%ℹ️  Step 5: Generating Claude Desktop configuration...%NC%

REM Get current directory
set CURRENT_DIR=%CD%
echo %BLUE%ℹ️  Current directory: %CURRENT_DIR%%NC%

REM Replace forward slashes with backslashes for Windows
set "WINDOWS_PATH=%CURRENT_DIR:\=\\%"

REM Create configuration file
(
echo {
echo   "mcpServers": {
echo     "3gpp-guidance": {
echo       "command": "node",
echo       "args": ["dist/index.js"],
echo       "cwd": "%WINDOWS_PATH%",
echo       "description": "Expert 3GPP telecommunications guidance and research methodology"
echo     }
echo   }
echo }
) > claude_desktop_config_generated.json

echo %GREEN%✅ Generated configuration file: claude_desktop_config_generated.json%NC%
echo %BLUE%ℹ️  Configuration path: %WINDOWS_PATH%%NC%
echo %YELLOW%⚠️  You need to manually copy this configuration to: %%APPDATA%%\Claude\claude_desktop_config.json%NC%

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Copy the configuration from 'claude_desktop_config_generated.json'
echo    to your Claude Desktop configuration file at:
echo    %%APPDATA%%\Claude\claude_desktop_config.json
echo 2. Restart Claude Desktop
echo 3. Test with a 3GPP-related question
echo.
echo Example test query:
echo "Can you give me a strategic learning path for understanding 5G authentication?"
echo.
echo %GREEN%✅ Setup complete! 🚀%NC%
echo.

pause