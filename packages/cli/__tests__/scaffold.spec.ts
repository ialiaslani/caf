import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { scaffoldCafStructure } from '../src/scaffold';

describe('scaffoldCafStructure', () => {
  const testDir = path.join(__dirname, '..', 'temp-test-cli');
  const cafPath = path.join(testDir, 'caf');

  beforeEach(async () => {
    // Clean up test directory before each test
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
    await fs.mkdirp(testDir);
  });

  afterEach(async () => {
    // Clean up test directory after each test
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  it('should create the main caf directory', async () => {
    await scaffoldCafStructure(testDir);
    expect(await fs.pathExists(cafPath)).toBe(true);
  });

  it('should create domain structure', async () => {
    await scaffoldCafStructure(testDir);
    
    const domainPath = path.join(cafPath, 'domain');
    const userPath = path.join(domainPath, 'User');
    
    expect(await fs.pathExists(domainPath)).toBe(true);
    expect(await fs.pathExists(userPath)).toBe(true);
    expect(await fs.pathExists(path.join(userPath, 'user.entities.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(userPath, 'user.irepository.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(userPath, 'user.service.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(userPath, 'index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(domainPath, 'index.ts'))).toBe(true);
  });

  it('should create application structure', async () => {
    await scaffoldCafStructure(testDir);
    
    const applicationPath = path.join(cafPath, 'application');
    const userAppPath = path.join(applicationPath, 'User');
    const commandsPath = path.join(userAppPath, 'Commands');
    const queriesPath = path.join(userAppPath, 'Queries');
    
    expect(await fs.pathExists(applicationPath)).toBe(true);
    expect(await fs.pathExists(userAppPath)).toBe(true);
    expect(await fs.pathExists(commandsPath)).toBe(true);
    expect(await fs.pathExists(queriesPath)).toBe(true);
    expect(await fs.pathExists(path.join(queriesPath, 'GetUsers.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(commandsPath, 'CreateUser.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(userAppPath, 'index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(applicationPath, 'index.ts'))).toBe(true);
  });

  it('should create infrastructure structure', async () => {
    await scaffoldCafStructure(testDir);
    
    const infrastructurePath = path.join(cafPath, 'infrastructure');
    const apiPath = path.join(infrastructurePath, 'api');
    const userApiPath = path.join(apiPath, 'User');
    
    expect(await fs.pathExists(infrastructurePath)).toBe(true);
    expect(await fs.pathExists(apiPath)).toBe(true);
    expect(await fs.pathExists(userApiPath)).toBe(true);
    expect(await fs.pathExists(path.join(userApiPath, 'UserRepository.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(userApiPath, 'UserApi.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(userApiPath, 'index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(apiPath, 'index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(infrastructurePath, 'index.ts'))).toBe(true);
  });

  it('should create main caf index file', async () => {
    await scaffoldCafStructure(testDir);
    
    const mainIndexPath = path.join(cafPath, 'index.ts');
    expect(await fs.pathExists(mainIndexPath)).toBe(true);
    
    const content = await fs.readFile(mainIndexPath, 'utf-8');
    expect(content).toContain("export * from './domain'");
    expect(content).toContain("export * from './application'");
    expect(content).toContain("export * from './infrastructure'");
  });

  it('should create domain User entity file with correct content', async () => {
    await scaffoldCafStructure(testDir);
    
    const entityPath = path.join(cafPath, 'domain', 'User', 'user.entities.ts');
    const content = await fs.readFile(entityPath, 'utf-8');
    
    expect(content).toContain('export interface User');
    expect(content).toContain('id: string');
    expect(content).toContain('name: string');
    expect(content).toContain('email: string');
  });

  it('should create domain User repository interface with correct methods', async () => {
    await scaffoldCafStructure(testDir);
    
    const repoPath = path.join(cafPath, 'domain', 'User', 'user.irepository.ts');
    const content = await fs.readFile(repoPath, 'utf-8');
    
    expect(content).toContain('export interface IUserRepository');
    expect(content).toContain('getUsers(): Promise<User[]>');
    expect(content).toContain('getUserById(id: string): Promise<User>');
    expect(content).toContain('createUser(user: User): Promise<User>');
  });

  it('should create GetUsers query with UseCase implementation', async () => {
    await scaffoldCafStructure(testDir);
    
    const queryPath = path.join(cafPath, 'application', 'User', 'Queries', 'GetUsers.ts');
    const content = await fs.readFile(queryPath, 'utf-8');
    
    expect(content).toContain('import { UseCase, RequestResult, pulse } from \'@c.a.f/core\'');
    expect(content).toContain('export class GetUsers implements UseCase<[], User[]>');
    expect(content).toContain('async execute(): Promise<RequestResult<User[]>>');
  });

  it('should create CreateUser command with UseCase implementation', async () => {
    await scaffoldCafStructure(testDir);
    
    const commandPath = path.join(cafPath, 'application', 'User', 'Commands', 'CreateUser.ts');
    const content = await fs.readFile(commandPath, 'utf-8');
    
    expect(content).toContain('import { UseCase, RequestResult, pulse } from \'@c.a.f/core\'');
    expect(content).toContain('export class CreateUser implements UseCase<[User], User>');
    expect(content).toContain('async execute(user: User): Promise<RequestResult<User>>');
  });

  it('should create UserRepository implementation', async () => {
    await scaffoldCafStructure(testDir);
    
    const repoPath = path.join(cafPath, 'infrastructure', 'api', 'User', 'UserRepository.ts');
    const content = await fs.readFile(repoPath, 'utf-8');
    
    expect(content).toContain('import { AxiosInstance } from \'axios\'');
    expect(content).toContain('export class UserRepository implements IUserRepository');
    expect(content).toContain('async getUsers(): Promise<User[]>');
  });

  it('should create tsconfig.json when createTsConfig is true', async () => {
    await scaffoldCafStructure(testDir, true);
    
    const tsconfigPath = path.join(testDir, 'tsconfig.json');
    expect(await fs.pathExists(tsconfigPath)).toBe(true);
    
    const content = await fs.readFile(tsconfigPath, 'utf-8');
    expect(content).toContain('"compilerOptions"');
    expect(content).toContain('"include"');
  });

  it('should not overwrite existing tsconfig.json', async () => {
    const tsconfigPath = path.join(testDir, 'tsconfig.json');
    const existingContent = '{"compilerOptions": {"target": "ES2015"}}';
    await fs.writeFile(tsconfigPath, existingContent);
    
    await scaffoldCafStructure(testDir, true);
    
    const content = await fs.readFile(tsconfigPath, 'utf-8');
    expect(content).toBe(existingContent);
  });

  it('should work with nested directory paths', async () => {
    const nestedPath = path.join(testDir, 'nested', 'project');
    await fs.mkdirp(nestedPath);
    
    await scaffoldCafStructure(nestedPath);
    
    const nestedCafPath = path.join(nestedPath, 'caf');
    expect(await fs.pathExists(nestedCafPath)).toBe(true);
    expect(await fs.pathExists(path.join(nestedCafPath, 'domain'))).toBe(true);
  });
});
