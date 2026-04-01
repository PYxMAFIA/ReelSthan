import { createContext, useContext, useRef, useCallback } from 'react';

/**
 * ReelVideoContext - Global video playback manager
 * Ensures only one video plays at a time across the entire feed
 */
const ReelVideoContext = createContext(null);

export const ReelVideoProvider = ({ children }) => {
  // Registry of all video elements by their unique ID
  const videosRef = useRef(new Map());
  
  // Track which video is currently playing
  const currentPlayingIdRef = useRef(null);

  /**
   * Register a video element with the manager
   * @param {string} id - Unique identifier for the video (reel._id)
   * @param {HTMLVideoElement} videoElement - The video DOM element
   */
  const registerVideo = useCallback((id, videoElement) => {
    if (!id || !videoElement) return;
    videosRef.current.set(id, videoElement);
  }, []);

  /**
   * Unregister a video element (cleanup on unmount)
   * @param {string} id - Unique identifier for the video
   */
  const unregisterVideo = useCallback((id) => {
    if (!id) return;
    videosRef.current.delete(id);
    if (currentPlayingIdRef.current === id) {
      currentPlayingIdRef.current = null;
    }
  }, []);

  /**
   * Pause all videos except the specified one
   * @param {string} exceptId - ID of video to NOT pause (optional)
   */
  const pauseAllVideos = useCallback((exceptId = null) => {
    videosRef.current.forEach((videoElement, id) => {
      if (id !== exceptId && videoElement && !videoElement.paused) {
        videoElement.pause();
      }
    });
  }, []);

  /**
   * Play a specific video and pause all others
   * @param {string} id - ID of video to play
   * @param {HTMLVideoElement} videoElement - The video element to play
   * @returns {Promise<void>} - Resolves when video starts playing
   */
  const playVideo = useCallback(async (id, videoElement) => {
    if (!id || !videoElement) return;

    // If this video is already playing, do nothing
    if (currentPlayingIdRef.current === id && !videoElement.paused) {
      return;
    }

    // Pause all other videos first
    pauseAllVideos(id);

    // Update current playing video
    currentPlayingIdRef.current = id;

    // Play the video
    try {
      await videoElement.play();
    } catch (err) {
      // Handle autoplay restrictions or errors
      if (err.name === 'NotAllowedError') {
        console.warn(`Autoplay prevented for video ${id}`);
      } else if (err.name !== 'AbortError') {
        // AbortError happens when play() is interrupted by pause(), which is fine
        console.error(`Error playing video ${id}:`, err);
      }
    }
  }, [pauseAllVideos]);

  /**
   * Pause a specific video
   * @param {string} id - ID of video to pause
   */
  const pauseVideo = useCallback((id) => {
    if (!id) return;
    
    const videoElement = videosRef.current.get(id);
    if (videoElement && !videoElement.paused) {
      videoElement.pause();
    }
    
    if (currentPlayingIdRef.current === id) {
      currentPlayingIdRef.current = null;
    }
  }, []);

  /**
   * Get the currently playing video ID
   * @returns {string|null}
   */
  const getCurrentPlayingId = useCallback(() => {
    return currentPlayingIdRef.current;
  }, []);

  const value = {
    registerVideo,
    unregisterVideo,
    playVideo,
    pauseVideo,
    pauseAllVideos,
    getCurrentPlayingId,
  };

  return (
    <ReelVideoContext.Provider value={value}>
      {children}
    </ReelVideoContext.Provider>
  );
};

/**
 * Hook to access the ReelVideoContext
 * @returns {Object} Video manager methods
 */
export const useReelVideo = () => {
  const context = useContext(ReelVideoContext);
  if (!context) {
    throw new Error('useReelVideo must be used within a ReelVideoProvider');
  }
  return context;
};

export default ReelVideoContext;
