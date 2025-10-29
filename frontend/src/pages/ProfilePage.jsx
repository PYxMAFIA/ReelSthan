import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Video, Eye, Heart, Camera, X } from 'lucide-react';
import api from '../lib/api.js';
import NavBar from '../components/NavBar.jsx';

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
      } catch (_) {}
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
    <div className="min-h-screen bg-black text-white pb-16 lg:pb-0 lg:pl-64">
      <header className="px-4 py-4 border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold">Profile</h1>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <section className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="relative">
            <div 
              onClick={handleAvatarClick}
              className="h-20 w-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-2xl font-semibold border-2 border-emerald-500/30 cursor-pointer group"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() || 'U'
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div>
            <div className="font-semibold text-lg">@{user?.username || 'user'}</div>
            <div className="text-white/70 text-sm">{user?.email}</div>
            {user?.bio && <div className="text-white/80 text-sm mt-1">{user.bio}</div>}
          </div>
        </section>

        <form onSubmit={onSave} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/90">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-20 transition-all" placeholder="Write your bio..." />
          </div>
          <div>
            <button disabled={saving} className="px-6 py-2.5 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-60 hover:bg-emerald-400 transition-colors">{saving ? 'Saving...' : 'Save profile'}</button>
          </div>
          {message && <div className={`text-sm px-4 py-2 rounded-lg ${message.type === 'error' ? 'text-red-300 bg-red-500/10 border border-red-500/20' : 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'}`}>{message.text}</div>}
        </form>

        <section className="pt-4 border-t border-white/10">
          <h2 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-400" />
            My Reels ({userReels.length})
          </h2>
          {loadingReels ? (
            <div className="text-white/60 text-sm py-8 text-center">Loading reels...</div>
          ) : userReels.length === 0 ? (
            <div className="text-white/60 text-sm py-8 text-center bg-white/5 rounded-lg border border-white/10">
              <Video className="w-12 h-12 mx-auto mb-2 text-white/30" />
              <p>You haven't uploaded any reels yet</p>
              <Link to="/upload" className="inline-block mt-3 text-emerald-400 hover:text-emerald-300 font-medium">
                Upload your first reel →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {userReels.map((reel) => (
                <Link
                  key={reel._id}
                  to={`/reels/creator/${user?.username}`}
                  className="relative aspect-square bg-black overflow-hidden group rounded-lg cursor-pointer border border-white/5 hover:border-emerald-500/30 transition-colors"
                >
                  <video
                    src={reel.videoUrl}
                    className="h-full w-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3 w-full">
                      <p className="text-white text-sm font-medium line-clamp-2 mb-2">{reel.title}</p>
                      <div className="flex items-center gap-3 text-white/80 text-xs">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {Array.isArray(reel.like) ? reel.like.length : 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {reel.views || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="pt-4 border-t border-white/10">
          <h2 className="font-semibold mb-3 text-lg">Saved reels</h2>
          <a href="/saved" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium">See all saved reels →</a>
        </section>
      </main>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAvatarModal(false)}>
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Profile Photo</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="h-40 w-40 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-4xl font-semibold border-2 border-emerald-500/30">
                {previewAvatar ? (
                  <img src={previewAvatar} alt="Preview" className="h-full w-full object-cover" />
                ) : user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Current avatar" className="h-full w-full object-cover" />
                ) : (
                  user?.username?.[0]?.toUpperCase() || 'U'
                )}
              </div>

              <div className="flex flex-col gap-3 w-full">
                <label className="w-full cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <div className="w-full px-6 py-3 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors text-center">
                    {previewAvatar ? 'Change Photo' : 'Upload Photo'}
                  </div>
                </label>

                {(previewAvatar || avatarFile) && (
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="w-full px-6 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  );
};

export default ProfilePage;
