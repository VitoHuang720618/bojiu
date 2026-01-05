/**
 * Authentication Service Tests
 * Tests for JWT authentication and token management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../authService.js';
import { UserService } from '../userService.js';
import { DatabaseService } from '../databaseService.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let dbService: DatabaseService;
  const testDbPath = path.join(__dirname, '../../test-data/test-auth.db');

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

    // Initialize services
    dbService = new DatabaseService(testDbPath);
    userService = new UserService(dbService);
    authService = new AuthService(userService);

    // Initialize database and create test user
    await userService.initialize();
    
    // Create a test user (in addition to default admin)
    await userService.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPass123!',
      role: 'user'
    });
  });

  afterEach(async () => {
    await dbService.close();
    
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Authentication', () => {
    it('should authenticate valid user credentials', async () => {
      const result = await authService.authenticate({
        username: 'testuser',
        password: 'TestPass123!'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user!.username).toBe('testuser');
      expect(result.user!.role).toBe('user');
    });

    it('should reject invalid username', async () => {
      const result = await authService.authenticate({
        username: 'nonexistent',
        password: 'TestPass123!'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password');
      expect(result.user).toBeUndefined();
      expect(result.token).toBeUndefined();
    });

    it('should reject invalid password', async () => {
      const result = await authService.authenticate({
        username: 'testuser',
        password: 'WrongPassword'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password');
      expect(result.user).toBeUndefined();
      expect(result.token).toBeUndefined();
    });

    it('should reject empty credentials', async () => {
      const result = await authService.authenticate({
        username: '',
        password: ''
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required');
    });

    it('should authenticate default admin user', async () => {
      const result = await authService.authenticate({
        username: 'admin',
        password: 'Admin123!'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.username).toBe('admin');
      expect(result.user!.role).toBe('admin');
      expect(result.user!.mustChangePassword).toBe(true);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', async () => {
      const user = await userService.getUserByUsername('testuser');
      expect(user).not.toBeNull();

      const token = authService.generateToken(user!);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token structure
      const decoded = jwt.decode(token) as any;
      expect(decoded.sub).toBe(user!.id.toString());
      expect(decoded.username).toBe(user!.username);
      expect(decoded.role).toBe(user!.role);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should generate refresh token', async () => {
      const user = await userService.getUserByUsername('testuser');
      expect(user).not.toBeNull();

      const refreshToken = authService.generateRefreshToken(user!);
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');

      // Refresh token should have longer expiration
      const decoded = jwt.decode(refreshToken) as any;
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000) + 3600); // More than 1 hour
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate valid token', async () => {
      const user = await userService.getUserByUsername('testuser');
      const token = authService.generateToken(user!);

      const validation = await authService.validateToken(token);
      expect(validation.valid).toBe(true);
      expect(validation.user).toBeDefined();
      expect(validation.user!.username).toBe('testuser');
    });

    it('should reject invalid token signature', async () => {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwfQ.invalid_signature';

      const validation = await authService.validateToken(fakeToken);
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Invalid token');
    });

    it('should reject malformed token', async () => {
      const validation = await authService.validateToken('invalid.token.format');
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Invalid token');
    });

    it('should reject token for non-existent user', async () => {
      // Create token with non-existent user ID
      const fakePayload = {
        sub: '99999',
        username: 'nonexistent',
        role: 'user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      const fakeToken = jwt.sign(fakePayload, process.env.JWT_SECRET || 'b9-website-manager-secret-key-change-in-production');
      
      const validation = await authService.validateToken(fakeToken);
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('User not found');
    });
  });

  describe('Token Refresh', () => {
    it('should refresh valid token', async () => {
      const user = await userService.getUserByUsername('testuser');
      const refreshToken = authService.generateRefreshToken(user!);

      const result = await authService.refreshToken(refreshToken);
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.token).not.toBe(refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      const result = await authService.refreshToken('invalid.token');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
    });
  });

  describe('Token Utilities', () => {
    it('should extract token from Authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const authHeader = `Bearer ${token}`;

      const extracted = authService.extractTokenFromHeader(authHeader);
      expect(extracted).toBe(token);
    });

    it('should return null for invalid Authorization header', () => {
      expect(authService.extractTokenFromHeader('Invalid header')).toBeNull();
      expect(authService.extractTokenFromHeader('Basic dGVzdA==')).toBeNull();
      expect(authService.extractTokenFromHeader(undefined)).toBeNull();
    });

    it('should get token expiration time', async () => {
      const user = await userService.getUserByUsername('testuser');
      const token = authService.generateToken(user!);

      const expiration = authService.getTokenExpiration(token);
      expect(expiration).toBeInstanceOf(Date);
      expect(expiration!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should detect near expiration tokens', async () => {
      const user = await userService.getUserByUsername('testuser');
      
      // Create token that expires in 1 minute
      const shortLivedPayload = {
        sub: user!.id.toString(),
        username: user!.username,
        role: user!.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 // 1 minute
      };

      const shortToken = jwt.sign(shortLivedPayload, process.env.JWT_SECRET || 'b9-website-manager-secret-key-change-in-production');
      
      const isNearExpiration = authService.isTokenNearExpiration(shortToken);
      expect(isNearExpiration).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const validation = authService.validatePasswordStrength('StrongPass123!');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',           // Too short
        'nouppercase123!', // No uppercase
        'NOLOWERCASE123!', // No lowercase
        'NoNumbers!',      // No numbers
        'NoSpecialChars123' // No special characters
      ];

      for (const password of weakPasswords) {
        const validation = authService.validatePasswordStrength(password);
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      }
    });

    it('should reject extremely long passwords', () => {
      const longPassword = 'A'.repeat(130) + '1!';
      const validation = authService.validatePasswordStrength(longPassword);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Password must be less than 128 characters');
    });
  });

  describe('Property Tests - Authentication Round Trip', () => {
    it('should maintain authentication consistency across multiple operations', async () => {
      // Property: For any valid user, authentication should generate a token that validates back to the same user
      const users = await userService.listUsers();
      
      for (const user of users) {
        // Skip users that must change password for this test
        if (user.mustChangePassword) continue;
        
        // Get the user's password (we know test passwords)
        const password = user.username === 'testuser' ? 'TestPass123!' : 'Admin123!';
        
        // Authenticate
        const authResult = await authService.authenticate({
          username: user.username,
          password: password
        });
        
        expect(authResult.success).toBe(true);
        expect(authResult.token).toBeDefined();
        
        // Validate the token
        const validation = await authService.validateToken(authResult.token!);
        expect(validation.valid).toBe(true);
        expect(validation.user!.id).toBe(user.id);
        expect(validation.user!.username).toBe(user.username);
        expect(validation.user!.role).toBe(user.role);
      }
    });
  });

  describe('Property Tests - Invalid Credentials Rejection', () => {
    it('should reject all invalid credential combinations', async () => {
      const invalidCredentials = [
        { username: 'nonexistent', password: 'AnyPassword123!' },
        { username: 'testuser', password: 'WrongPassword123!' },
        { username: '', password: 'TestPass123!' },
        { username: 'testuser', password: '' },
        { username: '', password: '' }
      ];

      for (const credentials of invalidCredentials) {
        const result = await authService.authenticate(credentials);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.user).toBeUndefined();
        expect(result.token).toBeUndefined();
      }
    });
  });

  describe('Property Tests - Password Security', () => {
    it('should ensure all stored passwords are properly hashed', async () => {
      const users = await userService.listUsers();
      
      for (const user of users) {
        // Get the database user to check password hash
        const dbUser = await dbService.getUserById(user.id);
        expect(dbUser).not.toBeNull();
        
        // Password hash should not be the original password
        const originalPasswords = ['TestPass123!', 'Admin123!'];
        for (const originalPassword of originalPasswords) {
          expect(dbUser!.password_hash).not.toBe(originalPassword);
        }
        
        // Password hash should follow bcrypt format
        expect(dbUser!.password_hash).toMatch(/^\$2[aby]\$\d+\$/);
      }
    });
  });
});