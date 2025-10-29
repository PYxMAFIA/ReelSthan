import React from 'react';
import { Home, PlusSquare, Search, User, Compass } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  // Desktop sidebar link classes
  const desktopLink = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-white/10 text-white font-semibold'
        : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`;

  // Mobile bottom bar link classes
  const mobileLink = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-2.5 gap-1 transition-colors duration-200 ${
      isActive ? 'text-white' : 'text-white/60'
    }`;

  return (
    <>
      {/* Desktop Sidebar - Left side navigation */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-black flex-col px-4 py-6 z-50">
        <div className="mb-8 px-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            ReelSthan
          </h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavLink to="/" end className={desktopLink}>
            <Home className="w-6 h-6" />
            <span className="text-base">Home</span>
          </NavLink>
          
          <NavLink to="/search" className={desktopLink}>
            <Search className="w-6 h-6" />
            <span className="text-base">Search</span>
          </NavLink>
          
          <NavLink to="/upload" className={desktopLink}>
            <PlusSquare className="w-6 h-6" />
            <span className="text-base">Create</span>
          </NavLink>
          
          <NavLink to="/profile" className={desktopLink}>
            <User className="w-6 h-6" />
            <span className="text-base">Profile</span>
          </NavLink>
        </nav>

        <div className="border-t border-white/10 pt-4 px-4 text-xs text-white/40">
          <p>&copy; 2025 ReelSthan</p>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/95 backdrop-blur-lg z-50">
        <div className="flex justify-around items-center h-16">
          <NavLink to="/" end className={mobileLink}>
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </NavLink>
          
          <NavLink to="/search" className={mobileLink}>
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Search</span>
          </NavLink>
          
          <NavLink to="/upload" className={mobileLink}>
            <PlusSquare className="w-6 h-6" />
            <span className="text-xs font-medium">Create</span>
          </NavLink>
          
          <NavLink to="/profile" className={mobileLink}>
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
