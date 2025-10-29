import userModel from '../models/user.model.js';
import reelModel from '../models/reel.model.js';
import mongoose from 'mongoose';
import { uploadImage } from '../config/services/storage.service.js';

async function uploadReel(req, res) {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please login." });
        }

        const original = req.file?.originalname || 'file';
        const baseTitle = req.body.title || 'reel';
        const safeName = `${baseTitle}-${Date.now()}-${original}`;
        const fileResponse = await uploadImage(req.file.buffer, safeName);
        console.log("Image uploaded successfully:", fileResponse);

        // Get the user to store username properly
        const user = await userModel.findById(req.userId);
        
        const newReel = new reelModel({
            title: req.body.title,
            description: req.body.description,
            videoUrl: fileResponse.url,
            uploadedBy: req.userId,
            user: req.userId
        });
        await newReel.save();

        // Return the reel data with username
        const reelData = {
            ...newReel.toObject(),
            uploadedByUsername: user?.username || req.userId
        };

        res.status(201).json({
            success: true,
            message: "Reel uploaded successfully",
            reel: reelData
        });
        console.log("New reel created:", newReel._id);
    } catch (error) {
        console.error("Upload reel error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload reel"
        });
    }
}

async function getReel(req, res) {
    try {
        const { username, userId } = req.query;
        let filter = {};

        if (username) {
            const user = await userModel.findOne({ username });
            if (!user) {
                return res.status(200).json({ success: true, message: "No reels for user", reels: [] });
            }
            // uploadedBy stores the uploader id (string) and there is an optional user ObjectId field
            filter = {
                $or: [
                    { uploadedBy: String(user._id) },
                    { uploadedBy: username },
                    { user: user._id }
                ]
            };
        } else if (userId) {
            filter = { $or: [{ uploadedBy: String(userId) }, { user: userId }] };
        }

        // Populate the optional `user` ref for username, and return lean objects for processing
        const rawReels = await reelModel
            .find(filter)
            .sort({ _id: -1 })
            .populate('user', 'username')
            .lean();

        // Build lookup sets for missing usernames
        const idSet = new Set();
        const nameSet = new Set();
        for (const r of rawReels) {
            // If populated user exists, we already have username
            if (r.user && typeof r.user === 'object' && r.user.username) continue;
            const ub = r.uploadedBy;
            if (typeof ub === 'string') {
                if (mongoose.Types.ObjectId.isValid(ub)) {
                    idSet.add(ub);
                } else {
                    // Could be a legacy username stored directly
                    nameSet.add(ub);
                }
            }
        }

        const [usersById, usersByName] = await Promise.all([
            idSet.size
                ? userModel.find({ _id: { $in: Array.from(idSet) } }, 'username').lean()
                : Promise.resolve([]),
            nameSet.size
                ? userModel.find({ username: { $in: Array.from(nameSet) } }, 'username').lean()
                : Promise.resolve([]),
        ]);

        const idToUsername = new Map(usersById.map((u) => [String(u._id), u.username]));
        const nameToUsername = new Map(usersByName.map((u) => [u.username, u.username]));

        const reels = rawReels.map((r) => {
            let uploadedByUsername = null;
            if (r.user && typeof r.user === 'object' && r.user.username) {
                uploadedByUsername = r.user.username;
            } else if (typeof r.uploadedBy === 'string') {
                if (idToUsername.has(r.uploadedBy)) {
                    uploadedByUsername = idToUsername.get(r.uploadedBy);
                } else if (nameToUsername.has(r.uploadedBy)) {
                    uploadedByUsername = nameToUsername.get(r.uploadedBy);
                } else if (!mongoose.Types.ObjectId.isValid(r.uploadedBy)) {
                    // If it's not an ObjectId, treat as username string
                    uploadedByUsername = r.uploadedBy;
                }
            }
            return { ...r, uploadedByUsername };
        });

        res.status(200).json({
            success: true,
            message: "Reels fetched successfully",
            reels,
        });
    } catch (error) {
        console.error("Error fetching reels:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reels"
        });
    }
}

export default { uploadReel, getReel };

