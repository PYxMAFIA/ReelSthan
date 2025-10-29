import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ReelAudioContext = createContext(null);

export const ReelAudioProvider = ({ children }) => {
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem('reelsMuted');
    return saved === null ? false : saved === 'true';
  });
  const [userActivated, setUserActivated] = useState(false);

  useEffect(() => {
    localStorage.setItem('reelsMuted', String(muted));
  }, [muted]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  const activate = useCallback(() => setUserActivated(true), []);

  // On first user interaction anywhere, mark as activated and notify listeners
  useEffect(() => {
    if (userActivated) return;

    const handler = () => {
      setUserActivated(true);
      try {
        window.dispatchEvent(new CustomEvent('reels-activate'));
      } catch {}
      cleanup();
    };
    const events = ['pointerdown', 'click', 'touchstart', 'keydown'];
    events.forEach((evt) => window.addEventListener(evt, handler, { once: true }));
    const cleanup = () => events.forEach((evt) => window.removeEventListener(evt, handler));
    return cleanup;
  }, [userActivated]);

  return (
    <ReelAudioContext.Provider value={{ muted, toggleMute, userActivated, activate }}>
      {children}
    </ReelAudioContext.Provider>
  );
};

export const useReelAudio = () => {
  const ctx = useContext(ReelAudioContext);
  if (!ctx) {
    return { muted: false, toggleMute: () => {}, userActivated: false, activate: () => {} };
  }
  return ctx;
};

export default ReelAudioContext;
