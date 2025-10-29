import React from 'react';
import ReelsFeed from '../components/ReelsFeed.jsx';
import NavBar from '../components/NavBar.jsx';

const Home = () => {
  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Add left padding on desktop to account for sidebar */}
      <div className="lg:pl-64">
        <ReelsFeed />
      </div>
      <NavBar />
    </div>
  );
};

export default Home;