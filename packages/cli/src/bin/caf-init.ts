#!/usr/bin/env node

import * as fs from 'fs-extra';
import * as path from 'path';
import * as readline from 'readline';
import { scaffoldCafStructure } from '../scaffold';

const args = process.argv.slice(2);
const projectPath = args[0] || process.cwd();

function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function shouldCreateTsConfig(targetPath: string): Promise<boolean> {
  const tsconfigPath = path.join(targetPath, 'tsconfig.json');
  
  // If tsconfig.json already exists, don't ask
  if (await fs.pathExists(tsconfigPath)) {
    return false;
  }

  const answer = await promptUser('❓ Create tsconfig.json? (Y/n): ');
  return answer === '' || answer === 'y' || answer === 'yes';
}

async function main() {
  try {
    console.log('🚀 Initializing CAF project structure...\n');
    
    const targetPath = path.resolve(projectPath);
    
    if (!(await fs.pathExists(targetPath))) {
      await fs.mkdirp(targetPath);
    }
    
    // Ask user if they want tsconfig.json
    const createTsConfig = await shouldCreateTsConfig(targetPath);
    
    await scaffoldCafStructure(targetPath, createTsConfig);
    
    console.log('\n✅ CAF structure created successfully!\n');
    console.log('📁 Created folders:');
    console.log('   - caf/domain');
    console.log('   - caf/application');
    console.log('   - caf/infrastructure\n');
    
    // Check if tsconfig.json was created
    const tsconfigPath = path.join(targetPath, 'tsconfig.json');
    if (await fs.pathExists(tsconfigPath)) {
      console.log('📄 Created files:');
      console.log('   - tsconfig.json (TypeScript configuration)\n');
    }
    
    console.log('📝 Next steps:');
    console.log('   1. Install dependencies: npm install "@c-a-f/core"');
    console.log('   2. Start creating your domain entities in caf/domain/');
    console.log('   3. Create use cases in caf/application/');
    console.log('   4. Implement repositories in caf/infrastructure/');
    console.log('   5. Build your UI components in src/\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
