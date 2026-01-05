/**
 * User Management API Routes
 * Handles authentication and user CRUD operations
 */

import express, { Request, Response } from 'express';
import { AuthService } from './authService.js';
import { UserService } from './userService.js';
import { AuthMiddleware } from './authMiddleware.js';
import { 
  LoginRequest, 
  CreateUserRequest, 
  UpdateUserRequest,
  User 
} from './userTypes.js';

export function createUserRoutes(
  authService: AuthService, 
  userService: UserService, 
  authMiddleware: AuthMiddleware
): express.Router {
  const router = express.Router();

  // Apply audit logging to all routes
  router.use(authMiddleware.auditLog());

  // Apply token expiration check to all routes
  router.use(authMiddleware.checkTokenExpiration());

  /**
   * POST /auth/login
   * Authenticate user and return JWT token
   */
  router.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const loginData: LoginRequest = req.body;

      // Validate input
      if (!loginData.username || !loginData.password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      // Authenticate user
      const result = await authService.authenticate(loginData);

      if (result.success) {
        // Generate refresh token
        const refreshToken = authService.generateRefreshToken(result.user!);
        
        res.json({
          success: true,
          user: result.user,
          token: result.token,
          refreshToken: refreshToken
        });
      } else {
        res.status(401).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  });

  /**
   * POST /auth/refresh
   * Refresh JWT token using refresh token
   */
  router.post('/auth/refresh', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      const result = await authService.refreshToken(refreshToken);

      if (result.success) {
        res.json({
          success: true,
          token: result.token,
          refreshToken: result.refreshToken
        });
      } else {
        res.status(401).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: 'Token refresh failed'
      });
    }
  });

  /**
   * POST /auth/logout
   * Logout user (client-side token removal)
   */
  router.post('/auth/logout', authMiddleware.authenticate(), (req: Request, res: Response) => {
    // In a stateless JWT system, logout is primarily client-side
    // The client should remove the token from storage
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  /**
   * GET /auth/me
   * Get current user information
   */
  router.get('/auth/me', authMiddleware.authenticate(), (req: Request, res: Response) => {
    res.json({
      success: true,
      user: req.user
    });
  });

  /**
   * POST /auth/change-password
   * Change current user's password
   */
  router.post('/auth/change-password', authMiddleware.authenticate(), async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user!;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await userService.verifyPassword(user.username, currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Validate new password strength
      const passwordValidation = authService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        });
      }

      // Update password
      await userService.updateUser(user.id, {
        password: newPassword,
        mustChangePassword: false
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({
        success: false,
        error: 'Password change failed'
      });
    }
  });

  /**
   * GET /users
   * List all users (admin only)
   */
  router.get('/users', authMiddleware.requireAdmin(), async (req: Request, res: Response) => {
    try {
      const users = await userService.listUsers();
      res.json({
        success: true,
        users: users
      });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve users'
      });
    }
  });

  /**
   * GET /users/:id
   * Get specific user by ID (admin only)
   */
  router.get('/users/:id', authMiddleware.requireAdmin(), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        user: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user'
      });
    }
  });

  /**
   * POST /users
   * Create new user (admin only)
   */
  router.post('/users', authMiddleware.requireAdmin(), async (req: Request, res: Response) => {
    try {
      const userData: CreateUserRequest = req.body;

      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        return res.status(400).json({
          success: false,
          error: 'Username, email, and password are required'
        });
      }

      // Validate password strength
      const passwordValidation = authService.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        });
      }

      // Create user
      const user = await userService.createUser(userData);

      res.status(201).json({
        success: true,
        user: user,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Create user error:', error);
      
      // Handle specific validation errors
      if (error instanceof Error) {
        if (error.message.includes('Username already exists') || 
            error.message.includes('Email already exists')) {
          return res.status(409).json({
            success: false,
            error: error.message
          });
        }
        
        if (error.message.includes('Validation failed')) {
          return res.status(400).json({
            success: false,
            error: error.message
          });
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }
  });

  /**
   * PUT /users/:id
   * Update user (admin only)
   */
  router.put('/users/:id', authMiddleware.requireAdmin(), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData: UpdateUserRequest = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      // Validate password if provided
      if (updateData.password) {
        const passwordValidation = authService.validatePasswordStrength(updateData.password);
        if (!passwordValidation.isValid) {
          return res.status(400).json({
            success: false,
            error: 'Password does not meet requirements',
            details: passwordValidation.errors
          });
        }
      }

      // Update user
      const user = await userService.updateUser(userId, updateData);

      res.json({
        success: true,
        user: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Update user error:', error);
      
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message.includes('User not found')) {
          return res.status(404).json({
            success: false,
            error: error.message
          });
        }
        
        if (error.message.includes('Username already exists') || 
            error.message.includes('Email already exists')) {
          return res.status(409).json({
            success: false,
            error: error.message
          });
        }
        
        if (error.message.includes('Validation failed')) {
          return res.status(400).json({
            success: false,
            error: error.message
          });
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update user'
      });
    }
  });

  /**
   * DELETE /users/:id
   * Delete user (admin only)
   */
  router.delete('/users/:id', authMiddleware.requireAdmin(), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
      }

      // Prevent self-deletion
      if (req.user!.id === userId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
      }

      // Delete user
      const deleted = await userService.deleteUser(userId);

      if (deleted) {
        res.json({
          success: true,
          message: 'User deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message.includes('Cannot delete the last admin user')) {
          return res.status(400).json({
            success: false,
            error: error.message
          });
        }
        
        if (error.message.includes('User not found')) {
          return res.status(404).json({
            success: false,
            error: error.message
          });
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }
  });

  /**
   * GET /auth/health
   * Health check endpoint (no authentication required)
   */
  router.get('/auth/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'User management service is healthy',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}