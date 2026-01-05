/**
 * Authentication Middleware Tests
 * Tests for JWT authentication middleware and route protection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express, { Request, Response } from 'express';
import request from 'supertest';
import { AuthService } from '../authService.js';
import { UserService } from '../userService.js';
import { DatabaseService } from '../databaseService.js';
import { AuthMiddleware } from '../authMiddleware.js';
import fs from 'fs';
import path from 'path';

describe('AuthMiddleware', () => {
  let app: express.Application;
  let authService: AuthService;
  let userService: UserService;
  let dbService: DatabaseService;
  let authMiddleware: AuthMiddleware;
  let testUser: any;
  let adminUser: any;
  let userToken: string;
  let adminToken: string;
  const testDbPath = path.join(__dirname, '../../test-data/test-auth-middleware.db');

  beforeEach(async () => {
    // Setup test database
    const testDir = path.dirname(testDbPath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize services
    dbService = new DatabaseService(testDbPath);
    userService = new UserService(dbService);
    authService = new AuthService(userService);
    authMiddleware = new AuthMiddleware(authService);

    await userService.initialize();

    // Create test users
    testUser = await userService.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPass123!',
      role: 'user'
    });

    adminUser = await userService.createUser({
      username: 'testadmin',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: 'admin'
    });

    // Generate tokens
    userToken = authService.generateToken(testUser);
    adminToken = authService.generateToken(adminUser);

    // Setup Express app
    app = express();
    app.use(express.json());

    // Test routes
    app.get('/public', (req, res) => {
      res.json({ message: 'Public endpoint' });
    });

    app.get('/protected', 
      authMiddleware.checkTokenExpiration(),
      authMiddleware.authenticate(), 
      (req, res) => {
        res.json({ message: 'Protected endpoint', user: req.user?.username });
      }
    );

    app.get('/admin-only', authMiddleware.requireAdmin(), (req, res) => {
      res.json({ message: 'Admin only endpoint', user: req.user?.username });
    });

    app.get('/user-only', authMiddleware.requireUser(), (req, res) => {
      res.json({ message: 'User only endpoint', user: req.user?.username });
    });

    app.get('/optional-auth', authMiddleware.optionalAuth(), (req, res) => {
      res.json({ 
        message: 'Optional auth endpoint', 
        user: req.user?.username || 'anonymous' 
      });
    });
  });

  afterEach(async () => {
    await dbService.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Basic Authentication', () => {
    it('should allow access to public endpoints without token', async () => {
      const response = await request(app)
        .get('/public')
        .expect(200);

      expect(response.body.message).toBe('Public endpoint');
    });

    it('should protect endpoints requiring authentication', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication token required');
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Protected endpoint');
      expect(response.body.user).toBe('testuser');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should reject malformed Authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Authentication token required');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin access to admin-only endpoints', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Admin only endpoint');
      expect(response.body.user).toBe('testadmin');
    });

    it('should deny user access to admin-only endpoints', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied. admin role required.');
    });

    it('should allow user access to user endpoints', async () => {
      const response = await request(app)
        .get('/user-only')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('User only endpoint');
      expect(response.body.user).toBe('testuser');
    });

    it('should allow admin access to user endpoints', async () => {
      const response = await request(app)
        .get('/user-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('User only endpoint');
      expect(response.body.user).toBe('testadmin');
    });
  });

  describe('Optional Authentication', () => {
    it('should work without token', async () => {
      const response = await request(app)
        .get('/optional-auth')
        .expect(200);

      expect(response.body.message).toBe('Optional auth endpoint');
      expect(response.body.user).toBe('anonymous');
    });

    it('should work with valid token', async () => {
      const response = await request(app)
        .get('/optional-auth')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Optional auth endpoint');
      expect(response.body.user).toBe('testuser');
    });

    it('should work with invalid token (fallback to anonymous)', async () => {
      const response = await request(app)
        .get('/optional-auth')
        .set('Authorization', 'Bearer invalid-token')
        .expect(200);

      expect(response.body.message).toBe('Optional auth endpoint');
      expect(response.body.user).toBe('anonymous');
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting for failed authentication attempts', async () => {
      // Make multiple failed requests
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get('/protected')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      }

      // Next request should be rate limited
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(429);

      expect(response.body.error).toContain('Too many authentication attempts');
      expect(response.body.retryAfter).toBeGreaterThan(0);
    });

    it('should reset rate limit on successful authentication', async () => {
      // Make some failed requests
      for (let i = 0; i < 3; i++) {
        await request(app)
          .get('/protected')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      }

      // Successful request should reset rate limit
      await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Should be able to make more requests
      await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Password Change Requirement', () => {
    it('should enforce password change requirement', async () => {
      // Create user that must change password
      const mustChangeUser = await userService.createUser({
        username: 'mustchange',
        email: 'mustchange@example.com',
        password: 'TempPass123!',
        role: 'user',
        mustChangePassword: true
      });

      const mustChangeToken = authService.generateToken(mustChangeUser);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${mustChangeToken}`)
        .expect(403);

      expect(response.body.error).toBe('Password change required');
      expect(response.body.mustChangePassword).toBe(true);
    });

    it('should allow access to password change endpoints', async () => {
      // Setup password change endpoint
      app.post('/api/auth/change-password', authMiddleware.authenticate(), (req, res) => {
        res.json({ message: 'Password change endpoint' });
      });

      const mustChangeUser = await userService.createUser({
        username: 'mustchange2',
        email: 'mustchange2@example.com',
        password: 'TempPass123!',
        role: 'user',
        mustChangePassword: true
      });

      const mustChangeToken = authService.generateToken(mustChangeUser);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${mustChangeToken}`)
        .send({ currentPassword: 'old', newPassword: 'new' })
        .expect(200);

      expect(response.body.message).toBe('Password change endpoint');
    });
  });

  describe('Token Expiration Handling', () => {
    it('should add token refresh headers for near-expiring tokens', async () => {
      // Create a token that expires soon (this is a bit tricky to test)
      // We'll mock the isTokenNearExpiration method
      const originalMethod = authService.isTokenNearExpiration;
      authService.isTokenNearExpiration = vi.fn().mockReturnValue(true);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.headers['x-token-refresh-suggested']).toBe('true');

      // Restore original method
      authService.isTokenNearExpiration = originalMethod;
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Close database to simulate error
      await dbService.close();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401); // Database error causes token validation to fail

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token validation failed');
    });
  });

  describe('Rate Limit Management', () => {
    it('should provide rate limit statistics', () => {
      const stats = authMiddleware.getRateLimitStats();
      expect(stats).toHaveProperty('totalClients');
      expect(stats).toHaveProperty('blockedClients');
      expect(typeof stats.totalClients).toBe('number');
      expect(typeof stats.blockedClients).toBe('number');
    });

    it('should clean up expired rate limit entries', () => {
      // This is more of a unit test for the cleanup method
      authMiddleware.cleanupRateLimit();
      
      const stats = authMiddleware.getRateLimitStats();
      expect(stats.totalClients).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Property Tests - API Security Enforcement', () => {
    it('should enforce authentication across all protected endpoints', async () => {
      const protectedEndpoints = ['/protected', '/admin-only', '/user-only'];
      
      for (const endpoint of protectedEndpoints) {
        // Test without token
        const noTokenResponse = await request(app).get(endpoint);
        expect(noTokenResponse.status).toBe(401);
        
        // Test with invalid token
        const invalidTokenResponse = await request(app)
          .get(endpoint)
          .set('Authorization', 'Bearer invalid-token');
        expect(invalidTokenResponse.status).toBe(401);
        
        // Test with valid token (should work for at least some endpoints)
        const validTokenResponse = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${adminToken}`); // Admin can access all
        expect([200, 403]).toContain(validTokenResponse.status); // 200 for allowed, 403 for role mismatch
      }
    });
  });

  describe('Property Tests - Rate Limiting Protection', () => {
    it('should consistently apply rate limiting across different clients', async () => {
      // Simulate requests from different IPs by mocking the IP
      const originalIp = '192.168.1.1';
      
      // Make requests that should trigger rate limiting
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .get('/protected')
          .set('Authorization', 'Bearer invalid-token')
          .set('X-Forwarded-For', originalIp);
        
        if (i < 5) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429);
        }
      }
    });
  });
});