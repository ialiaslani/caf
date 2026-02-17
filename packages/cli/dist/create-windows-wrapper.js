"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindowsWrapper = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
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
async function createWindowsWrapper() {
    const distBinPath = path.join(__dirname, '..', 'dist', 'bin');
    // Ensure dist/bin directory exists
    await fs.mkdirp(distBinPath);
    // Create .cmd wrappers so npx @c.a.f/cli works on Windows (npx looks for "cli" bin)
    // %~dp0 = directory of the batch file, %* = all arguments
    const cmdContent = (script) => `@echo off
node "%~dp0${script}" %*
`;
    for (const { name, script } of BIN_ENTRIES) {
        const cmdFilePath = path.join(distBinPath, `${name}.cmd`);
        await fs.writeFile(cmdFilePath, cmdContent(script));
        console.log(`✅ Created Windows wrapper: dist/bin/${name}.cmd`);
    }
}
exports.createWindowsWrapper = createWindowsWrapper;
// Run if called directly
if (require.main === module) {
    createWindowsWrapper().catch(console.error);
}
