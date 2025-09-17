#!/bin/bash
# MCP Setup Script for 3GPP MCP Server v2
# This script helps set up the MCP server for use with Claude Desktop

set -e

echo "🚀 3GPP MCP Server v2 Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"

        # Extract major version number
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

        if [ "$NODE_MAJOR" -ge 18 ]; then
            print_status "Node.js version is compatible (18+)"
        else
            print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
}

# Check if npm is available
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    npm install
    print_status "Dependencies installed successfully"
}

# Build the project
build_project() {
    print_info "Building the project..."
    npm run build
    print_status "Project built successfully"
}

# Test the MCP server
test_server() {
    print_info "Testing MCP server startup..."

    # Start server in background and capture output
    timeout 10s npm run mcp > /dev/null 2>&1 &
    SERVER_PID=$!

    # Wait a moment for server to start
    sleep 3

    # Check if server is still running
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_status "MCP server started successfully"
        # Kill the test server
        kill $SERVER_PID 2>/dev/null || true
    else
        print_error "MCP server failed to start"
        exit 1
    fi
}

# Get current directory
get_current_dir() {
    CURRENT_DIR=$(pwd)
    print_info "Current directory: $CURRENT_DIR"
}

# Generate Claude Desktop configuration
generate_claude_config() {
    get_current_dir

    print_info "Generating Claude Desktop configuration..."

    # Detect OS and set appropriate path format
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows - convert path format
        WINDOWS_PATH=$(echo "$CURRENT_DIR" | sed 's|/c/|C:/|' | sed 's|/|\\|g')
        CONFIG_PATH="$WINDOWS_PATH"
        CONFIG_FILE_LOCATION="%APPDATA%\\Claude\\claude_desktop_config.json"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        CONFIG_PATH="$CURRENT_DIR"
        CONFIG_FILE_LOCATION="~/Library/Application Support/Claude/claude_desktop_config.json"
    else
        # Linux
        CONFIG_PATH="$CURRENT_DIR"
        CONFIG_FILE_LOCATION="~/.config/Claude/claude_desktop_config.json"
    fi

    # Create the configuration
    cat > claude_desktop_config_generated.json << EOF
{
  "mcpServers": {
    "3gpp-guidance": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "$CONFIG_PATH",
      "description": "Expert 3GPP telecommunications guidance and research methodology"
    }
  }
}
EOF

    print_status "Generated configuration file: claude_desktop_config_generated.json"
    print_info "Configuration path for your system: $CONFIG_PATH"
    print_warning "You need to manually copy this configuration to: $CONFIG_FILE_LOCATION"
}

# Main setup process
main() {
    echo ""
    print_info "Starting 3GPP MCP Server v2 setup process..."
    echo ""

    # Step 1: Check prerequisites
    print_info "Step 1: Checking prerequisites..."
    check_nodejs
    check_npm
    echo ""

    # Step 2: Install dependencies
    print_info "Step 2: Installing dependencies..."
    install_dependencies
    echo ""

    # Step 3: Build project
    print_info "Step 3: Building project..."
    build_project
    echo ""

    # Step 4: Test server
    print_info "Step 4: Testing server..."
    test_server
    echo ""

    # Step 5: Generate configuration
    print_info "Step 5: Generating Claude Desktop configuration..."
    generate_claude_config
    echo ""

    # Final instructions
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Copy the configuration from 'claude_desktop_config_generated.json'"
    echo "   to your Claude Desktop configuration file"
    echo "2. Restart Claude Desktop"
    echo "3. Test with a 3GPP-related question"
    echo ""
    echo "Example test query:"
    echo "\"Can you give me a strategic learning path for understanding 5G authentication?\""
    echo ""
    print_status "Setup complete! 🚀"
}

# Run main function
main