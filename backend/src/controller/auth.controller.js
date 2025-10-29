import userModel from "../models/user.model.js";
import { uploadImage } from "../config/services/storage.service.js";
import crypto from 'crypto'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendForgetPasswordEmail, sendResetPasswordEmail, sendVerificationEmail, sendWelcomeEmail } from "../config/email.config.js";

async function registryUser(req, res) {
    const { name, username, email, password } = req.body;

    try {
        if (!name || !email || !password || !username) {
            throw new Error("Please fill all the fields");
        }

        const isUserExist = await userModel.findOne({ email: email })
        if (isUserExist) {
            return res.status(400).json({ message: "User Already Exists" })
        }

        const hashPassword = await bcrypt.hash(password, 10);
        // generate a 6-digit token
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await userModel.create({
            name,
            username,
            email,
            password: hashPassword,
            verificationToken,
            verificationTokenExpired: Date.now() + 24 * 60 * 60 * 1000 //24 hour
        })

        const token = jwt.sign({
            _id: user._id,
        }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        })

        // await sendVerificationEmail(user.email, verificationToken)
        await sendWelcomeEmail(user.email, user.name);


        res.status(201).json({
            success: true,
            message: "User registry successfully",
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


async function loginUser(req, res) {
    try {
        const { email, username, password } = req.body;

        // Require either email or username, plus password
        if ((!email && !username) || !password) {
            return res.status(400).json({ message: "Email or username and password are required" });
        }

        // Find the user by whichever identifier was provided
        const or = [];
        if (email) or.push({ email });
        if (username) or.push({ username });

        const user = await userModel
            .findOne(or.length === 1 ? or[0] : { $or: or })
            .select("+password");

        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: "Invalid email/username or password" });
        }

        const isSamePassword = await bcrypt.compare(password, user.password);
        if (!isSamePassword) {
            return res.status(401).json({ success: false, message: "Invalid email/username or password" });
        }

        // Update lastLogin without blocking the response
        try {
            user.lastLogin = Date.now();
            await user.save();
        } catch (err) {
            console.error('Failed to update lastLogin for user', user._id, err);
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "User Login Successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("loginUser error", err);
        return res.status(500).json({ message: "Server error" });
    }
}

async function forgetPassword(req, res) {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetExpired = Date.now() + 1 * 60 * 60 * 1000; //1 hour

        user.resetPasswordToken = resetToken
        user.resetPasswordExpired = resetExpired

        await user.save();

        try {
            // Use FRONTEND_URL instead of BACKEND_URL for the reset link
            const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
            const response = await sendForgetPasswordEmail(
                user.email,
                resetURL
            );
            console.log('Reset email sent', response);
        } catch (err) {
            console.error('Failed to send reset email', err);
            // decide whether to fail the request or still return success to avoid user enumeration
            return res.status(500).json({ success: false, message: "Failed to send reset email" });
        }
        return res.status(200).json({
            success: true,
            message: "Reset Email sent successfully"
        });
    } catch (error) {
        console.error('forgetPassword error', error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

async function resetPassword(req, res) {
    try {
        const { token } = req.params
        const { password } = req.body

        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpired: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpired = undefined;
        await user.save();

        await sendResetPasswordEmail(user.email);

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error('resetPassword error', error);
        return res.status(500).json({ success: false, message: "resetPassword error" });
    }
}

async function checkAuth(req, res) {
    try {
        const user = await userModel.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('checkAuth error', error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

function logoutUser(req, res) {
    res.clearCookie("token");
    return res.status(200).json({
        success: true,
        message: "User logout Successfully"
    })
}





export default { registryUser, loginUser, logoutUser, forgetPassword, resetPassword , checkAuth };

export async function getMyProfile(req, res) {
    try {
        const user = await userModel.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        return res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('getMyProfile error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function updateMyProfile(req, res) {
    try {
        const user = await userModel.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { bio } = req.body || {};
        if (typeof bio === 'string') user.bio = bio;

        if (req.file && req.file.buffer) {
            const upload = await uploadImage(req.file.buffer, `avatar-${user._id}`);
            user.avatarUrl = upload.url;
        }

        await user.save();
        const plain = user.toObject();
        delete plain.password;
        return res.status(200).json({ success: true, message: 'Profile updated', user: plain });
    } catch (err) {
        console.error('updateMyProfile error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}