import React from 'react';
import NavBar from './NavBar';
import MobileHeader from './MobileHeader';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col lg:flex-row">
            {/* Navigation (Sidebar on Desktop, BottomBar on Mobile) */}
            <NavBar />

            {/* Mobile Top Header - Visible only on mobile */}
            <MobileHeader />

            {/* Main Content Area */}
            {/* Added pt-[60px] for MobileHeader and pb-[80px] for BottomBar on mobile */}
            <main className="flex-1 w-full min-h-screen lg:pl-64 pt-[60px] lg:pt-0 pb-[80px] lg:pb-0 relative overflow-x-hidden">
                {/* Global Background Ambience */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] opacity-50"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] opacity-50"></div>
                    {/* Noise texture disabled due to 403 error on external resource */}
                    {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div> */}
                </div>

                {/* Content */}
                <div className="relative z-10 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
