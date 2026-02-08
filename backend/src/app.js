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
		if (!origin) return callback(null, true);
		if (allowedOrigins.indexOf(origin) === -1) {
			const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
			return callback(new Error(msg), false);
		}
		return callback(null, true);
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