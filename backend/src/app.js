import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authrouter from './routes/auth.routes.js';
import reelrouter from './routes/reel.routes.js';
import creator from './routes/creator.routes.js';
import searchRouter from './routes/search.routes.js';
import { getBooleanEnv, getListEnv } from './config/env.js';


const app = express();

// Temporary debugging mode can allow any origin when CORS_ALLOW_ALL=true
const allowAllCorsOrigins = getBooleanEnv('CORS_ALLOW_ALL', true);
const normalizeOrigin = (value) => value.replace(/\/+$/, '');
const allowedOrigins = getListEnv('CORS_ORIGINS').map(normalizeOrigin);

app.use(cors({
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		const normalizedOrigin = normalizeOrigin(origin);

		if (allowAllCorsOrigins) {
			return callback(null, true);
		}

		if (allowedOrigins.indexOf(normalizedOrigin) !== -1) {
			return callback(null, true);
		}

		console.warn('CORS Blocked Origin:', origin);
		const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
		return callback(new Error(msg), false);
	},
	credentials: true
}));

app.get('/', (req, res) => {
	res.send('Reelsthan API is running');
});

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
