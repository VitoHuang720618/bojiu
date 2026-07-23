/**
 * Authentication Service
 * Handles user authentication, JWT token generation and validation
 */
import jwt from 'jsonwebtoken';
export class AuthService {
    userService;
    jwtSecret;
    jwtExpiresIn;
    refreshExpiresIn;
    constructor(userService) {
        this.userService = userService;
        // JWT configuration - use environment variables or defaults
        this.jwtSecret = process.env.JWT_SECRET || 'b9-website-manager-secret-key-change-in-production';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
        this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        // Warn if using default secret in production
        if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
            console.warn('⚠️  WARNING: Using default JWT secret in production. Set JWT_SECRET environment variable.');
        }
    }
    /**
     * Authenticate user with username and password
     */
    async authenticate(loginData) {
        try {
            // Validate input
            if (!loginData.username || !loginData.password) {
                return {
                    success: false,
                    error: 'Username and password are required'
                };
            }
            // Verify user credentials
            const dbUser = await this.userService.verifyPassword(loginData.username, loginData.password);
            if (!dbUser) {
                return {
                    success: false,
                    error: 'Invalid username or password'
                };
            }
            // Check if user is active
            if (!dbUser.is_active) {
                return {
                    success: false,
                    error: 'Account is disabled'
                };
            }
            // Convert to User object
            const user = {
                id: dbUser.id,
                username: dbUser.username,
                email: dbUser.email,
                role: dbUser.role,
                isActive: Boolean(dbUser.is_active),
                mustChangePassword: Boolean(dbUser.must_change_password),
                createdAt: dbUser.created_at,
                updatedAt: dbUser.updated_at,
                lastLogin: dbUser.last_login || undefined
            };
            // Generate JWT token
            const token = this.generateToken(user);
            // Update last login timestamp
            await this.userService.updateLastLogin(user.id);
            return {
                success: true,
                user,
                token
            };
        }
        catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: 'Authentication failed'
            };
        }
    }
    /**
     * Generate JWT token for user
     */
    generateToken(user) {
        const payload = {
            sub: user.id.toString(),
            username: user.username,
            role: user.role
        };
        return jwt.sign(payload, this.jwtSecret, {
            algorithm: 'HS256',
            expiresIn: this.jwtExpiresIn
        });
    }
    /**
     * Generate refresh token for user
     */
    generateRefreshToken(user) {
        const payload = {
            sub: user.id.toString(),
            username: user.username,
            role: user.role
        };
        return jwt.sign(payload, this.jwtSecret, {
            algorithm: 'HS256',
            expiresIn: this.refreshExpiresIn
        });
    }
    /**
     * Validate JWT token and extract user information
     */
    async validateToken(token) {
        try {
            // Verify token signature and expiration
            const decoded = jwt.verify(token, this.jwtSecret, {
                algorithms: ['HS256']
            });
            // Get current user data from database
            const user = await this.userService.getUserById(parseInt(decoded.sub));
            if (!user) {
                return {
                    valid: false,
                    error: 'User not found'
                };
            }
            // Check if user is still active
            if (!user.isActive) {
                return {
                    valid: false,
                    error: 'Account is disabled'
                };
            }
            return {
                valid: true,
                user
            };
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return {
                    valid: false,
                    error: 'Token expired'
                };
            }
            else if (error instanceof jwt.JsonWebTokenError) {
                return {
                    valid: false,
                    error: 'Invalid token'
                };
            }
            else {
                console.error('Token validation error:', error);
                return {
                    valid: false,
                    error: 'Token validation failed'
                };
            }
        }
    }
    /**
     * Refresh JWT token
     */
    async refreshToken(refreshToken) {
        try {
            // Validate refresh token
            const validation = await this.validateToken(refreshToken);
            if (!validation.valid || !validation.user) {
                return {
                    success: false,
                    error: validation.error || 'Invalid refresh token'
                };
            }
            // Generate new tokens
            const newToken = this.generateToken(validation.user);
            const newRefreshToken = this.generateRefreshToken(validation.user);
            return {
                success: true,
                token: newToken,
                refreshToken: newRefreshToken
            };
        }
        catch (error) {
            console.error('Token refresh error:', error);
            return {
                success: false,
                error: 'Token refresh failed'
            };
        }
    }
    /**
     * Extract token from Authorization header
     */
    extractTokenFromHeader(authHeader) {
        if (!authHeader) {
            return null;
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        return parts[1];
    }
    /**
     * Validate password strength
     */
    validatePasswordStrength(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?])/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        if (password.length > 128) {
            errors.push('Password must be less than 128 characters');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Parse expiration time string to seconds
     */
    parseExpirationTime(expiresIn) {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) {
            throw new Error(`Invalid expiration time format: ${expiresIn}`);
        }
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 60 * 60 * 24;
            default: throw new Error(`Invalid time unit: ${unit}`);
        }
    }
    /**
     * Get token expiration time
     */
    getTokenExpiration(token) {
        try {
            const decoded = jwt.decode(token);
            if (!decoded || !decoded.exp) {
                return null;
            }
            return new Date(decoded.exp * 1000);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Check if token is near expiration (within 5 minutes)
     */
    isTokenNearExpiration(token) {
        const expiration = this.getTokenExpiration(token);
        if (!expiration) {
            return true; // Treat invalid tokens as expired
        }
        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
        return expiration <= fiveMinutesFromNow;
    }
}
//# sourceMappingURL=authService.js.map