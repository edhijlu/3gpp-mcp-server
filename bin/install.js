#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

const program = new Command();

// CLI Configuration
program
  .name('3gpp-mcp-charging')
  .description('3GPP Charging & Billing MCP Server - Expert guidance for telecom charging systems')
  .version('2.0.5');

// Available AI clients and their configuration paths
const AI_CLIENTS = {
  claude: {
    name: 'Claude Desktop',
    configPaths: {
      darwin: '~/Library/Application Support/Claude/claude_desktop_config.json',
      win32: '%APPDATA%\\Claude\\claude_desktop_config.json',
      linux: '~/.config/Claude/claude_desktop_config.json'
    },
    description: 'Anthropic Claude Desktop application'
  },
  cursor: {
    name: 'Cursor IDE',
    configPaths: {
      darwin: '~/Library/Application Support/Cursor/User/globalStorage/mcp.json',
      win32: '%APPDATA%\\Cursor\\User\\globalStorage\\mcp.json',
      linux: '~/.config/Cursor/User/globalStorage/mcp.json'
    },
    description: 'Cursor IDE with MCP support'
  },
  vscode: {
    name: 'VS Code',
    configPaths: {
      darwin: '~/Library/Application Support/Code/User/settings.json',
      win32: '%APPDATA%\\Code\\User\\settings.json',
      linux: '~/.config/Code/User/settings.json'
    },
    description: 'Visual Studio Code with MCP extension'
  }
};

// Utility functions
function getConfigPath(client, platform = os.platform()) {
  const configPath = AI_CLIENTS[client]?.configPaths[platform];
  if (!configPath) return null;

  // Expand environment variables and home directory
  return configPath
    .replace(/^~/, os.homedir())
    .replace(/%APPDATA%/g, process.env.APPDATA || '');
}

