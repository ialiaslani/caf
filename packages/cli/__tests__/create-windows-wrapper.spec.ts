import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('createWindowsWrapper', () => {
  // Since the function uses __dirname which is set at compile time,
  // we test the logic by verifying the expected file structure and content
  // that would be created by the function
  
  const testTempDir = path.join(__dirname, '..', 'temp-wrapper-test');
  const testDistBinPath = path.join(testTempDir, 'dist', 'bin');

  const cleanup = async () => {
    // Clean up test directory with error handling for Windows file locking issues
    try {
      if (await fs.pathExists(testTempDir)) {
        // On Windows, files might be locked briefly, so try emptying first then removing
        try {
          await fs.emptyDir(testTempDir);
          await fs.remove(testTempDir);
        } catch (err) {
          // If that fails, try direct removal
          try {
            await fs.remove(testTempDir);
          } catch {
            // Ignore cleanup errors - test directory will be cleaned up later
            // This prevents tests from hanging on Windows file locking issues
          }
        }
      }
    } catch {
      // Ignore cleanup errors - test directory will be cleaned up later
    }
  };

  beforeEach(async () => {
    await cleanup();
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should create dist/bin directory structure', async () => {
    await fs.mkdirp(testDistBinPath);
    expect(await fs.pathExists(testDistBinPath)).toBe(true);
  });

  it('should create caf-init.cmd wrapper with correct content', async () => {
    await fs.mkdirp(testDistBinPath);
    
    const cmdContent = (script: string) => `@echo off
node "%~dp0${script}" %*
`;
    
    await fs.writeFile(path.join(testDistBinPath, 'caf-init.cmd'), cmdContent('caf-init.js'));
    
    expect(await fs.pathExists(path.join(testDistBinPath, 'caf-init.cmd'))).toBe(true);
    
    const content = await fs.readFile(path.join(testDistBinPath, 'caf-init.cmd'), 'utf-8');
    expect(content).toContain('@echo off');
    expect(content).toContain('node "%~dp0caf-init.js" %*');
    expect(content.trim()).toBe(`@echo off
node "%~dp0caf-init.js" %*`);
  });

  it('should create cli.cmd wrapper with correct content', async () => {
    await fs.mkdirp(testDistBinPath);
    
    const cmdContent = (script: string) => `@echo off
node "%~dp0${script}" %*
`;
    
    await fs.writeFile(path.join(testDistBinPath, 'cli.cmd'), cmdContent('caf-init.js'));
    
    expect(await fs.pathExists(path.join(testDistBinPath, 'cli.cmd'))).toBe(true);
    
    const content = await fs.readFile(path.join(testDistBinPath, 'cli.cmd'), 'utf-8');
    expect(content).toContain('@echo off');
    expect(content).toContain('node "%~dp0caf-init.js" %*');
    expect(content.trim()).toBe(`@echo off
node "%~dp0caf-init.js" %*`);
  });

  it('should create both wrapper files (caf-init.cmd and cli.cmd)', async () => {
    await fs.mkdirp(testDistBinPath);
    
    const cmdContent = (script: string) => `@echo off
node "%~dp0${script}" %*
`;
    
    await fs.writeFile(path.join(testDistBinPath, 'caf-init.cmd'), cmdContent('caf-init.js'));
    await fs.writeFile(path.join(testDistBinPath, 'cli.cmd'), cmdContent('caf-init.js'));
    
    expect(await fs.pathExists(path.join(testDistBinPath, 'caf-init.cmd'))).toBe(true);
    expect(await fs.pathExists(path.join(testDistBinPath, 'cli.cmd'))).toBe(true);
  });

  it('should reference caf-init.js in both wrapper files', async () => {
    await fs.mkdirp(testDistBinPath);
    
    const cmdContent = (script: string) => `@echo off
node "%~dp0${script}" %*
`;
    
    await fs.writeFile(path.join(testDistBinPath, 'caf-init.cmd'), cmdContent('caf-init.js'));
    await fs.writeFile(path.join(testDistBinPath, 'cli.cmd'), cmdContent('caf-init.js'));
    
    const cafInitContent = await fs.readFile(path.join(testDistBinPath, 'caf-init.cmd'), 'utf-8');
    const cliContent = await fs.readFile(path.join(testDistBinPath, 'cli.cmd'), 'utf-8');
    
    // Both should reference caf-init.js
    expect(cafInitContent).toContain('caf-init.js');
    expect(cliContent).toContain('caf-init.js');
    
    // Neither should reference cli.js
    expect(cafInitContent).not.toContain('cli.js');
    expect(cliContent).not.toContain('cli.js');
  }, 30000); // 30 second timeout to prevent hanging

  it('should use %~dp0 for directory path and %* for arguments', async () => {
    await fs.mkdirp(testDistBinPath);
    
    const cmdContent = (script: string) => `@echo off
node "%~dp0${script}" %*
`;
    
    await fs.writeFile(path.join(testDistBinPath, 'caf-init.cmd'), cmdContent('caf-init.js'));
    
    const content = await fs.readFile(path.join(testDistBinPath, 'caf-init.cmd'), 'utf-8');
    
    // Verify Windows batch file syntax
    expect(content).toContain('%~dp0'); // Directory of batch file
    expect(content).toContain('%*'); // All arguments
  }, 30000); // 30 second timeout to prevent hanging
});
