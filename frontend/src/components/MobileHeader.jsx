import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const MobileHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine title based on path
    const getTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'ReelSthan';
        if (path === '/search') return 'Search';
        if (path === '/upload') return 'Create Reel';
        if (path === '/profile') return 'My Profile';
        if (path.startsWith('/creator/')) return 'Creator Profile';
        if (path.startsWith('/reels/')) return 'Reels';
        if (path === '/login') return 'Login';
        if (path === '/signup') return 'Sign Up';
        return 'ReelSthan';
    };

    const isRoot = ['/', '/login', '/signup'].includes(location.pathname);

    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-[60px] bg-zinc-950/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 justify-between transition-all duration-300">
            <div className="flex items-center gap-3">
                {!isRoot && (
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 rounded-full bg-white/5 text-white active:scale-95 transition-transform"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent truncate cursor-default">
                    {getTitle()}
                </h1>
            </div>

            {/* Placeholder for right side actions if needed */}
            <div className="w-8"></div>
        </header>
    );
};

export default MobileHeader;
