import React from 'react';
import ReelsFeed from '../components/ReelsFeed.jsx';
import NavBar from '../components/NavBar.jsx';

const SavedReels = () => {
  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="lg:pl-64">
        <ReelsFeed savedOnly />
      </div>
      <NavBar />
    </div>
  );
};

export default SavedReels;
