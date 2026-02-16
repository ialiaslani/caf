#!/usr/bin/env node
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
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const scaffold_1 = require("../scaffold");
const args = process.argv.slice(2);
const projectPath = args[0] || process.cwd();
async function main() {
    try {
        console.log('🚀 Initializing CAF project structure...\n');
        const targetPath = path.resolve(projectPath);
        if (!(await fs.pathExists(targetPath))) {
            await fs.mkdirp(targetPath);
        }
        await (0, scaffold_1.scaffoldCafStructure)(targetPath);
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
    }
    catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
main();
