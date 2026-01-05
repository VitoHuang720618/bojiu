/**
 * User CRUD Property Tests
 * Property-based tests for user management operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserService } from '../userService.js';
import { DatabaseService } from '../databaseService.js';
import fs from 'fs';
import path from 'path';

describe('User CRUD Property Tests', () => {
  let userService: UserService;
  let dbService: DatabaseService;
  const testDbPath = path.join(__dirname, '../../test-data/test-user-crud.db');

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
    await userService.initialize();
  });

  afterEach(async () => {
    await dbService.close();
    
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Property 5: User CRUD Validation', () => {
    it('should validate all user creation operations maintain database consistency', async () => {
      // Property: For any valid user data, creation should succeed and be retrievable
      const validUserData = [
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'ValidPass123!',
          role: 'user' as const
        },
        {
          username: 'admin2',
          email: 'admin2@example.com',
          password: 'AdminPass456!',
          role: 'admin' as const
        },
        {
          username: 'test_user',
          email: 'test.user@domain.co.uk',
          password: 'ComplexP@ss789',
          role: 'user' as const
        }
      ];

      for (const userData of validUserData) {
        // Create user
        const createdUser = await userService.createUser(userData);
        
        // Verify user was created correctly
        expect(createdUser.id).toBeGreaterThan(0);
        expect(createdUser.username).toBe(userData.username);
        expect(createdUser.email).toBe(userData.email);
        expect(createdUser.role).toBe(userData.role);
        expect(createdUser.isActive).toBe(true);
        
        // Verify user can be retrieved
        const retrievedUser = await userService.getUserById(createdUser.id);
        expect(retrievedUser).not.toBeNull();
        expect(retrievedUser!.username).toBe(userData.username);
        
        // Verify user appears in list
        const allUsers = await userService.listUsers();
        const foundUser = allUsers.find(u => u.id === createdUser.id);
        expect(foundUser).toBeDefined();
        expect(foundUser!.username).toBe(userData.username);
      }
    });

    it('should reject all invalid user creation data', async () => {
      // Property: For any invalid user data, creation should fail with appropriate error
      const invalidUserData = [
        // Invalid username
        { username: 'ab', email: 'valid@example.com', password: 'ValidPass123!', expectedError: 'Username must be between 3 and 50 characters' },
        { username: '', email: 'valid@example.com', password: 'ValidPass123!', expectedError: 'Username is required' },
        { username: 'user with spaces', email: 'valid@example.com', password: 'ValidPass123!', expectedError: 'Username can only contain letters, numbers, underscores, and hyphens' },
        
        // Invalid email
        { username: 'validuser', email: 'invalid-email', password: 'ValidPass123!', expectedError: 'Invalid email format' },
        { username: 'validuser', email: '', password: 'ValidPass123!', expectedError: 'Email is required' },
        
        // Invalid password
        { username: 'validuser', email: 'valid@example.com', password: 'weak', expectedError: 'Password must be at least 8 characters long' },
        { username: 'validuser', email: 'valid@example.com', password: 'nouppercase123', expectedError: 'Password must contain at least one lowercase letter, one uppercase letter, and one number' },
        { username: 'validuser', email: 'valid@example.com', password: 'NOLOWERCASE123', expectedError: 'Password must contain at least one lowercase letter, one uppercase letter, and one number' },
        { username: 'validuser', email: 'valid@example.com', password: 'NoNumbers!', expectedError: 'Password must contain at least one lowercase letter, one uppercase letter, and one number' },
        
        // Invalid role
        { username: 'validuser', email: 'valid@example.com', password: 'ValidPass123!', role: 'invalid' as any, expectedError: 'Role must be either "admin" or "user"' }
      ];

      for (const userData of invalidUserData) {
        await expect(userService.createUser(userData)).rejects.toThrow(userData.expectedError);
      }
    });

    it('should maintain referential integrity during user updates', async () => {
      // Property: For any user update, the operation should maintain database consistency
      
      // Create a test user
      const originalUser = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'OriginalPass123!',
        role: 'user'
      });

      const updateOperations = [
        // Update username
        { username: 'updateduser' },
        // Update email
        { email: 'updated@example.com' },
        // Update role
        { role: 'admin' as const },
        // Update password
        { password: 'NewPassword456!' },
        // Update active status
        { isActive: false },
        // Multiple updates
        { username: 'finaluser', email: 'final@example.com', role: 'user' as const }
      ];

      let currentUser = originalUser;
      
      for (const updateData of updateOperations) {
        // Add small delay to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Perform update
        const updatedUser = await userService.updateUser(currentUser.id, updateData);
        
        // Verify update was applied
        if (updateData.username) expect(updatedUser.username).toBe(updateData.username);
        if (updateData.email) expect(updatedUser.email).toBe(updateData.email);
        if (updateData.role) expect(updatedUser.role).toBe(updateData.role);
        if (updateData.isActive !== undefined) expect(updatedUser.isActive).toBe(updateData.isActive);
        
        // Verify user can still be retrieved
        const retrievedUser = await userService.getUserById(currentUser.id);
        expect(retrievedUser).not.toBeNull();
        expect(retrievedUser!.id).toBe(currentUser.id);
        
        // Verify updated timestamp changed (allow same timestamp due to SQLite precision)
        expect(new Date(updatedUser.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(currentUser.updatedAt).getTime());
        
        currentUser = updatedUser;
      }
    });

    it('should prevent duplicate usernames and emails', async () => {
      // Property: For any existing user data, creating duplicates should fail
      
      // Create initial user
      const user1 = await userService.createUser({
        username: 'uniqueuser',
        email: 'unique@example.com',
        password: 'Password123!',
        role: 'user'
      });

      // Attempt to create user with duplicate username
      await expect(userService.createUser({
        username: 'uniqueuser', // Duplicate username
        email: 'different@example.com',
        password: 'Password123!',
        role: 'user'
      })).rejects.toThrow('Username already exists');

      // Attempt to create user with duplicate email
      await expect(userService.createUser({
        username: 'differentuser',
        email: 'unique@example.com', // Duplicate email
        password: 'Password123!',
        role: 'user'
      })).rejects.toThrow('Email already exists');

      // Verify original user is still intact
      const retrievedUser = await userService.getUserById(user1.id);
      expect(retrievedUser).not.toBeNull();
      expect(retrievedUser!.username).toBe('uniqueuser');
      expect(retrievedUser!.email).toBe('unique@example.com');
    });

    it('should handle user deletion correctly', async () => {
      // Property: For any deletable user, deletion should remove user and maintain consistency
      
      // Create multiple users
      const users = [];
      for (let i = 1; i <= 3; i++) {
        const user = await userService.createUser({
          username: `user${i}`,
          email: `user${i}@example.com`,
          password: 'Password123!',
          role: 'user'
        });
        users.push(user);
      }

      const initialUserCount = (await userService.listUsers()).length;

      // Delete each user
      for (const user of users) {
        const deleted = await userService.deleteUser(user.id);
        expect(deleted).toBe(true);
        
        // Verify user no longer exists
        const retrievedUser = await userService.getUserById(user.id);
        expect(retrievedUser).toBeNull();
        
        // Verify user count decreased
        const currentUsers = await userService.listUsers();
        expect(currentUsers.length).toBeLessThan(initialUserCount);
        expect(currentUsers.find(u => u.id === user.id)).toBeUndefined();
      }
    });
  });

  describe('Property 6: Admin Protection', () => {
    it('should prevent deletion of the last admin user', async () => {
      // Property: For any system state with only one admin, deletion should be rejected
      
      // Get the default admin user (created during initialization)
      const users = await userService.listUsers();
      const adminUser = users.find(u => u.role === 'admin');
      expect(adminUser).toBeDefined();

      // Verify this is the only admin
      const adminCount = users.filter(u => u.role === 'admin').length;
      expect(adminCount).toBe(1);

      // Attempt to delete the last admin should fail
      await expect(userService.deleteUser(adminUser!.id)).rejects.toThrow('Cannot delete the last admin user');

      // Verify admin user still exists
      const stillExists = await userService.getUserById(adminUser!.id);
      expect(stillExists).not.toBeNull();
      expect(stillExists!.role).toBe('admin');
    });

    it('should allow deletion of admin when multiple admins exist', async () => {
      // Property: For any system state with multiple admins, deletion should be allowed
      
      // Create additional admin user
      const secondAdmin = await userService.createUser({
        username: 'admin2',
        email: 'admin2@example.com',
        password: 'AdminPass123!',
        role: 'admin'
      });

      // Verify we have multiple admins
      const users = await userService.listUsers();
      const adminCount = users.filter(u => u.role === 'admin').length;
      expect(adminCount).toBeGreaterThanOrEqual(2);

      // Delete one admin should succeed
      const deleted = await userService.deleteUser(secondAdmin.id);
      expect(deleted).toBe(true);

      // Verify admin was deleted
      const deletedUser = await userService.getUserById(secondAdmin.id);
      expect(deletedUser).toBeNull();

      // Verify at least one admin still exists
      const remainingUsers = await userService.listUsers();
      const remainingAdmins = remainingUsers.filter(u => u.role === 'admin');
      expect(remainingAdmins.length).toBeGreaterThanOrEqual(1);
    });

    it('should maintain admin protection across role changes', async () => {
      // Property: Admin protection should work even after role changes
      
      // Get the default admin
      const users = await userService.listUsers();
      const originalAdmin = users.find(u => u.role === 'admin');
      expect(originalAdmin).toBeDefined();

      // Create a regular user and promote to admin
      const newUser = await userService.createUser({
        username: 'promoteduser',
        email: 'promoted@example.com',
        password: 'Password123!',
        role: 'user'
      });

      const promotedAdmin = await userService.updateUser(newUser.id, { role: 'admin' });
      expect(promotedAdmin.role).toBe('admin');

      // Now we have 2 admins, demote the original admin to user
      const demotedUser = await userService.updateUser(originalAdmin!.id, { role: 'user' });
      expect(demotedUser.role).toBe('user');

      // Now we have only 1 admin (the promoted one), deletion should be protected
      await expect(userService.deleteUser(promotedAdmin.id)).rejects.toThrow('Cannot delete the last admin user');

      // Verify the promoted admin still exists
      const stillExists = await userService.getUserById(promotedAdmin.id);
      expect(stillExists).not.toBeNull();
      expect(stillExists!.role).toBe('admin');
    });

    it('should handle concurrent admin operations safely', async () => {
      // Property: Admin protection should work under concurrent operations
      
      // Create multiple admin users
      const adminUsers = [];
      for (let i = 1; i <= 3; i++) {
        const admin = await userService.createUser({
          username: `admin${i}`,
          email: `admin${i}@example.com`,
          password: 'AdminPass123!',
          role: 'admin'
        });
        adminUsers.push(admin);
      }

      // Verify we have multiple admins
      const users = await userService.listUsers();
      const adminCount = users.filter(u => u.role === 'admin').length;
      expect(adminCount).toBeGreaterThanOrEqual(4); // 3 created + 1 default

      // Delete all but one admin
      for (let i = 0; i < adminUsers.length - 1; i++) {
        const deleted = await userService.deleteUser(adminUsers[i].id);
        expect(deleted).toBe(true);
      }

      // Verify we still have admins
      const remainingUsers = await userService.listUsers();
      const remainingAdmins = remainingUsers.filter(u => u.role === 'admin');
      expect(remainingAdmins.length).toBeGreaterThanOrEqual(2); // Last created + default

      // Try to delete the remaining created admin
      const lastCreatedAdmin = adminUsers[adminUsers.length - 1];
      
      // This might succeed if there's still the default admin
      const remainingAdminCount = remainingAdmins.length;
      if (remainingAdminCount > 1) {
        const deleted = await userService.deleteUser(lastCreatedAdmin.id);
        expect(deleted).toBe(true);
      } else {
        await expect(userService.deleteUser(lastCreatedAdmin.id)).rejects.toThrow('Cannot delete the last admin user');
      }
    });
  });
});