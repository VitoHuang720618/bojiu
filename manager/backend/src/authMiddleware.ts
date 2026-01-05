/**
 * Authentication Middleware
 * Handles JWT token validation and route protection
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './authService.js';
import { User } from './userTypes.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requireRole?: 'admin' | 'user';
  rateLimitAttempts?: number;
  rateLimitWindow?: number; // in milliseconds
}

export class AuthMiddleware {
  private authService: AuthService;
  private rateLimitMap: Map<string, { attempts: number; resetTime: number }> = new Map();

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Create authentication middleware
   */
  authenticate(options: AuthMiddlewareOptions = {}) {
    const {
      requireAuth = true,
      requireRole,
      rateLimitAttempts = 5,
      rateLimitWindow = 15 * 60 * 1000 // 15 minutes
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Skip authentication if not required
        if (!requireAuth) {
          // Try to authenticate if token is present, but don't fail if missing
          const authHeader = req.headers.authorization;
          const token = this.authService.extractTokenFromHeader(authHeader);
          
          if (token) {
            try {
              const validation = await this.authService.validateToken(token);
              if (validation.valid && validation.user) {
                req.user = validation.user;
              }
            } catch (error) {
              // Ignore authentication errors for optional auth
            }
          }
          
          return next();
        }

        // Check rate limiting for authentication attempts
        const clientId = this.getClientId(req);
        if (this.isRateLimited(clientId, rateLimitAttempts, rateLimitWindow)) {
          return res.status(429).json({
            success: false,
            error: 'Too many authentication attempts. Please try again later.',
            retryAfter: this.getRateLimitResetTime(clientId)
          });
        }

        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = this.authService.extractTokenFromHeader(authHeader);

        if (!token) {
          this.recordFailedAttempt(clientId);
          return res.status(401).json({
            success: false,
            error: 'Authentication token required'
          });
        }

        // Validate token
        const validation = await this.authService.validateToken(token);
        
        if (!validation.valid || !validation.user) {
          this.recordFailedAttempt(clientId);
          return res.status(401).json({
            success: false,
            error: validation.error || 'Invalid authentication token'
          });
        }

        // Check role requirements
        if (requireRole && validation.user.role !== requireRole && validation.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            error: `Access denied. ${requireRole} role required.`
          });
        }

        // Check if user must change password
        if (validation.user.mustChangePassword && !this.isPasswordChangeEndpoint(req)) {
          return res.status(403).json({
            success: false,
            error: 'Password change required',
            mustChangePassword: true
          });
        }

        // Reset rate limit on successful authentication
        this.resetRateLimit(clientId);

        // Attach user to request
        req.user = validation.user;
        next();

      } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({
          success: false,
          error: 'Authentication failed'
        });
      }
    };
  }

  /**
   * Create optional authentication middleware (doesn't require token)
   */
  optionalAuth() {
    return this.authenticate({ requireAuth: false });
  }

  /**
   * Create admin-only authentication middleware
   */
  requireAdmin() {
    return this.authenticate({ requireRole: 'admin' });
  }

  /**
   * Create user or admin authentication middleware
   */
  requireUser() {
    return this.authenticate({ requireRole: 'user' });
  }

  /**
   * Get client identifier for rate limiting
   */
  private getClientId(req: Request): string {
    // Use IP address as client identifier
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  /**
   * Check if client is rate limited
   */
  private isRateLimited(clientId: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const clientData = this.rateLimitMap.get(clientId);

    if (!clientData) {
      return false;
    }

    // Reset if window has expired
    if (now > clientData.resetTime) {
      this.rateLimitMap.delete(clientId);
      return false;
    }

    return clientData.attempts >= maxAttempts;
  }

  /**
   * Record failed authentication attempt
   */
  private recordFailedAttempt(clientId: string): void {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const clientData = this.rateLimitMap.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      // Start new rate limit window
      this.rateLimitMap.set(clientId, {
        attempts: 1,
        resetTime: now + windowMs
      });
    } else {
      // Increment attempts in current window
      clientData.attempts++;
    }
  }

  /**
   * Reset rate limit for client
   */
  private resetRateLimit(clientId: string): void {
    this.rateLimitMap.delete(clientId);
  }

  /**
   * Get rate limit reset time
   */
  private getRateLimitResetTime(clientId: string): number {
    const clientData = this.rateLimitMap.get(clientId);
    return clientData ? Math.ceil((clientData.resetTime - Date.now()) / 1000) : 0;
  }

  /**
   * Check if request is for password change endpoint
   */
  private isPasswordChangeEndpoint(req: Request): boolean {
    const passwordChangeEndpoints = [
      '/api/auth/change-password',
      '/api/users/change-password'
    ];
    
    return passwordChangeEndpoints.some(endpoint => 
      req.path.includes(endpoint) || req.originalUrl.includes(endpoint)
    );
  }

  /**
   * Middleware to check token expiration and suggest refresh
   */
  checkTokenExpiration() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        const token = this.authService.extractTokenFromHeader(authHeader);

        if (token && this.authService.isTokenNearExpiration(token)) {
          // Add header to suggest token refresh
          res.setHeader('X-Token-Refresh-Suggested', 'true');
          
          const expiration = this.authService.getTokenExpiration(token);
          if (expiration) {
            res.setHeader('X-Token-Expires-At', expiration.toISOString());
          }
        }

        next();
      } catch (error) {
        // Don't fail the request if token expiration check fails
        next();
      }
    };
  }

  /**
   * Middleware to log authentication events for audit
   */
  auditLog() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Store original res.json to intercept response
      const originalJson = res.json;
      
      res.json = function(body: any) {
        // Log authentication events
        if (req.user) {
          console.log(`Auth Event: ${req.method} ${req.path} - User: ${req.user.username} (${req.user.role}) - IP: ${req.ip}`);
        } else if (req.path.includes('/auth/') || req.path.includes('/login')) {
          console.log(`Auth Attempt: ${req.method} ${req.path} - IP: ${req.ip} - Success: ${body.success || false}`);
        }
        
        return originalJson.call(this, body);
      };

      next();
    };
  }

  /**
   * Clean up expired rate limit entries (should be called periodically)
   */
  cleanupRateLimit(): void {
    const now = Date.now();
    
    for (const [clientId, data] of this.rateLimitMap.entries()) {
      if (now > data.resetTime) {
        this.rateLimitMap.delete(clientId);
      }
    }
  }

  /**
   * Get rate limit statistics
   */
  getRateLimitStats(): { totalClients: number; blockedClients: number } {
    const now = Date.now();
    let blockedClients = 0;
    
    for (const [, data] of this.rateLimitMap.entries()) {
      if (now <= data.resetTime && data.attempts >= 5) {
        blockedClients++;
      }
    }

    return {
      totalClients: this.rateLimitMap.size,
      blockedClients
    };
  }
}