function displayBanner() {
  const banner = boxen(
    chalk.cyan.bold('🚀 3GPP Charging & Billing MCP Server') + '\n' +
    chalk.gray('Expert guidance for telecom charging systems') + '\n\n' +
    chalk.yellow('Transform your AI into a 3GPP charging expert!'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  );
  console.log(banner);
}

function detectInstalledClients() {
  const detected = [];
  const platform = os.platform();

  for (const [key, client] of Object.entries(AI_CLIENTS)) {
    const configPath = getConfigPath(key, platform);
    if (configPath) {
      const expandedPath = configPath.replace(/^~/, os.homedir());
      const dirPath = path.dirname(expandedPath);

      try {
        if (fs.existsSync(dirPath)) {
          detected.push({
            key,
            name: client.name,
            configPath: expandedPath,
            exists: fs.existsSync(expandedPath)
          });
        }
      } catch (error) {
        // Ignore errors, client not available
      }
    }
  }

  return detected;
}

function generateMCPConfig(serverPath, client = 'claude') {
  const config = {
    mcpServers: {
      "3gpp-charging": {
        command: "node",
        args: ["dist/index.js"],
        cwd: serverPath,
        description: "Expert 3GPP charging and billing guidance"
      }
    }
  };

  if (client === 'vscode') {
    return {
      "mcp.servers": config.mcpServers
    };
  }

  return config;
}

async function installDependencies(serverPath) {
  const spinner = ora('Installing dependencies...').start();

  try {
    execSync('npm install', {
      cwd: serverPath,
      stdio: ['ignore', 'ignore', 'pipe']
    });
    spinner.succeed('Dependencies installed');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    throw error;
  }
}

async function buildProject(serverPath) {
  const spinner = ora('Building project...').start();

  try {
    execSync('npm run build', {
      cwd: serverPath,
      stdio: ['ignore', 'ignore', 'pipe']
    });
    spinner.succeed('Project built successfully');
  } catch (error) {
    spinner.fail('Failed to build project');
    throw error;
  }
}

async function testServer(serverPath) {
  const spinner = ora('Testing MCP server...').start();

  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['dist/index.js'], {
      cwd: serverPath,
      stdio: ['ignore', 'ignore', 'ignore']
    });

    const timeout = setTimeout(() => {
      serverProcess.kill();
      spinner.succeed('MCP server test passed');
      resolve();
    }, 3000);

    serverProcess.on('error', (error) => {
      clearTimeout(timeout);
      spinner.fail('MCP server test failed');
      reject(error);
    });

    serverProcess.on('exit', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        spinner.succeed('MCP server test passed');
        resolve();
      } else {
        spinner.fail('MCP server test failed');
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

async function writeConfig(configPath, config, client) {
  const dir = path.dirname(configPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (client === 'vscode') {
    // For VS Code, merge with existing settings
    let existingConfig = {};
    if (fs.existsSync(configPath)) {
      try {
        existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (error) {
        console.log(chalk.yellow('Warning: Could not parse existing VS Code settings'));
      }
    }

    const mergedConfig = { ...existingConfig, ...config };
    fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
  } else {
    // For Claude and Cursor, write MCP config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
}

// Main installation command
program
  .command('init')
  .description('Initialize 3GPP Charging MCP Server')
  .option('-c, --client <client>', 'Target AI client (claude, cursor, vscode)')
  .option('-p, --path <path>', 'Installation path')
  .option('-y, --yes', 'Skip interactive prompts')
  .action(async (options) => {
    try {
      displayBanner();

      // Determine installation path
      const installPath = options.path || process.cwd();
      console.log(chalk.blue(`📁 Installation path: ${installPath}`));

      // Auto-detect available clients
      const detectedClients = detectInstalledClients();

      if (detectedClients.length === 0 && !options.client) {
        console.log(chalk.yellow('⚠️  No AI clients detected. You can still install and configure manually.'));
      }

      let selectedClient = options.client;
      let configPath = null;

      // Interactive client selection if not specified
      if (!selectedClient && !options.yes && detectedClients.length > 0) {
        const choices = detectedClients.map(client => ({
          name: `${client.name} ${client.exists ? chalk.green('(configured)') : chalk.gray('(not configured)')}`,
          value: client.key
        }));

        choices.push({ name: 'Manual configuration', value: 'manual' });

        const { client } = await inquirer.prompt([{
          type: 'list',
          name: 'client',
          message: 'Which AI client would you like to configure?',
          choices
        }]);

        selectedClient = client;
      }

      // Get configuration path
      if (selectedClient && selectedClient !== 'manual') {
        const clientInfo = detectedClients.find(c => c.key === selectedClient);
        configPath = clientInfo?.configPath || getConfigPath(selectedClient);
      }

      // Install and build
      console.log(chalk.blue('\n🔧 Setting up MCP server...'));

      await installDependencies(installPath);
      await buildProject(installPath);
      await testServer(installPath);

      // Configure client if selected
      if (selectedClient && selectedClient !== 'manual' && configPath) {
        console.log(chalk.blue(`\n⚙️  Configuring ${AI_CLIENTS[selectedClient].name}...`));

        const config = generateMCPConfig(installPath, selectedClient);
        await writeConfig(configPath, config, selectedClient);

        console.log(chalk.green(`✅ Configuration written to: ${configPath}`));
      }

      // Success message
      const successMessage = boxen(
        chalk.green.bold('🎉 Installation Complete!') + '\n\n' +
        chalk.white('Next steps:') + '\n' +
        (selectedClient && selectedClient !== 'manual'
          ? `• Restart ${AI_CLIENTS[selectedClient].name}\n`
          : '• Configure your AI client manually\n') +
        '• Test with: "How do I implement 5G converged charging?"\n\n' +
        chalk.cyan('Example queries:') + '\n' +
        chalk.gray('• "Guide me through TS 32.290 implementation"') + '\n' +
        chalk.gray('• "What is the difference between CHF and OCS?"') + '\n' +
        chalk.gray('• "Help me design a billing integration strategy"'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green'
        }
      );

      console.log(successMessage);

      if (selectedClient === 'manual' || !selectedClient) {
        console.log(chalk.yellow('\n📋 Manual Configuration:'));
        console.log(chalk.gray('Add this to your AI client\'s MCP configuration:'));
        console.log(JSON.stringify(generateMCPConfig(installPath), null, 2));
      }

    } catch (error) {
      console.error(chalk.red('❌ Installation failed:'), error.message);
      process.exit(1);
    }
  });

// Serve command - run the MCP server directly
program
  .command('serve')
  .description('Run the 3GPP Charging MCP Server')
  .action(() => {
    // Try multiple possible locations for the server file
    const possiblePaths = [
      path.join(__dirname, '..', 'dist', 'index.js'),
      path.join(__dirname, 'dist', 'index.js'),
      path.resolve(__dirname, '..', 'dist', 'index.js')
    ];

    let serverPath = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        serverPath = possiblePath;
        break;
      }
    }

    if (!serverPath) {
      console.error(chalk.red('❌ Server files not found. Possible paths checked:'));
      possiblePaths.forEach(p => console.error(chalk.gray(`  ${p}`)));
      process.exit(1);
    }

    const { ThreeGPPMCPServer } = require(serverPath);
    const server = new ThreeGPPMCPServer();
    server.run().catch(() => process.exit(1));
  });

// Info command
program
  .command('info')
  .description('Show system and client information')
  .action(() => {
    displayBanner();

    console.log(chalk.blue('System Information:'));
    console.log(`• Platform: ${os.platform()}`);
    console.log(`• Node.js: ${process.version}`);
    console.log(`• Architecture: ${os.arch()}`);

    console.log(chalk.blue('\nDetected AI Clients:'));
    const detected = detectInstalledClients();

    if (detected.length === 0) {
      console.log(chalk.gray('• No AI clients detected'));
    } else {
      detected.forEach(client => {
        const status = client.exists ? chalk.green('✓ configured') : chalk.gray('○ not configured');
        console.log(`• ${client.name}: ${status}`);
        console.log(`  ${chalk.gray(client.configPath)}`);
      });
    }
  });

// Parse command line arguments
program.parse();

// If no command specified, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}