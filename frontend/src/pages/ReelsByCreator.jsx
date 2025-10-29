import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import ReelsFeed from '../components/ReelsFeed.jsx';

const ReelsByCreator = () => {
  const { username } = useParams();
  const location = useLocation();
  const startIndex = location.state?.startIndex ?? (location.search ? parseInt(new URLSearchParams(location.search).get('start') || '', 10) : undefined);

  return (
    <div className="min-h-screen bg-black text-white lg:pl-64">
      <div className="absolute top-4 left-4 lg:left-[17rem] z-20">
        <Link to={`/creator/${username}`} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm font-medium transition-colors">← Back</Link>
      </div>
      <ReelsFeed username={username} startIndex={Number.isFinite(startIndex) ? startIndex : undefined} />
    </div>
  );
};

export default ReelsByCreator;
