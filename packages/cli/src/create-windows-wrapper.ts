import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Creates a Windows .cmd wrapper file for the bin command
 * This ensures npx works on Windows with scoped packages.
 * 
 * The .cmd file is included in the published package so that
 * npx can find it when extracting the package on Windows.
 */
const BIN_ENTRIES = [
  { name: 'caf-init', script: 'caf-init.js' },
  { name: 'cli', script: 'caf-init.js' },
];

export async function createWindowsWrapper(): Promise<void> {
  const distBinPath = path.join(__dirname, '..', 'dist', 'bin');

  // Ensure dist/bin directory exists
  await fs.mkdirp(distBinPath);

  // Create .cmd wrappers so npx @c.a.f/cli works on Windows (npx looks for "cli" bin)
  // %~dp0 = directory of the batch file, %* = all arguments
  const cmdContent = (script: string) => `@echo off
node "%~dp0${script}" %*
`;

  for (const { name, script } of BIN_ENTRIES) {
    const cmdFilePath = path.join(distBinPath, `${name}.cmd`);
    await fs.writeFile(cmdFilePath, cmdContent(script));
    console.log(`✅ Created Windows wrapper: dist/bin/${name}.cmd`);
  }
}

// Run if called directly
if (require.main === module) {
  createWindowsWrapper().catch(console.error);
}
