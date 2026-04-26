import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Heart, MessageCircle, Share2, Bookmark, Home, X, Play, Loader2, Download, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useReelAudio } from '../context/ReelAudioContext.jsx';
import { useReelVideo } from '../context/ReelVideoContext.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

// Social Media Embed Helpers
const getSocialMediaType = (url) => {
  if (!url) return null;
  if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/') || url.includes('youtube.com/watch')) return 'youtube';
  if (url.includes('instagram.com/reel/') || url.includes('instagram.com/reels/')) return 'instagram';
  return null;
};

const getYouTubeVideoId = (url) => {
  if (url.includes('youtube.com/shorts/')) {
    return url.split('shorts/')[1]?.split(/[?#]/)[0];
  } else if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split(/[?#]/)[0];
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    return urlParams.get('v');
  }
  return null;
};

const getEmbedUrl = (url, type, muted, userActivated) => {
  if (type === 'youtube') {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return url;
    // YouTube embed with better parameters for reliability
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted || !userActivated ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&enablejsapi=1&origin=${window.location.origin}`;
  }
  if (type === 'instagram') {
    const reelId = url.split('/reel/')[1]?.split('/')[0] || url.split('/reels/')[1]?.split('/')[0];
    return `https://www.instagram.com/reel/${reelId}/embed`;
  }
  return url;
};

// A single full-screen reel that auto-plays when in view
// creatorUsername (optional) can be provided by a creator-filtered feed to ensure the correct username is shown
const Reel = ({ reel, index, creatorUsername, currentUserId, onDeleted }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const { muted, toggleMute, userActivated, activate } = useReelAudio();
  const { registerVideo, unregisterVideo, playVideo, pauseVideo } = useReelVideo();
  const [isInView, setIsInView] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const socialType = getSocialMediaType(reel?.videoUrl);
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
  const ownerUserId = (
    reel?.user && typeof reel.user === 'object' && reel.user._id
      ? String(reel.user._id)
      : reel?.user
        ? String(reel.user)
        : ''
  );
  const isOwner = Boolean(currentUserId) && (
    ownerUserId === String(currentUserId) || String(reel?.uploadedBy || '') === String(currentUserId)
  );

  // Detect iframe/embed load errors
  useEffect(() => {
    if (!socialType || !iframeRef.current) return;

    const iframe = iframeRef.current;
    
    // Set a timeout to detect if embed fails to load
    const timeoutId = setTimeout(() => {
      // If iframe hasn't loaded after 10 seconds, assume it failed
      setEmbedError(true);
      setIsLoading(false);
      toast.error('Video embed failed to load. Click "Watch on YouTube" to view.', {
        duration: 5000,
        icon: '⚠️',
      });
    }, 10000);

    const handleLoad = () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setEmbedError(false);
    };

    const handleError = () => {
      clearTimeout(timeoutId);
      setEmbedError(true);
      setIsLoading(false);
      toast.error('This video cannot be embedded. Click "Watch on YouTube" to view.', {
        duration: 5000,
      });
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      clearTimeout(timeoutId);
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [socialType]);

  // Register/unregister video with global manager
  useEffect(() => {
    const video = videoRef.current;
    if (video && reel?._id) {
      registerVideo(reel._id, video);
      return () => unregisterVideo(reel._id);
    }
  }, [reel?._id, registerVideo, unregisterVideo]);

  // Track video loading states
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setIsVideoReady(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsVideoReady(true);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setIsVideoReady(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  // Intersection Observer for viewport detection
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

  // Autoplay when in view with global video management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView && !isPaused && isVideoReady) {
      // Ensure video is muted for autoplay compliance
      video.muted = !userActivated || muted;

      // Use global video manager to play (will pause all others)
      playVideo(reel._id, video).catch((err) => {
        if (err?.name === 'NotSupportedError') {
          setVideoError(true);
        }
        console.warn('Autoplay prevented or failed:', err);
      });
    } else if (!isInView || isPaused) {
      // Pause when out of view or manually paused
      if (reel?._id) {
        pauseVideo(reel._id);
      }
    }
  }, [isInView, muted, isPaused, userActivated, isVideoReady, reel._id, playVideo, pauseVideo]);

  // Handle video tap to pause/play
  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    // Mark user as activated on first interaction to unlock audio
    if (!userActivated) activate();

    if (video.paused) {
      playVideo(reel._id, video).catch(err => {
        if (err?.name === 'NotSupportedError') {
          setVideoError(true);
        }
        console.error("Manual play failed:", err);
      });
      setIsPaused(false);
    } else {
      pauseVideo(reel._id);
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
      } catch (_) { }
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
      const { data } = await api.post(`/reel/${reel._id}/like`, {}, { skipGlobalError: true });
      if (typeof data?.liked === 'boolean') {
        setLiked(data.liked);
        // Show subtle toast feedback
        if (data.liked) {
          toast.success('Liked!', { duration: 1500, icon: '❤️' });
        }
      }
      if (typeof data?.likesCount === 'number') setLikesCount(data.likesCount);
    } catch (err) {
      toast.error('Failed to like reel', { duration: 2000 });
    }
  };

  const onAddComment = async () => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    const text = commentText;
    if (!text || !text.trim()) {
      toast.error('Comment cannot be empty', { duration: 2000 });
      return;
    }
    try {
      const { data } = await api.post(`/reel/${reel._id}/comment`, { text }, { skipGlobalError: true });
      if (typeof data?.commentsCount === 'number') setCommentsCount(data.commentsCount);
      setCommentText('');
      toast.success('Comment added!', { duration: 2000, icon: '💬' });
      // refresh comments list
      try {
        const { data: list } = await api.get(`/reel/${reel._id}/comments`);
        if (Array.isArray(list?.comments)) setComments(list.comments);
      } catch (_) { }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add comment', { duration: 3000 });
    }
  };

  const onToggleSave = async () => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await api.post(`/reel/${reel._id}/save`, {}, { skipGlobalError: true });
      if (typeof data?.saved === 'boolean') {
        setSaved(data.saved);
        // Show feedback
        if (data.saved) {
          toast.success('Saved to your collection!', { duration: 2000, icon: '🔖' });
        } else {
          toast.success('Removed from saved', { duration: 2000 });
        }
      }
      if (typeof data?.savesCount === 'number') setSavesCount(data.savesCount);
    } catch (err) {
      toast.error('Failed to save reel', { duration: 2000 });
    }
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
        toast.success('Shared successfully!', { duration: 2000, icon: '🎉' });
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!', { duration: 2000, icon: '📋' });
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
      } catch (_) { }
    }
  };

  const onDownload = () => {
    const sourceUrl = reel?.videoUrl;
    if (!sourceUrl) {
      toast.error('Video URL not available', { duration: 2000 });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      if (!socialType) {
        const safeTitle = String(reel?.title || 'reel')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'reel';
        link.download = `${safeTitle}.mp4`;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        socialType ? 'Opened source video in a new tab' : 'Download started',
        { duration: 2000, icon: '⬇️' }
      );
    } catch {
      toast.error('Unable to download this video', { duration: 2500 });
    }
  };

  const onDeleteReel = async () => {
    if (!isOwner) return;
    const confirmed = window.confirm('Delete this reel permanently?');
    if (!confirmed) return;

    try {
      await api.delete(`/reel/${reel._id}`);
      toast.success('Reel deleted', { duration: 2000, icon: '🗑️' });
      if (typeof onDeleted === 'function') {
        onDeleted(reel._id);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete reel', { duration: 2500 });
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
          <div
            className="relative h-full w-full flex items-center justify-center"
            onClick={!socialType ? handleVideoClick : undefined}
          >
            {/* Loading Spinner */}
            {!socialType && isLoading && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                  <p className="text-white text-sm font-medium">Loading...</p>
                </div>
              </div>
            )}

            {!socialType && (
              <video
                key={url}
                ref={videoRef}
                className="h-full w-auto max-w-full object-contain cursor-pointer transition-opacity duration-300"
                style={{ opacity: isLoading ? 0.5 : 1 }}
                src={url}
                playsInline
                loop
                muted={!userActivated || muted}
                preload="metadata"
                onError={() => setVideoError(true)}
              />
            )}

            {!socialType && videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white p-6 text-center z-30">
                <X className="w-12 h-12 text-red-500 mb-4" />
                <h4 className="text-lg font-bold mb-2">Video Unavailable</h4>
                <p className="text-sm text-zinc-400 max-w-[250px]">
                  This video couldn't be loaded. It might have been removed or is in an unsupported format.
                </p>
              </div>
            )}
            
            {/* Social Media Embed (YouTube/Instagram) */}
            {socialType && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-0">
                {isLoading && !embedError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-white animate-spin" />
                      <p className="text-white text-sm font-medium">Loading...</p>
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  title="Social Media Embed"
                  src={getEmbedUrl(url, socialType, muted, userActivated)}
                  className="w-full h-full max-w-[min(100%,(100vh*9/16))] aspect-[9/16]"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                />
                
                {/* Embed Error Fallback */}
                {embedError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 text-white p-6 text-center z-10">
                    <X className="w-12 h-12 text-yellow-500 mb-4" />
                    <h4 className="text-lg font-bold mb-2">Embed Blocked</h4>
                    <p className="text-sm text-zinc-400 max-w-[280px] mb-4">
                      This video cannot be embedded here. The video owner may have disabled embedding or it's restricted in your region.
                    </p>
                    <a
                      href={reel?.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success('Opening in new tab...', { duration: 2000, icon: '🎥' });
                      }}
                    >
                      {socialType === 'youtube' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      )}
                      Watch on {socialType === 'youtube' ? 'YouTube' : 'Instagram'}
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {/* Play/Pause Overlay Icon - Disabled for social embeds */}
            {!socialType && (isPaused || !isInView) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity">
                <div className="p-4 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            )}

            {/* Mute Hint for autoplaying first video - Disabled for social embeds */}
            {!socialType && isInView && !userActivated && !isPaused && (
              <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-red-600/90 backdrop-blur-sm text-white text-sm font-extrabold border border-red-200/80 shadow-lg shadow-red-500/40 animate-pulse">
                TAP TO UNMUTE
              </div>
            )}
          </div>
        );
      })()}

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
          <button onClick={onDownload} className="p-1 rounded-full bg-white/10 hover:bg-white/20" aria-label="Download">
            <Download className="h-4 w-4" />
          </button>
          {isOwner && (
            <button onClick={onDeleteReel} className="p-1 rounded-full bg-red-500/20 hover:bg-red-500/40" aria-label="Delete reel">
              <Trash2 className="h-4 w-4 text-red-300" />
            </button>
          )}
          <button onClick={onToggleSave} className={`p-1 rounded-full hover:bg-white/20 ${saved ? 'bg-emerald-500/20' : 'bg-white/10'}`} aria-label="Save">
            <Bookmark className={`h-4 w-4 ${saved ? 'text-emerald-400 fill-emerald-400' : ''}`} />
          </button>
          <span className="text-xs text-white/80">{savesCount}</span>
          <button onClick={onToggleMute} className="p-1 rounded-full bg-white/10 hover:bg-white/20" aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar (videos only - disabled for social embeds) */}
      {(() => {
        const url = reel?.videoUrl || '';
        const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
        if (isImage || socialType) return null;
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
