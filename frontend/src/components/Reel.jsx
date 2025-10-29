import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Heart, MessageCircle, Share2, Bookmark, Home, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useReelAudio } from '../context/ReelAudioContext.jsx';
import api from '../lib/api.js';

// A single full-screen reel that auto-plays when in view
// creatorUsername (optional) can be provided by a creator-filtered feed to ensure the correct username is shown
const Reel = ({ reel, index, creatorUsername, currentUserId }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { muted, toggleMute } = useReelAudio();
  const [isInView, setIsInView] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const initialLiked = currentUserId ? (Array.isArray(reel?.like) ? reel.like.some((u) => String(u) === String(currentUserId)) : false) : false;
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(Array.isArray(reel?.like) ? reel.like.length : 0);
  const [commentsCount, setCommentsCount] = useState(Array.isArray(reel?.comments) ? reel.comments.length : 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const initialSaved = currentUserId ? (Array.isArray(reel?.saves) ? reel.saves.some((u) => String(u) === String(currentUserId)) : false) : false;
  const [saved, setSaved] = useState(initialSaved);
  const [savesCount, setSavesCount] = useState(Array.isArray(reel?.saves) ? reel.saves.length : 0);
  const [shareCount, setShareCount] = useState(typeof reel?.shareCount === 'number' ? reel.shareCount : 0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting && entry.intersectionRatio > 0.6;
          setIsInView(inView);
          // Reset pause state when coming back into view
          if (inView) {
            setIsPaused(false);
          }
        });
      },
      { threshold: [0.0, 0.25, 0.5, 0.6, 0.75, 1.0] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Autoplay when in view and not paused by user
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView && !isPaused) {
      video.muted = muted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('Autoplay prevented:', err);
        });
      }
    } else {
      video.pause();
    }
  }, [isInView, muted, isPaused]);

  // Handle video tap to pause/play
  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (!video.duration) return;
      setProgress((video.currentTime / video.duration) * 100);
    };
    video.addEventListener('timeupdate', onTime);
    return () => video.removeEventListener('timeupdate', onTime);
  }, []);

  // Load comments when the drawer opens
  useEffect(() => {
    if (!showComments) return;
    (async () => {
      try {
        const { data } = await api.get(`/reel/${reel._id}/comments`);
        if (Array.isArray(data?.comments)) setComments(data.comments);
      } catch (_) {}
    })();
  }, [showComments, reel?._id]);

  // Toggle global mute so all reels follow the same preference
  const onToggleMute = () => toggleMute();

  const onToggleLike = async () => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await api.post(`/reel/${reel._id}/like`);
      if (typeof data?.liked === 'boolean') setLiked(data.liked);
      if (typeof data?.likesCount === 'number') setLikesCount(data.likesCount);
    } catch (_) {}
  };

  const onAddComment = async () => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    const text = commentText;
    if (!text || !text.trim()) return;
    try {
      const { data } = await api.post(`/reel/${reel._id}/comment`, { text });
      if (typeof data?.commentsCount === 'number') setCommentsCount(data.commentsCount);
      setCommentText('');
      // refresh comments list
      try {
        const { data: list } = await api.get(`/reel/${reel._id}/comments`);
        if (Array.isArray(list?.comments)) setComments(list.comments);
      } catch (_) {}
    } catch (_) {}
  };

  const onToggleSave = async () => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await api.post(`/reel/${reel._id}/save`);
      if (typeof data?.saved === 'boolean') setSaved(data.saved);
      if (typeof data?.savesCount === 'number') setSavesCount(data.savesCount);
    } catch (_) {}
  };

  const onShare = async () => {
    try {
      const displayUsername = (
        creatorUsername ||
        reel?.uploadedByUsername ||
        (reel?.uploadedBy && typeof reel.uploadedBy === 'object' && reel.uploadedBy.username) ||
        (reel?.user && typeof reel.user === 'object' && reel.user.username) ||
        (typeof reel?.uploadedBy === 'string' ? reel.uploadedBy : undefined)
      );
      const url = `${window.location.origin}/reels/creator/${displayUsername || ''}${Number.isFinite(index) ? `?start=${index}` : ''}`;
      const shareData = { title: reel?.title || 'Reel', text: `Check out this reel${displayUsername ? ` by @${displayUsername}` : ''}!`, url };
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard');
      } else {
        // Fallback: open new tab
        window.open(url, '_blank');
      }
    } catch (_) {
      // ignore errors from share
    } finally {
      try {
        const { data } = await api.post(`/reel/${reel._id}/share`);
        if (typeof data?.shareCount === 'number') setShareCount(data.shareCount);
      } catch (_) {}
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full snap-start flex items-center justify-center bg-black"
      aria-label={`Reel ${index + 1}: ${reel?.title || ''}`}
    >
      {/* Top bar with Home link */}
      {/* <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 flex items-center justify-start z-10">
        <Link to="/" className="inline-flex items-center gap-1 text-white/90 hover:text-white">
          <Home className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm font-medium">Home</span>
        </Link>
      </div> */}
      {/* Media */}
      {(() => {
        const url = reel?.videoUrl || '';
        const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
        if (isImage) {
          return (
            <img src={url} alt={reel?.title || 'reel'} className="h-full w-auto max-w-full object-contain" />
          );
        }
        return (
          <video
            ref={videoRef}
            className="h-full w-auto max-w-full object-contain cursor-pointer"
            src={url}
            playsInline
            loop
            muted={muted}
            preload="metadata"
            onClick={handleVideoClick}
          />
        );
      })()}

      {/* No overlay; if sound is blocked, playback will resume with sound as soon as the user interacts anywhere */}

      {/* Gradient overlays for better contrast */}
  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-black/0 to-black/20" />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-white/20" />
            {(() => {
              const displayUsername = (
                creatorUsername ||
                reel?.uploadedByUsername ||
                (reel?.uploadedBy && typeof reel.uploadedBy === 'object' && reel.uploadedBy.username) ||
                (reel?.user && typeof reel.user === 'object' && reel.user.username) ||
                (typeof reel?.uploadedBy === 'string' ? reel.uploadedBy : undefined) ||
                'unknown'
              );
              return (
                <Link
                  to={`/creator/${displayUsername}`}
                  className="font-semibold truncate hover:underline"
                >
                  {displayUsername}
                </Link>
              );
            })()}
          </div>
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{reel?.title}</h3>
          {reel?.description && (
            <p className="text-sm text-white/80 line-clamp-2 mt-1">{reel.description}</p>
          )}
        </div>

        {/* Right action rail */}
        <div className="flex flex-col items-center gap-2 pr-1">
          <button onClick={onToggleLike} className={`p-1 rounded-full hover:bg-white/20 ${liked ? 'bg-red-500/20' : 'bg-white/10'}`} aria-label="Like">
            <Heart className={`h-4 w-4 ${liked ? 'text-red-500 fill-red-500' : ''}`} />
          </button>
          <span className="text-xs text-white/80">{likesCount}</span>
          <button onClick={() => setShowComments(true)} className="p-1 rounded-full bg-white/10 hover:bg-white/20" aria-label="Comment">
            <MessageCircle className="h-4 w-4" />
          </button>
          <span className="text-xs text-white/80">{commentsCount}</span>
          <button onClick={onShare} className="p-1 rounded-full bg-white/10 hover:bg-white/20" aria-label="Share">
            <Share2 className="h-4 w-4" />
          </button>
          <span className="text-xs text-white/80">{shareCount}</span>
          <button onClick={onToggleSave} className={`p-1 rounded-full hover:bg-white/20 ${saved ? 'bg-emerald-500/20' : 'bg-white/10'}`} aria-label="Save">
            <Bookmark className={`h-4 w-4 ${saved ? 'text-emerald-400 fill-emerald-400' : ''}`} />
          </button>
          <span className="text-xs text-white/80">{savesCount}</span>
          <button onClick={onToggleMute} className="p-1 rounded-full bg-white/10 hover:bg-white/20" aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar (videos only) */}
      {(() => {
        const url = reel?.videoUrl || '';
        const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
        if (isImage) return null;
        return (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <div className="h-full bg-white/80" style={{ width: `${progress}%` }} />
          </div>
        );
      })()}

      {/* Comments drawer */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 top-1/4 bg-black/95 backdrop-blur z-20 flex flex-col border-t border-white/10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="font-semibold">Comments</div>
            <button onClick={() => setShowComments(false)} className="p-1.5 rounded bg-white/10 hover:bg-white/20"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {comments.length === 0 ? (
              <div className="text-sm text-white/70">No comments yet. Be the first!</div>
            ) : (
              comments.map((c, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-semibold">{c.username || String(c.user).slice(-6)}</span>
                  <span className="text-white/70"> • {new Date(c.createdAt).toLocaleString()}</span>
                  <div>{c.text}</div>
                </div>
              ))
            )}
          </div>
          <div className="px-3 py-3 border-t border-white/10 flex gap-2">
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-white/10 rounded px-3 py-2 outline-none" />
            <button onClick={onAddComment} className="px-3 py-2 rounded bg-emerald-500 text-black font-semibold">Post</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reel;
