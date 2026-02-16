#!/usr/bin/env node

import * as fs from 'fs-extra';
import * as path from 'path';
import { scaffoldCafStructure } from '../scaffold';

const args = process.argv.slice(2);
const projectPath = args[0] || process.cwd();

async function main() {
  try {
    console.log('🚀 Initializing CAF project structure...\n');
    
    const targetPath = path.resolve(projectPath);
    
    if (!(await fs.pathExists(targetPath))) {
      await fs.mkdirp(targetPath);
    }
    
    await scaffoldCafStructure(targetPath);
    
    console.log('✅ CAF structure created successfully!\n');
    console.log('📁 Created folders:');
    console.log('   - caf/domain');
    console.log('   - caf/application');
    console.log('   - caf/infrastructure\n');
    console.log('📝 Next steps:');
    console.log('   1. Start creating your domain entities in caf/domain/');
    console.log('   2. Create use cases in caf/application/');
    console.log('   3. Implement repositories in caf/infrastructure/');
    console.log('   4. Build your UI components in src/\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
