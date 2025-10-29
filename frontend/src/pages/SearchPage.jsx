import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, User } from 'lucide-react';
import api from '../lib/api.js';
import NavBar from '../components/NavBar.jsx';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const SearchPage = () => {
  const qParams = useQuery();
  const navigate = useNavigate();
  const initialQ = qParams.get('q') || '';
  const [q, setQ] = useState(initialQ);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  useEffect(() => {
    const id = setTimeout(async () => {
      const query = q.trim();
      if (!query) {
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get('/search', { params: { q: query } });
        setUsers(Array.isArray(data?.users) ? data.users : []);
        navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
      } catch (_) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [q, navigate]);

  return (
    <div className="min-h-screen bg-black text-white pb-16 lg:pb-0 lg:pl-64">
      <header className="px-4 py-3 border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-10 flex items-center gap-2">
        <SearchIcon className="w-5 h-5 text-white/60" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..." className="flex-1 bg-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4">
        <section>
          <h2 className="text-sm uppercase tracking-wide text-white/60 mb-3 font-semibold">Users</h2>
          <div className="space-y-2">
            {loading && q && <div className="text-white/70 text-sm">Searching...</div>}
            {!loading && q && users.length === 0 && <div className="text-white/70 text-sm">No users found</div>}
            {users.map((u) => (
              <Link key={u._id} to={`/creator/${u.username}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/10">
                  {u.avatarUrl ? <img src={u.avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : <User className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-semibold">@{u.username}</div>
                  {u.name && <div className="text-white/70 text-sm">{u.name}</div>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <NavBar />
    </div>
  );
};

export default SearchPage;
