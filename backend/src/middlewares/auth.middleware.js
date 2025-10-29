import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';

async function userMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Please login First" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // const user = await userModel.findById(decoded.id);

        req.userId = decoded._id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid Token, Please login again" });
    }
}

export default userMiddleware;