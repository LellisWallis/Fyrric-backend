const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { query } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Generate API key
function generateApiKey() {
    return `gc_${process.env.NODE_ENV === 'production' ? 'live' : 'test'}_${uuidv4().replace(/-/g, '')}`;
}

// Hash password
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email,
            username: user.username 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Verify JWT token
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Middleware: Authenticate user via JWT
function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    next();
}

// Middleware: Authenticate API key
async function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }

    try {
        const result = await query(
            'SELECT * FROM api_keys WHERE key = $1 AND is_active = true',
            [apiKey]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        req.apiKey = result.rows[0];
        
        // Track usage
        await trackUsage(req.apiKey.id, req.path);
        
        next();
    } catch (error) {
        console.error('API key authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

// Track API usage
async function trackUsage(apiKeyId, endpoint) {
    try {
        await query(
            `INSERT INTO usage_stats (api_key_id, endpoint, calls_count, date)
             VALUES ($1, $2, 1, CURRENT_DATE)
             ON CONFLICT (api_key_id, endpoint, date)
             DO UPDATE SET calls_count = usage_stats.calls_count + 1`,
            [apiKeyId, endpoint]
        );
    } catch (error) {
        console.error('Usage tracking error:', error);
    }
}

module.exports = {
    generateApiKey,
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    authenticateUser,
    authenticateApiKey
};
