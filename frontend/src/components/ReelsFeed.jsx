import React, { useEffect, useState, useRef } from 'react';
import Reel from './Reel.jsx';
import api from '../lib/api.js';
import { DUMMY_REELS } from '../data/reels.js';
import { Loader } from 'lucide-react';
import { ReelAudioProvider } from '../context/ReelAudioContext.jsx';

const ReelsFeed = ({ username, startIndex, savedOnly }) => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mainRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const fetchReels = async () => {
    setLoading(true);
    try {
      let data;
      if (savedOnly) {
        ({ data } = await api.get('/reel/saved/me'));
      } else if (username) {
        ({ data } = await api.get('/reel', { params: { username } }));
      } else {
        ({ data } = await api.get('/reel'));
      }
      const items = Array.isArray(data?.reels) ? data.reels : [];
      if (items.length > 0) {
        setReels(username || savedOnly ? items : shuffle(items));
      } else {
        setReels(username || savedOnly ? DUMMY_REELS : shuffle(DUMMY_REELS));
      }
      setError(null);
    } catch (err) {
      // Fallback to dummy data if API fails
      // If we have a username, try to show only matching dummy reels
      if (username) {
        const matched = DUMMY_REELS.filter(
          (r) => (r.uploadedBy?.username || '').toLowerCase() === String(username).toLowerCase()
        );
        setReels(matched.length ? matched : DUMMY_REELS.slice(0, 6));
      } else if (savedOnly) {
        setReels(DUMMY_REELS.slice(0, 6));
      } else {
        setReels(shuffle(DUMMY_REELS));
      }
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, savedOnly]);

  // Attempt to get current user id (ignore errors if not logged in)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/auth/check-auth');
        if (mounted && data?.user?._id) setCurrentUserId(String(data.user._id));
      } catch (_) {
        if (mounted) setCurrentUserId(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // If a startIndex was provided, scroll the feed so that item is visible
  useEffect(() => {
    if (!mainRef.current || reels.length === 0 || startIndex == null) return;
    const children = Array.from(mainRef.current.children || []);
    const idx = Math.max(0, Math.min(startIndex, children.length - 1));
    const child = children[idx];
    if (child) {
      // smooth scroll to the child top
      mainRef.current.scrollTo({ top: child.offsetTop, behavior: 'auto' });
    }
  }, [reels, startIndex]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white"><span className='inline-flex items-center justify-center gap-2'>
        <Loader className='w-5 h-5 animate-spin' />
        Loading reels...
      </span></div>
    );
  }
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-red-400">{error} </div>
    );
  }

  return (
    <ReelAudioProvider>
      <main
        ref={mainRef}
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black"
        aria-label="Reels feed"
      >
        {reels.map((reel, i) => (
          <Reel key={reel._id || i} reel={reel} index={i} creatorUsername={username} currentUserId={currentUserId} />
        ))}
      </main>
    </ReelAudioProvider>
  );
};

export default ReelsFeed;
