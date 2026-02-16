import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Creates a Windows .cmd wrapper file for the bin command
 * This ensures npx works on Windows with scoped packages.
 * 
 * The .cmd file is included in the published package so that
 * npx can find it when extracting the package on Windows.
 */
export async function createWindowsWrapper(): Promise<void> {
  const distBinPath = path.join(__dirname, '..', 'dist', 'bin');
  const cmdFilePath = path.join(distBinPath, 'caf-init.cmd');
  
  // Ensure dist/bin directory exists
  await fs.mkdirp(distBinPath);
  
  // Create .cmd wrapper that calls the .js file
  // %~dp0 = directory of the batch file
  // %* = all arguments passed to the batch file
  const cmdContent = `@echo off
node "%~dp0caf-init.js" %*
`;
  
  await fs.writeFile(cmdFilePath, cmdContent);
  console.log('✅ Created Windows wrapper: dist/bin/caf-init.cmd');
}

// Run if called directly
if (require.main === module) {
  createWindowsWrapper().catch(console.error);
}