// New handlers for like and comments
export async function toggleLike(req, res) {
    try {
        const { id } = req.params;
        const userId = req.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const reel = await reelModel.findById(id);
        if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });

        const idx = reel.like.findIndex((u) => String(u) === String(userId));
        let liked;
        if (idx >= 0) {
            reel.like.splice(idx, 1);
            liked = false;
        } else {
            reel.like.push(String(userId));
            liked = true;
        }
        await reel.save();
        return res.status(200).json({ success: true, liked, likesCount: reel.like.length });
    } catch (err) {
        console.error('toggleLike error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function addComment(req, res) {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { text } = req.body || {};
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (!text || !String(text).trim()) return res.status(400).json({ success: false, message: 'Comment text is required' });

        const reel = await reelModel.findById(id);
        if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });

        const comment = { user: String(userId), text: String(text).trim(), createdAt: new Date() };
        reel.comments.push(comment);
        await reel.save();
        return res.status(201).json({ success: true, message: 'Comment added', comment, commentsCount: reel.comments.length });
    } catch (err) {
        console.error('addComment error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function getComments(req, res) {
    try {
        const { id } = req.params;
        const reel = await reelModel.findById(id, 'comments').lean();
        if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });
        const comments = Array.isArray(reel.comments) ? reel.comments : [];
        // Enrich with usernames when possible
        const userIds = [...new Set(comments.map(c => String(c.user)).filter(Boolean))];
        const users = userIds.length ? await userModel.find({ _id: { $in: userIds } }, 'username').lean() : [];
        const idToUsername = new Map(users.map(u => [String(u._id), u.username]));
        const enriched = comments
            .map(c => ({ ...c, username: idToUsername.get(String(c.user)) || String(c.user) }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return res.status(200).json({ success: true, comments: enriched });
    } catch (err) {
        console.error('getComments error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function getSavedReels(req, res) {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        // Find reels saved by user and reuse the enrichment logic similar to getReel
        const rawReels = await reelModel
            .find({ saves: String(userId) })
            .sort({ _id: -1 })
            .populate('user', 'username')
            .lean();

        const idSet = new Set();
        const nameSet = new Set();
        for (const r of rawReels) {
            if (r.user && typeof r.user === 'object' && r.user.username) continue;
            const ub = r.uploadedBy;
            if (typeof ub === 'string') {
                if (mongoose.Types.ObjectId.isValid(ub)) idSet.add(ub); else nameSet.add(ub);
            }
        }
        const [usersById, usersByName] = await Promise.all([
            idSet.size ? userModel.find({ _id: { $in: Array.from(idSet) } }, 'username').lean() : Promise.resolve([]),
            nameSet.size ? userModel.find({ username: { $in: Array.from(nameSet) } }, 'username').lean() : Promise.resolve([]),
        ]);
        const idToUsername = new Map(usersById.map((u) => [String(u._id), u.username]));
        const nameToUsername = new Map(usersByName.map((u) => [u.username, u.username]));
        const reels = rawReels.map((r) => {
            let uploadedByUsername = null;
            if (r.user && typeof r.user === 'object' && r.user.username) uploadedByUsername = r.user.username;
            else if (typeof r.uploadedBy === 'string') {
                if (idToUsername.has(r.uploadedBy)) uploadedByUsername = idToUsername.get(r.uploadedBy);
                else if (nameToUsername.has(r.uploadedBy)) uploadedByUsername = nameToUsername.get(r.uploadedBy);
                else if (!mongoose.Types.ObjectId.isValid(r.uploadedBy)) uploadedByUsername = r.uploadedBy;
            }
            return { ...r, uploadedByUsername };
        });
        return res.status(200).json({ success: true, reels });
    } catch (err) {
        console.error('getSavedReels error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function saveReel(req, res) {
    try {
        const { id } = req.params;
        const userId = req.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const reel = await reelModel.findById(id);
        if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });

        if (!Array.isArray(reel.saves)) reel.saves = [];
        const idx = reel.saves.findIndex((u) => String(u) === String(userId));
        let saved;
        if (idx >= 0) {
            reel.saves.splice(idx, 1);
            saved = false;
        } else {
            reel.saves.push(String(userId));
            saved = true;
        }
        await reel.save();
        return res.status(200).json({ success: true, saved, savesCount: reel.saves.length });
    } catch (err) {
        console.error('saveReel error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function shareReel(req, res) {
    try {
        const { id } = req.params;
        const reel = await reelModel.findById(id);
        if (!reel) return res.status(404).json({ success: false, message: 'Reel not found' });
        reel.shareCount = (reel.shareCount || 0) + 1;
        await reel.save();
        return res.status(200).json({ success: true, shareCount: reel.shareCount });
    } catch (err) {
        console.error('shareReel error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}