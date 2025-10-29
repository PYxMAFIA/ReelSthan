import userModel from '../models/user.model.js';
import reelModel from '../models/reel.model.js';
import mongoose from 'mongoose';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function searchAll(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.status(200).json({ success: true, users: [], reels: [] });
    }
    const re = new RegExp(escapeRegExp(q), 'i');

    const [users, rawReels] = await Promise.all([
      userModel
        .find({ $or: [{ username: re }, { name: re }, { email: re }] })
        .select('username name avatarUrl')
        .limit(20)
        .lean(),
      reelModel
        .find({ $or: [{ title: re }, { description: re }] })
        .sort({ _id: -1 })
        .limit(20)
        .populate('user', 'username')
        .lean(),
    ]);

    // Enrich reels with uploadedByUsername similar to getReel
    const idSet = new Set();
    const nameSet = new Set();
    for (const r of rawReels) {
      if (r.user && r.user.username) continue;
      const ub = r.uploadedBy;
      if (typeof ub === 'string') {
        if (mongoose.Types.ObjectId.isValid(ub)) idSet.add(ub);
        else nameSet.add(ub);
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
      if (r.user && r.user.username) uploadedByUsername = r.user.username;
      else if (typeof r.uploadedBy === 'string') {
        if (idToUsername.has(r.uploadedBy)) uploadedByUsername = idToUsername.get(r.uploadedBy);
        else if (nameToUsername.has(r.uploadedBy)) uploadedByUsername = nameToUsername.get(r.uploadedBy);
        else if (!mongoose.Types.ObjectId.isValid(r.uploadedBy)) uploadedByUsername = r.uploadedBy;
      }
      return { _id: r._id, title: r.title, description: r.description, videoUrl: r.videoUrl, uploadedByUsername };
    });

    return res.status(200).json({ success: true, users, reels });
  } catch (err) {
    console.error('searchAll error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
