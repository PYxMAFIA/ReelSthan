import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DUMMY_REELS } from '../data/reels.js';
import api from '../lib/api.js';
import NavBar from '../components/NavBar.jsx';

const CreatorPage = () => {
  const { username } = useParams();
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [displayReels, setDisplayReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [uRes, rRes] = await Promise.allSettled([
          api.get(`/auth/user/${username}`),
          api.get('/reel', { params: { username } }),
        ]);

        if (!mounted) return;

        if (uRes.status === 'fulfilled') {
          setCreatorProfile(uRes.value.data.user || { username });
        } else {
          setCreatorProfile({ username });
        }

        let reels = [];
        if (rRes.status === 'fulfilled') {
          reels = Array.isArray(rRes.value.data?.reels) ? rRes.value.data.reels : [];
        }

        if (!reels.length) {
          const matched = DUMMY_REELS.filter(
            (r) => (r.uploadedBy?.username || '').toLowerCase() === String(username).toLowerCase()
          );
          setDisplayReels(matched.length ? matched : DUMMY_REELS.slice(0, 6));
        } else {
          setDisplayReels(reels);
        }
      } catch (err) {
        console.error('CreatorPage fetch error', err);
        const matched = DUMMY_REELS.filter(
          (r) => (r.uploadedBy?.username || '').toLowerCase() === String(username).toLowerCase()
        );
        setCreatorProfile({ username });
        setDisplayReels(matched.length ? matched : DUMMY_REELS.slice(0, 6));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [username]);

  const postsCount = displayReels.length;
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="inline-flex items-center gap-2">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16 lg:pb-0 lg:pl-64">
      <header className="px-4 py-4 border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold">@{creatorProfile?.username || username}</h1>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-6 sm:gap-10 mb-8">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-white/10 flex items-center justify-center text-3xl font-semibold border-2 border-emerald-500/30">
            {creatorProfile?.avatarUrl ? (
              <img src={creatorProfile.avatarUrl} alt="avatar" className="h-full w-full object-cover rounded-full" />
            ) : (
              creatorProfile?.name?.[0]?.toUpperCase() || (creatorProfile?.username || username)?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">@{creatorProfile?.username || username}</h1>
            </div>

            <div className="flex gap-6 text-sm text-white/90 mb-3">
              <div>
                <span className="font-semibold">{postsCount}</span> posts
              </div>
            </div>

            {creatorProfile?.bio && (
              <div className="text-white/80 text-sm">
                {creatorProfile.bio}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 mb-6" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
          {displayReels.map((r, i) => {
            const creatorName = r.uploadedBy?.username || (creatorProfile?.username || username);
            return (
              <div
                key={r._id || i}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/reels/creator/${creatorName}`, { state: { startIndex: i } })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/reels/creator/${creatorName}`, { state: { startIndex: i } });
                  }
                }}
                className="relative aspect-square bg-black overflow-hidden group rounded-lg cursor-pointer border border-white/5 hover:border-emerald-500/30 transition-colors"
              >
                <video
                  src={r.videoUrl}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                  onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                  <div className="p-3 text-sm w-full text-white font-medium">{r.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <NavBar />
    </div>
  );
};

export default CreatorPage;
