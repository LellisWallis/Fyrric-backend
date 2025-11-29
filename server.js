require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/v1/auth', require('./routes/user-auth'));
app.use('/api/v1/leaderboard', require('./routes/leaderboard'));
app.use('/api/v1/matchmaking', require('./routes/matchmaking'));
app.use('/api/v1/saves', require('./routes/saves'));
app.use('/api/v1/analytics', require('./routes/analytics'));

// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'GameCore API',
        version: '1.0.0',
        documentation: 'https://docs.gamecore.io',
        endpoints: {
            auth: '/api/v1/auth',
            leaderboard: '/api/v1/leaderboard',
            matchmaking: '/api/v1/matchmaking',
            saves: '/api/v1/saves',
            analytics: '/api/v1/analytics'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
async function start() {
    try {
        // Initialize database
        await initializeDatabase();
        
        // Start listening
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║         GameCore API Server           ║
║                                       ║
║  🚀 Server running on port ${PORT}       ║
║  📊 Database connected                ║
║  ✅ All systems operational           ║
║                                       ║
╚═══════════════════════════════════════╝
            `);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`API Docs: http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start the server
start();
