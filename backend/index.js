import 'dotenv/config';
import app from "./src/app.js";
import connectDB from "./src/DB/db.js";

const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';

async function startServer() {
    try {
        await connectDB();
        app.listen(port, host, () => {
            console.log(`Server started on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
