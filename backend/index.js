import app from "./src/app.js";
import connectDB from "./src/DB/db.js"
connectDB();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});