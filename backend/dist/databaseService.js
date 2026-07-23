/**
 * Database Service
 * Handles SQLite database operations and schema management for user management
 */
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
export class DatabaseService {
    db = null;
    dbPath;
    constructor(dbPath) {
        // Default to /app/data/users.db for container deployment
        this.dbPath = dbPath || process.env.USER_DB_PATH || path.join(process.env.CONFIG_PATH || '/app/data', 'users.db');
    }
    /**
     * Initialize database connection and create schema if needed
     */
    async initializeDatabase() {
        try {
            // Ensure directory exists
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
                console.log(`Created database directory: ${dbDir}`);
            }
            // Create database connection
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    throw err;
                }
                console.log(`Connected to SQLite database at: ${this.dbPath}`);
            });
            // Enable foreign keys and WAL mode for better performance
            await this.run('PRAGMA foreign_keys = ON');
            await this.run('PRAGMA journal_mode = WAL');
            // Create schema if it doesn't exist
            await this.createSchema();
            console.log('Database initialization completed successfully');
        }
        catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }
    /**
     * Create database schema
     */
    async createSchema() {
        const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        is_active BOOLEAN DEFAULT 1,
        must_change_password BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `;
        const createUsersIndexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
            'CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)'
        ];
        // Create audit log table for user management operations
        const createAuditTable = `
      CREATE TABLE IF NOT EXISTS user_audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action VARCHAR(50) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;
        const createAuditIndexes = [
            'CREATE INDEX IF NOT EXISTS idx_audit_user_id ON user_audit_log(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_audit_action ON user_audit_log(action)',
            'CREATE INDEX IF NOT EXISTS idx_audit_created_at ON user_audit_log(created_at)'
        ];
        try {
            // Create tables
            await this.run(createUsersTable);
            await this.run(createAuditTable);
            // Create indexes
            for (const indexQuery of [...createUsersIndexes, ...createAuditIndexes]) {
                await this.run(indexQuery);
            }
            console.log('Database schema created successfully');
        }
        catch (error) {
            console.error('Error creating database schema:', error);
            throw error;
        }
    }
    /**
     * Validate database integrity
     */
    async validateIntegrity() {
        try {
            // Check if required tables exist
            const tables = await this.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('users', 'user_audit_log')
      `);
            if (tables.length !== 2) {
                console.error('Database integrity check failed: Missing required tables');
                return false;
            }
            // Check if users table has correct structure
            const userColumns = await this.all('PRAGMA table_info(users)');
            const requiredColumns = ['id', 'username', 'email', 'password_hash', 'role', 'is_active'];
            for (const col of requiredColumns) {
                if (!userColumns.find((c) => c.name === col)) {
                    console.error(`Database integrity check failed: Missing column ${col} in users table`);
                    return false;
                }
            }
            console.log('Database integrity validation passed');
            return true;
        }
        catch (error) {
            console.error('Database integrity validation failed:', error);
            return false;
        }
    }
    /**
     * Create a new user
     */
    async createUser(userData) {
        const query = `
      INSERT INTO users (username, email, password_hash, role, must_change_password)
      VALUES (?, ?, ?, ?, ?)
    `;
        try {
            const result = await this.run(query, [
                userData.username,
                userData.email,
                userData.passwordHash,
                userData.role || 'user',
                userData.mustChangePassword ? 1 : 0
            ]);
            const userId = result.lastID;
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error('Failed to retrieve created user');
            }
            console.log(`User created successfully: ${userData.username} (ID: ${userId})`);
            return user;
        }
        catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(id) {
        const query = 'SELECT * FROM users WHERE id = ?';
        try {
            const user = await this.get(query, [id]);
            return user || null;
        }
        catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }
    /**
     * Get user by username
     */
    async getUserByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = ? AND is_active = 1';
        try {
            const user = await this.get(query, [username]);
            return user || null;
        }
        catch (error) {
            console.error('Error getting user by username:', error);
            throw error;
        }
    }
    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
        try {
            const user = await this.get(query, [email]);
            return user || null;
        }
        catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }
    /**
     * Update user information
     */
    async updateUser(id, userData) {
        const updates = [];
        const values = [];
        if (userData.username !== undefined) {
            updates.push('username = ?');
            values.push(userData.username);
        }
        if (userData.email !== undefined) {
            updates.push('email = ?');
            values.push(userData.email);
        }
        if (userData.passwordHash !== undefined) {
            updates.push('password_hash = ?');
            values.push(userData.passwordHash);
        }
        if (userData.role !== undefined) {
            updates.push('role = ?');
            values.push(userData.role);
        }
        if (userData.isActive !== undefined) {
            updates.push('is_active = ?');
            values.push(userData.isActive ? 1 : 0);
        }
        if (userData.mustChangePassword !== undefined) {
            updates.push('must_change_password = ?');
            values.push(userData.mustChangePassword ? 1 : 0);
        }
        // Always update the updated_at timestamp
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        try {
            await this.run(query, values);
            const user = await this.getUserById(id);
            if (!user) {
                throw new Error('User not found after update');
            }
            console.log(`User updated successfully: ID ${id}`);
            return user;
        }
        catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    /**
     * Delete user
     */
    async deleteUser(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        try {
            const result = await this.run(query, [id]);
            const deleted = result.changes > 0;
            if (deleted) {
                console.log(`User deleted successfully: ID ${id}`);
            }
            return deleted;
        }
        catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
    /**
     * List all users (without password hashes)
     */
    async listUsers() {
        const query = 'SELECT * FROM users ORDER BY created_at DESC';
        try {
            const users = await this.all(query);
            return users;
        }
        catch (error) {
            console.error('Error listing users:', error);
            throw error;
        }
    }
    /**
     * Count users by role
     */
    async countUsersByRole(role) {
        const query = 'SELECT COUNT(*) as count FROM users WHERE role = ? AND is_active = 1';
        try {
            const result = await this.get(query, [role]);
            return result.count;
        }
        catch (error) {
            console.error('Error counting users by role:', error);
            throw error;
        }
    }
    /**
     * Update last login timestamp
     */
    async updateLastLogin(id) {
        const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
        try {
            await this.run(query, [id]);
        }
        catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }
    /**
     * Log user management operation for audit
     */
    async logAuditEvent(userId, action, details, ipAddress, userAgent) {
        const query = `
      INSERT INTO user_audit_log (user_id, action, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `;
        try {
            await this.run(query, [userId, action, details, ipAddress, userAgent]);
        }
        catch (error) {
            console.error('Error logging audit event:', error);
            // Don't throw error for audit logging failures
        }
    }
    /**
     * Close database connection
     */
    async close() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                        reject(err);
                    }
                    else {
                        console.log('Database connection closed');
                        this.db = null;
                        resolve();
                    }
                });
            });
        }
    }
    // Helper methods to promisify sqlite3 operations
    async run(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this);
                }
            });
        });
    }
    async get(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    async all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
}
//# sourceMappingURL=databaseService.js.map