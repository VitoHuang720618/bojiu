/**
 * Database Service Tests
 * Tests for SQLite database operations and schema management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService } from '../databaseService.js';
import { UserService } from '../userService.js';
import fs from 'fs';
import path from 'path';

describe('DatabaseService', () => {
  let dbService: DatabaseService;
  let userService: UserService;
  const testDbPath = path.join(__dirname, '../../test-data/test-users.db');

  beforeEach(async () => {
    // Ensure test directory exists
    const testDir = path.dirname(testDbPath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Remove existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    dbService = new DatabaseService(testDbPath);
    userService = new UserService(dbService);
  });

  afterEach(async () => {
    await dbService.close();
    
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Database Initialization', () => {
    it('should initialize database and create schema', async () => {
      await dbService.initializeDatabase();
      
      // Check if database file was created
      expect(fs.existsSync(testDbPath)).toBe(true);
      
      // Validate database integrity
      const isValid = await dbService.validateIntegrity();
      expect(isValid).toBe(true);
    });

    it('should be idempotent - multiple initializations should not cause errors', async () => {
      // Initialize multiple times
      await dbService.initializeDatabase();
      await dbService.initializeDatabase();
      await dbService.initializeDatabase();
      
      const isValid = await dbService.validateIntegrity();
      expect(isValid).toBe(true);
    });
  });

  describe('User CRUD Operations', () => {
    beforeEach(async () => {
      await dbService.initializeDatabase();
    });

    it('should create a user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TempPass123!',
        passwordHash: 'hashedpassword123',
        role: 'user' as const,
        mustChangePassword: false
      };

      const user = await dbService.createUser(userData);
      
      expect(user.id).toBeGreaterThan(0);
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
    });

    it('should retrieve user by username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TempPass123!',
        passwordHash: 'hashedpassword123',
        role: 'user' as const,
        mustChangePassword: false
      };

      await dbService.createUser(userData);
      const retrievedUser = await dbService.getUserByUsername('testuser');
      
      expect(retrievedUser).not.toBeNull();
      expect(retrievedUser!.username).toBe('testuser');
      expect(retrievedUser!.email).toBe('test@example.com');
    });

    it('should list all users', async () => {
      const users = [
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'TempPass123!',
          passwordHash: 'hash1',
          role: 'user' as const,
          mustChangePassword: false
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'TempPass123!',
          passwordHash: 'hash2',
          role: 'admin' as const,
          mustChangePassword: false
        }
      ];

      for (const userData of users) {
        await dbService.createUser(userData);
      }

      const allUsers = await dbService.listUsers();
      expect(allUsers).toHaveLength(2);
      expect(allUsers.map(u => u.username)).toContain('user1');
      expect(allUsers.map(u => u.username)).toContain('user2');
    });
  });

  describe('UserService Integration', () => {
    it('should create default admin user on initialization', async () => {
      await userService.initialize();
      
      const users = await userService.listUsers();
      expect(users).toHaveLength(1);
      
      const adminUser = users[0];
      expect(adminUser.username).toBe('admin');
      expect(adminUser.role).toBe('admin');
      expect(adminUser.mustChangePassword).toBe(true);
    });

    it('should validate user creation data', async () => {
      await userService.initialize();
      
      // Test invalid username
      await expect(userService.createUser({
        username: 'ab', // Too short
        email: 'test@example.com',
        password: 'ValidPass123!'
      })).rejects.toThrow('Username must be between 3 and 50 characters');

      // Test invalid email
      await expect(userService.createUser({
        username: 'validuser',
        email: 'invalid-email', // Invalid format
        password: 'ValidPass123!'
      })).rejects.toThrow('Invalid email format');

      // Test weak password
      await expect(userService.createUser({
        username: 'validuser',
        email: 'test@example.com',
        password: 'weak' // Too weak
      })).rejects.toThrow('Password must be at least 8 characters long');
    });

    it('should hash passwords securely', async () => {
      await userService.initialize();
      
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'MySecretPassword123!'
      };

      await userService.createUser(userData);
      
      // Verify password is hashed in database
      const dbUser = await dbService.getUserByUsername('testuser');
      expect(dbUser).not.toBeNull();
      expect(dbUser!.password_hash).not.toBe(userData.password);
      expect(dbUser!.password_hash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
      
      // Verify password verification works
      const verifiedUser = await userService.verifyPassword('testuser', 'MySecretPassword123!');
      expect(verifiedUser).not.toBeNull();
      
      const wrongPassword = await userService.verifyPassword('testuser', 'WrongPassword');
      expect(wrongPassword).toBeNull();
    });
  });
});