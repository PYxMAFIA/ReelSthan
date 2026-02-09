import cookieParser from 'cookie-parser';
import { configDotenv } from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authrouter from './routes/auth.routes.js';
import reelrouter from './routes/reel.routes.js';
import creator from './routes/creator.routes.js';
import searchRouter from './routes/search.routes.js';

configDotenv();

const app = express();

// CORS must be registered before any routes so preflight and headers work
const allowedOrigins = [
	'http://localhost:5173',
	'https://reelsthan.onrender.com',
	'https://reel-sthan.vercel.app'
];

app.use(cors({
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		// Check against allowed origins list
		if (allowedOrigins.indexOf(origin) !== -1) {
			return callback(null, true);
		}

		// Check for Vercel deployments (preview or production)
		if (origin.endsWith('.vercel.app')) {
			return callback(null, true);
		}

		const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
		return callback(new Error(msg), false);
	},
	credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Serve uploaded files when using local storage fallback
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use("/api/auth", authrouter);
app.use("/api/reel", reelrouter);
app.use("/api/creator", creator);
app.use('/api/search', searchRouter);

export default app;