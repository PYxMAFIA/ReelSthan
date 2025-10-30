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
app.use(cors({
	origin: ['http://localhost:5173', 'https://reelsthan.netlify.app'],
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