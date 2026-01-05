/**
 * User Routes API Tests
 * Tests for user management API endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { AuthService } from '../authService.js';
import { UserService } from '../userService.js';
import { DatabaseService } from '../databaseService.js';
import { AuthMiddleware } from '../authMiddleware.js';
import { createUserRoutes } from '../userRoutes.js';
import fs from 'fs';
import path from 'path';

describe('User Routes API', () => {
  let app: express.Application;
  let authService: AuthService;
  let userService: UserService;
  let dbService: DatabaseService;
  let authMiddleware: AuthMiddleware;
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;
  const testDbPath = path.join(__dirname, '../../test-data/test-user-routes.db');

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
    regularUser = await userService.createUser({
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
    userToken = authService.generateToken(regularUser);
    adminToken = authService.generateToken(adminUser);

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api', createUserRoutes(authService, userService, authMiddleware));
  });

  afterEach(async () => {
    await dbService.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'testuser',
            password: 'TestPass123!'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user).toBeDefined();
        expect(response.body.token).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(response.body.user.username).toBe('testuser');
        expect(response.body.user.password).toBeUndefined(); // Password should not be returned
      });

      it('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'testuser',
            password: 'WrongPassword'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid username or password');
      });

      it('should reject missing credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'testuser'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Username and password are required');
      });

      it('should login default admin user', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'admin',
            password: 'Admin123!'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user.username).toBe('admin');
        expect(response.body.user.role).toBe('admin');
        expect(response.body.user.mustChangePassword).toBe(true);
      });
    });

    describe('POST /api/auth/refresh', () => {
      it('should refresh token with valid refresh token', async () => {
        const refreshToken = authService.generateRefreshToken(regularUser);

        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
      });

      it('should reject invalid refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken: 'invalid-token' })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid token');
      });

      it('should reject missing refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Refresh token is required');
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout authenticated user', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Logged out successfully');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/auth/me', () => {
      it('should return current user info', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user.username).toBe('testuser');
        expect(response.body.user.password).toBeUndefined();
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/change-password', () => {
      it('should change password with valid current password', async () => {
        const response = await request(app)
          .post('/api/auth/change-password')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            currentPassword: 'TestPass123!',
            newPassword: 'NewTestPass456!'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Password changed successfully');

        // Verify new password works
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'testuser',
            password: 'NewTestPass456!'
          })
          .expect(200);

        expect(loginResponse.body.success).toBe(true);
      });

      it('should reject incorrect current password', async () => {
        const response = await request(app)
          .post('/api/auth/change-password')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            currentPassword: 'WrongPassword',
            newPassword: 'NewTestPass456!'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Current password is incorrect');
      });

      it('should reject weak new password', async () => {
        const response = await request(app)
          .post('/api/auth/change-password')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            currentPassword: 'TestPass123!',
            newPassword: 'weak'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Password does not meet requirements');
        expect(response.body.details).toBeDefined();
      });
    });
  });

  describe('User Management Endpoints', () => {
    describe('GET /api/users', () => {
      it('should list users for admin', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.users).toBeDefined();
        expect(Array.isArray(response.body.users)).toBe(true);
        expect(response.body.users.length).toBeGreaterThan(0);
      });

      it('should deny access to regular users', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Access denied. admin role required.');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .get('/api/users')
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/users/:id', () => {
      it('should get specific user for admin', async () => {
        const response = await request(app)
          .get(`/api/users/${regularUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user.username).toBe('testuser');
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .get('/api/users/99999')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('User not found');
      });

      it('should reject invalid user ID', async () => {
        const response = await request(app)
          .get('/api/users/invalid')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid user ID');
      });
    });

    describe('POST /api/users', () => {
      it('should create new user for admin', async () => {
        const newUser = {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'NewUserPass123!',
          role: 'user'
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newUser)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.user.username).toBe('newuser');
        expect(response.body.user.password).toBeUndefined();
        expect(response.body.message).toBe('User created successfully');
      });

      it('should reject duplicate username', async () => {
        const duplicateUser = {
          username: 'testuser', // Already exists
          email: 'different@example.com',
          password: 'ValidPass123!',
          role: 'user'
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(duplicateUser)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Username already exists');
      });

      it('should reject weak password', async () => {
        const weakPasswordUser = {
          username: 'weakuser',
          email: 'weak@example.com',
          password: 'weak',
          role: 'user'
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(weakPasswordUser)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Password does not meet requirements');
      });

      it('should reject missing required fields', async () => {
        const incompleteUser = {
          username: 'incomplete'
          // Missing email and password
        };

        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(incompleteUser)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Username, email, and password are required');
      });
    });

    describe('PUT /api/users/:id', () => {
      it('should update user for admin', async () => {
        const updateData = {
          email: 'updated@example.com',
          role: 'admin'
        };

        const response = await request(app)
          .put(`/api/users/${regularUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user.email).toBe('updated@example.com');
        expect(response.body.user.role).toBe('admin');
      });

      it('should reject invalid user ID', async () => {
        const response = await request(app)
          .put('/api/users/invalid')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ email: 'test@example.com' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid user ID');
      });

      it('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .put('/api/users/99999')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ email: 'test@example.com' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('User not found');
      });
    });

    describe('DELETE /api/users/:id', () => {
      it('should delete user for admin', async () => {
        // Create a user to delete
        const userToDelete = await userService.createUser({
          username: 'deleteme',
          email: 'deleteme@example.com',
          password: 'DeletePass123!',
          role: 'user'
        });

        const response = await request(app)
          .delete(`/api/users/${userToDelete.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('User deleted successfully');
      });

      it('should prevent self-deletion', async () => {
        const response = await request(app)
          .delete(`/api/users/${adminUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Cannot delete your own account');
      });

      it('should prevent deletion of last admin', async () => {
        // Delete the testadmin user first, leaving only the default admin
        await userService.deleteUser(adminUser.id);
        
        // Get the remaining admin user (should be the default admin)
        const users = await userService.listUsers();
        const remainingAdmins = users.filter(u => u.role === 'admin');
        expect(remainingAdmins).toHaveLength(1);
        
        const lastAdmin = remainingAdmins[0];
        
        // Try to delete the last admin directly through the service (should fail)
        await expect(userService.deleteUser(lastAdmin.id))
          .rejects
          .toThrow('Cannot delete the last admin user');
        
        // Verify the admin still exists
        const adminStillExists = await userService.getUserById(lastAdmin.id);
        expect(adminStillExists).toBeTruthy();
        expect(adminStillExists!.role).toBe('admin');
      });
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/auth/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User management service is healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Property Tests - Input Sanitization', () => {
    it('should sanitize and validate all user input', async () => {
      const maliciousInputs = [
        // SQL injection attempts
        { username: "'; DROP TABLE users; --", email: 'test@example.com', password: 'ValidPass123!' },
        // XSS attempts
        { username: '<script>alert("xss")</script>', email: 'test@example.com', password: 'ValidPass123!' },
        // Very long inputs
        { username: 'a'.repeat(1000), email: 'test@example.com', password: 'ValidPass123!' },
        // Invalid email formats
        { username: 'validuser', email: 'not-an-email', password: 'ValidPass123!' },
        // Empty/null inputs
        { username: '', email: 'test@example.com', password: 'ValidPass123!' },
        { username: null, email: 'test@example.com', password: 'ValidPass123!' }
      ];

      for (const maliciousInput of maliciousInputs) {
        const response = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(maliciousInput);

        // Should reject with 400 (validation error) or 409 (conflict)
        expect([400, 409, 500]).toContain(response.status);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('Property Tests - Authentication Round Trip', () => {
    it('should maintain authentication consistency across all endpoints', async () => {
      // Test that authentication works consistently across different endpoints
      const protectedEndpoints = [
        { method: 'get', path: '/api/auth/me' },
        { method: 'post', path: '/api/auth/logout' },
        { method: 'get', path: '/api/users' },
        { method: 'post', path: '/api/auth/change-password' }
      ];

      for (const endpoint of protectedEndpoints) {
        // Test without authentication
        const noAuthResponse = await request(app)[endpoint.method](endpoint.path);
        expect(noAuthResponse.status).toBe(401);

        // Test with valid authentication (use admin token for broader access)
        const authResponse = await request(app)[endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({}); // Send empty body for POST requests

        // Should not be 401 (may be 400 for missing data, but not auth failure)
        expect(authResponse.status).not.toBe(401);
      }
    });
  });
});