#!/usr/bin/env node
// @ts-check
// @type module

/**
 * Interactive script to create a changeset
 * This script prompts the user to select a change type (major, minor, patch)
 * and provide a description, then runs the appropriate changeset command.
 */

import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ANSI color codes for better UX
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(
  `${colors.bright}${colors.cyan}🦋 Emoji Map Changeset Creator 🦋${colors.reset}\n`
);
console.log('This script will help you create a changeset for your changes.');

// Prompt for change type
rl.question(
  `${colors.bright}Select change type:${colors.reset}
${colors.red}1) major${colors.reset} - Breaking changes
${colors.yellow}2) minor${colors.reset} - New features (non-breaking)
${colors.green}3) patch${colors.reset} - Bug fixes and minor changes

Enter choice (1-3): `,
  (typeChoice) => {
    let changeType;

    switch (typeChoice.trim()) {
      case '1':
        changeType = 'major';
        console.log(`\n${colors.red}Selected: major${colors.reset}`);
        break;
      case '2':
        changeType = 'minor';
        console.log(`\n${colors.yellow}Selected: minor${colors.reset}`);
        break;
      case '3':
        changeType = 'patch';
        console.log(`\n${colors.green}Selected: patch${colors.reset}`);
        break;
      default:
        console.log(
          `\n${colors.red}Invalid choice. Defaulting to patch.${colors.reset}`
        );
        changeType = 'patch';
    }

    // Prompt for description
    rl.question(
      `\n${colors.bright}Enter a description of the changes:${colors.reset}\n`,
      (description) => {
        if (!description.trim()) {
          console.log(
            `${colors.red}Description cannot be empty. Aborting.${colors.reset}`
          );
          rl.close();
          return;
        }

        console.log(`\n${colors.cyan}Creating changeset...${colors.reset}`);

        try {
          // Run the changeset command with the selected type and description
          execSync(
            `pnpm changeset ${changeType} --message "${description.trim()}"`,
            { stdio: 'inherit' }
          );
          console.log(
            `\n${colors.green}✅ Changeset created successfully!${colors.reset}`
          );
        } catch (error) {
          console.error(
            `\n${colors.red}❌ Error creating changeset:${colors.reset}`,
            error.message
          );
        }

        rl.close();
      }
    );
  }
);

// Handle CTRL+C
rl.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Changeset creation cancelled.${colors.reset}`);
  rl.close();
  process.exit(0);
});
