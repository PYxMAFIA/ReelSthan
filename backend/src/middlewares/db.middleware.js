import connectDB, { isDbConnected } from '../DB/db.js';

async function ensureDbConnection(req, res, next) {
    if (isDbConnected()) {
        return next();
    }

    try {
        await connectDB();
        return next();
    } catch (error) {
        console.error('Database unavailable:', error.message);
        return res.status(503).json({
            success: false,
            message: 'Database unavailable. Please try again shortly.',
        });
    }
}

export default ensureDbConnection;
