import React from 'react';
import { Home, PlusSquare, Search, User, LogOut, Video } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();

  // Desktop sidebar link classes
  const desktopLink = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
      ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.15)] border border-emerald-500/20'
      : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  // Mobile bottom bar link classes
  const mobileLink = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-3 gap-1.5 transition-all duration-300 relative ${isActive ? 'text-emerald-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-zinc-950/90 backdrop-blur-xl border-r border-white/5 flex-col px-5 py-8 z-50">
        <div className="mb-10 px-2 flex items-center justify-center">
          <h1 className="text-3xl font-bold bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
            ReelSthan
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink to="/" end className={desktopLink}>
            <Home className="w-6 h-6" />
            <span className="text-base tracking-wide">Home</span>
          </NavLink>

          <NavLink to="/search" className={desktopLink}>
            <Search className="w-6 h-6" />
            <span className="text-base tracking-wide">Search</span>
          </NavLink>

          <NavLink to="/upload" className={desktopLink}>
            <PlusSquare className="w-6 h-6" />
            <span className="text-base tracking-wide">Create</span>
          </NavLink>

          <NavLink to="/profile" className={desktopLink}>
            <User className="w-6 h-6" />
            <span className="text-base tracking-wide">Profile</span>
          </NavLink>
        </nav>

        <div className="border-t border-white/5 pt-6 px-4">
          <p className="text-xs text-zinc-600 text-center font-medium tracking-wider uppercase opacity-50">
            © 2025 ReelSthan
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 z-50 pb-safe">
        <div className="flex justify-around items-center h-[70px] max-w-md mx-auto px-2">
          <NavLink to="/" end className={mobileLink}>
            <Home className="w-6 h-6 stroke-[1.5]" />
            <span className="text-[10px] font-medium tracking-wide">Home</span>
            {location.pathname === '/' && (
              <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            )}
          </NavLink>

          <NavLink to="/search" className={mobileLink}>
            <Search className="w-6 h-6 stroke-[1.5]" />
            <span className="text-[10px] font-medium tracking-wide">Search</span>
            {location.pathname === '/search' && (
              <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            )}
          </NavLink>

          <NavLink to="/upload" className={mobileLink}>
            <PlusSquare className="w-6 h-6 stroke-[1.5]" />
            <span className="text-[10px] font-medium tracking-wide">Upload</span>
            {location.pathname === '/upload' && (
              <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            )}
          </NavLink>

          <NavLink to="/profile" className={mobileLink}>
            <User className="w-6 h-6 stroke-[1.5]" />
            <span className="text-[10px] font-medium tracking-wide">Profile</span>
            {location.pathname === '/profile' && (
              <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            )}
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
