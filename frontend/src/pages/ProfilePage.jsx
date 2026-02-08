import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Video, Eye, Heart, Camera, X, Settings, Edit3 } from 'lucide-react';
import api from '../lib/api.js';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [userReels, setUserReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/profile/me');
        if (data?.user) {
          setUser(data.user);
          setBio(data.user.bio || '');
          // Fetch user's reels
          fetchUserReels(data.user._id);
        }
      } catch (_) { }
    })();
  }, []);

  const fetchUserReels = async (userId) => {
    try {
      setLoadingReels(true);
      const { data } = await api.get('/reel', { params: { userId } });
      setUserReels(Array.isArray(data?.reels) ? data.reels : []);
    } catch (err) {
      console.error('Failed to fetch user reels:', err);
    } finally {
      setLoadingReels(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const form = new FormData();
      form.append('bio', bio || '');
      if (avatarFile) form.append('avatar', avatarFile);
      const { data } = await api.put('/auth/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(data?.user || user);
      setMessage({ type: 'success', text: 'Profile updated' });
      setAvatarFile(null);
      setPreviewAvatar(null);
      setShowAvatarModal(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
      // Even if API fails, redirect to login
      navigate('/login');
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white pb-24 md:pb-12">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />
      <div className="fixed top-20 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-4 md:pt-12">

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 mb-12">

          {/* Avatar */}
          <div className="relative group shrink-0">
            <div onClick={handleAvatarClick} className="w-28 h-28 md:w-36 md:h-36 rounded-full p-[2px] bg-gradient-to-tr from-zinc-700 to-zinc-800 cursor-pointer hover:from-emerald-500 hover:to-teal-500 transition-all duration-500">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-black relative bg-zinc-900">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-700 bg-zinc-900">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
                  <Camera className="w-8 h-8 text-white drop-shadow-lg transform scale-90 group-hover:scale-100 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Info & Stats */}
          <div className="flex-1 text-center md:text-left w-full max-w-lg">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-light text-white mb-1 tracking-tight">@{user?.username || 'user'}</h1>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-center md:justify-start gap-8 md:gap-12 mb-6">
              <div className="text-center md:text-left">
                <span className="block text-lg font-bold text-white">{userReels.length}</span>
                <span className="text-zinc-500 text-sm">posts</span>
              </div>
            </div>

            {/* Bio Editor */}
            <div className="text-center md:text-left">
              <div className="text-sm font-medium text-white mb-1">{user?.name || user?.username}</div>
              <form onSubmit={onSave} className="relative group inline-block w-full">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-transparent text-zinc-300 placeholder-zinc-600 outline-none resize-none transition-all text-sm leading-relaxed rounded-lg border border-transparent focus:border-white/10 focus:bg-white/5 p-1 -ml-1"
                  placeholder="Write a bio..."
                  rows={user?.bio && !saving ? 2 : 1}
                  spellCheck={false}
                />
                {/* Only show save button if bio changed? For now simple save button */}
                <div className="absolute right-0 bottom-0 opacity-0 group-focus-within:opacity-100 transition-opacity z-10">
                  <button
                    type="submit"
                    disabled={saving}
                    className="p-1.5 rounded-md bg-white text-black shadow-lg hover:scale-105 transition-transform"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              </form>
              {message && (
                <div className={`mt-2 text-xs ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex items-center justify-center border-t border-zinc-800 mb-1">
          <button className="flex items-center gap-2 px-12 py-3 border-t border-white text-white font-medium text-xs tracking-widest uppercase -mt-px">
            <Video className="w-3 h-3" />
            <span>Reels</span>
          </button>
          <button className="flex items-center gap-2 px-12 py-3 border-t border-transparent text-zinc-500 font-medium text-xs tracking-widest uppercase -mt-px hover:text-zinc-300 transition-colors cursor-not-allowed">
            <Heart className="w-3 h-3" />
            <span>Saved</span>
          </button>
        </div>

        {/* Reels Grid */}
        {loadingReels ? (
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[9/16] bg-zinc-900 animate-pulse"></div>
            ))}
          </div>
        ) : userReels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-zinc-800 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Share Photos</h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-xs">When you share photos, they will appear on your profile.</p>
            <Link to="/upload" className="text-blue-500 font-medium text-sm hover:text-white transition-colors">
              Share your first photo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 pb-20">
            {userReels.map((reel) => (
              <Link
                key={reel._id}
                to={`/reels/creator/${user?.username}`}
                className="relative aspect-[9/16] bg-zinc-900 group cursor-pointer overflow-hidden"
              >
                <video
                  src={reel.videoUrl}
                  className="h-full w-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1 text-white font-bold">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{Array.isArray(reel.like) ? reel.like.length : 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white font-bold">
                    <Eye className="w-4 h-4 fill-white" />
                    <span>{reel.views || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8 animate-in fade-in duration-200" onClick={() => setShowAvatarModal(false)}>
          <div className="bg-zinc-900 rounded-xl max-w-sm w-full divide-y divide-zinc-700 overflow-hidden shadow-2xl scale-100 transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">

              <div className="w-20 h-20 rounded-full bg-zinc-800 mx-auto mb-4 overflow-hidden">
                {previewAvatar ? (
                  <img src={previewAvatar} alt="Preview" className="h-full w-full object-cover" />
                ) : user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Current avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-zinc-600">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <h3 className="text-lg font-normal text-white mb-1">Change Profile Photo</h3>
            </div>

            <label className="block w-full p-3 text-center text-sm font-bold text-blue-500 hover:bg-zinc-800 cursor-pointer transition-colors border-t border-zinc-700">
              Upload Photo
              <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
            </label>

            {(previewAvatar) && (
              <button onClick={onSave} className="block w-full p-3 text-center text-sm font-bold text-blue-500 hover:bg-zinc-800 cursor-pointer transition-colors border-t border-zinc-700">
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}

            {(user?.avatarUrl && !previewAvatar) && (
              <button className="block w-full p-3 text-center text-sm font-bold text-red-500 hover:bg-zinc-800 cursor-pointer transition-colors border-t border-zinc-700">
                Remove Current Photo
              </button>
            )}

            <button onClick={() => setShowAvatarModal(false)} className="block w-full p-3 text-center text-sm text-white hover:bg-zinc-800 cursor-pointer transition-colors border-t border-zinc-700">
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
