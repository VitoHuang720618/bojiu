/**
 * User Service
 * Handles user CRUD operations and business logic
 */

import bcrypt from 'bcrypt';
import { DatabaseService } from './databaseService.js';
import { 
  User, 
  DatabaseUser, 
  CreateUserRequest, 
  UpdateUserRequest, 
  ValidationResult 
} from './userTypes.js';

export class UserService {
  private dbService: DatabaseService;
  private readonly saltRounds = 12;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  /**
   * Initialize user service and create default admin user if needed
   */
  async initialize(): Promise<void> {
    try {
      await this.dbService.initializeDatabase();
      await this.createDefaultUserIfNeeded();
      console.log('User service initialized successfully');
    } catch (error) {
      console.error('User service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create default admin user if no users exist
   */
  private async createDefaultUserIfNeeded(): Promise<void> {
    try {
      const users = await this.dbService.listUsers();
      
      if (users.length === 0) {
        console.log('No users found, creating default admin user...');
        
        const defaultAdmin: CreateUserRequest = {
          username: 'admin',
          email: 'admin@b9website.local',
          password: 'Admin123!', // Must be changed on first login
          role: 'admin',
          mustChangePassword: true
        };

        await this.createUser(defaultAdmin);
        console.log('Default admin user created successfully');
        console.log('⚠️  Default credentials: username=admin, password=Admin123!');
        console.log('⚠️  Please change the default password on first login');
      }
    } catch (error) {
      console.error('Error creating default user:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Validate input data
    const validation = this.validateUserData(userData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Check for duplicate username
      const existingUser = await this.dbService.getUserByUsername(userData.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Check for duplicate email
      const existingEmail = await this.dbService.getUserByEmail(userData.email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user in database
      const dbUser = await this.dbService.createUser({
        ...userData,
        passwordHash
      });

      // Log audit event
      await this.dbService.logAuditEvent(
        null, 
        'USER_CREATED', 
        `User created: ${userData.username} (${userData.email})`
      );

      return this.convertDatabaseUserToUser(dbUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      // Get existing user
      const existingUser = await this.dbService.getUserById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Validate update data
      const validation = this.validateUpdateData(userData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check for duplicate username (if changing)
      if (userData.username && userData.username !== existingUser.username) {
        const duplicateUser = await this.dbService.getUserByUsername(userData.username);
        if (duplicateUser && duplicateUser.id !== id) {
          throw new Error('Username already exists');
        }
      }

      // Check for duplicate email (if changing)
      if (userData.email && userData.email !== existingUser.email) {
        const duplicateEmail = await this.dbService.getUserByEmail(userData.email);
        if (duplicateEmail && duplicateEmail.id !== id) {
          throw new Error('Email already exists');
        }
      }

      // Hash new password if provided
      let updateData: UpdateUserRequest & { passwordHash?: string } = { ...userData };
      if (userData.password) {
        updateData.passwordHash = await this.hashPassword(userData.password);
        delete updateData.password;
      }

      // Update user in database
      const updatedDbUser = await this.dbService.updateUser(id, updateData);

      // Log audit event
      await this.dbService.logAuditEvent(
        id, 
        'USER_UPDATED', 
        `User updated: ${updatedDbUser.username}`
      );

      return this.convertDatabaseUserToUser(updatedDbUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user with admin protection
   */
  async deleteUser(id: number): Promise<boolean> {
    try {
      // Get user to delete
      const user = await this.dbService.getUserById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Prevent deletion of last admin user
      if (user.role === 'admin') {
        const adminCount = await this.dbService.countUsersByRole('admin');
        if (adminCount <= 1) {
          throw new Error('Cannot delete the last admin user');
        }
      }

      // Delete user
      const deleted = await this.dbService.deleteUser(id);

      if (deleted) {
        // Log audit event before the user is deleted (use null user_id for deleted users)
        await this.dbService.logAuditEvent(
          null, // Use null instead of deleted user ID to avoid foreign key constraint
          'USER_DELETED', 
          `User deleted: ${user.username} (ID: ${id})`
        );
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID (without password)
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      const dbUser = await this.dbService.getUserById(id);
      return dbUser ? this.convertDatabaseUserToUser(dbUser) : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by username (without password)
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const dbUser = await this.dbService.getUserByUsername(username);
      return dbUser ? this.convertDatabaseUserToUser(dbUser) : null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  /**
   * List all users (without passwords)
   */
  async listUsers(): Promise<User[]> {
    try {
      const dbUsers = await this.dbService.listUsers();
      return dbUsers.map(dbUser => this.convertDatabaseUserToUser(dbUser));
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(username: string, password: string): Promise<DatabaseUser | null> {
    try {
      const user = await this.dbService.getUserByUsername(username);
      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      return isValid ? user : null;
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id: number): Promise<void> {
    try {
      await this.dbService.updateLastLogin(id);
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  }

  /**
   * Validate user creation data
   */
  private validateUserData(userData: CreateUserRequest): ValidationResult {
    const errors: string[] = [];

    // Username validation
    if (!userData.username || userData.username.trim().length === 0) {
      errors.push('Username is required');
    } else if (userData.username.length < 3 || userData.username.length > 50) {
      errors.push('Username must be between 3 and 50 characters');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(userData.username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    // Email validation
    if (!userData.email || userData.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Invalid email format');
    } else if (userData.email.length > 100) {
      errors.push('Email must be less than 100 characters');
    }

    // Password validation
    if (!userData.password || userData.password.length === 0) {
      errors.push('Password is required');
    } else if (userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
      errors.push('Password must contain at least one lowercase letter, one uppercase letter, and one number');
    }

    // Role validation
    if (userData.role && !['admin', 'user'].includes(userData.role)) {
      errors.push('Role must be either "admin" or "user"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user update data
   */
  private validateUpdateData(userData: UpdateUserRequest): ValidationResult {
    const errors: string[] = [];

    // Username validation (if provided)
    if (userData.username !== undefined) {
      if (userData.username.trim().length === 0) {
        errors.push('Username cannot be empty');
      } else if (userData.username.length < 3 || userData.username.length > 50) {
        errors.push('Username must be between 3 and 50 characters');
      } else if (!/^[a-zA-Z0-9_-]+$/.test(userData.username)) {
        errors.push('Username can only contain letters, numbers, underscores, and hyphens');
      }
    }

    // Email validation (if provided)
    if (userData.email !== undefined) {
      if (userData.email.trim().length === 0) {
        errors.push('Email cannot be empty');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push('Invalid email format');
      } else if (userData.email.length > 100) {
        errors.push('Email must be less than 100 characters');
      }
    }

    // Password validation (if provided)
    if (userData.password !== undefined) {
      if (userData.password.length === 0) {
        errors.push('Password cannot be empty');
      } else if (userData.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
        errors.push('Password must contain at least one lowercase letter, one uppercase letter, and one number');
      }
    }

    // Role validation (if provided)
    if (userData.role !== undefined && !['admin', 'user'].includes(userData.role)) {
      errors.push('Role must be either "admin" or "user"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert database user to public user interface (removes password hash)
   */
  private convertDatabaseUserToUser(dbUser: DatabaseUser): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role as 'admin' | 'user',
      isActive: Boolean(dbUser.is_active),
      mustChangePassword: Boolean(dbUser.must_change_password),
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
      lastLogin: dbUser.last_login || undefined
    };
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.dbService.close();
  }
}