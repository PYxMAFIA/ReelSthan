import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authrouter from './routes/auth.routes.js';
import reelrouter from './routes/reel.routes.js';
import creator from './routes/creator.routes.js';
import searchRouter from './routes/search.routes.js';


const app = express();

// CORS must be registered before any routes so preflight and headers work
const allowedOrigins = [
	'http://localhost:5173',
	'https://reelsthan.onrender.com',
	'https://reelsthan.netlify.app',
	'https://reel-sthan-w7qj.vercel.app',
	process.env.FRONTEND_URL
];

app.use(cors({
	origin: function (origin, callback) {
		console.log('Request Origin:', origin); // Debug log

		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		// Check against allowed origins list
		if (allowedOrigins.indexOf(origin) !== -1) {
			return callback(null, true);
		}

		// Check for Vercel and Netlify deployments (preview or production)
		if (origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
			return callback(null, true);
		}

		console.warn('CORS Blocked Origin:', origin);
		const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
		return callback(new Error(msg), false);
	},
	credentials: true
}));

// Request logger for debugging 404/401 issues
app.use((req, res, next) => {
	console.log(`[API REQUEST]: ${req.method} ${req.url}`);
	next();
});

app.use(cookieParser());
app.use(express.json());

// Serve uploaded files when using local storage fallback
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use("/api/auth", authrouter);
app.use("/api/reel", reelrouter);
app.use("/api/creator", creator);
app.use('/api/search', searchRouter);

export default app;