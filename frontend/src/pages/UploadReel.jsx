import React, { useMemo, useState } from 'react';
import { UploadCloud, Video, Image as ImageIcon, Loader2, FileWarning } from 'lucide-react';
import api from '../lib/api.js';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar.jsx';

const UploadReel = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const isVideo = file && file.type && file.type.startsWith('video/');
  const isImage = file && file.type && file.type.startsWith('image/');

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setMessage(null);
    if (!f) {
      setFile(null);
      return;
    }
    // Accept only video/* or image/png (allow jpeg too for convenience)
    const ok = f.type.startsWith('video/') || f.type === 'image/png' || f.type === 'image/jpeg' || f.type.startsWith('image/');
    if (!ok) {
      setMessage({ type: 'error', text: 'Please select a video file or a PNG/JPEG image.' });
      e.target.value = '';
      setFile(null);
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Title is required.' });
      return;
    }
    if (!file) {
      setMessage({ type: 'error', text: 'Please choose a video or PNG image to upload.' });
      return;
    }

    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('title', title.trim());
      if (description.trim()) form.append('description', description.trim());
      form.append('reel', file); // field name must be 'reel' (server expects upload.single("reel"))

      const { data } = await api.post('/reel', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ type: 'success', text: data?.message || 'Uploaded successfully.' });
      // Small delay to let user see success, then go home
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setMessage({ type: 'error', text: 'Please login to upload. Redirecting to login…' });
        setTimeout(() => navigate('/login'), 800);
      } else {
        const text = err?.response?.data?.message || 'Upload failed. Please try again.';
        setMessage({ type: 'error', text });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-16 lg:pb-0 lg:pl-64">
      <header className="px-4 py-4 border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold">Upload Reel</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={onSubmit} className="space-y-5">
          {message && (
            <div className={`rounded-lg px-4 py-3 text-sm inline-flex items-center gap-2 ${message.type === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
              {message.type === 'error' ? <FileWarning className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/90">Title<span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Awesome clip"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/90">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Say something about this reel…"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[90px] transition-all"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/90">File<span className="text-red-400">*</span></label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer transition-colors">
                <UploadCloud className="w-4 h-4" />
                <span>Choose file</span>
                <input
                  type="file"
                  accept="video/*,image/png,image/jpeg"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-white/70 truncate max-w-[60%]">{file ? file.name : 'No file chosen'}</span>
            </div>
            <p className="text-xs text-white/50">Accepted: videos (mp4, webm, etc.) or images (png, jpeg)</p>
          </div>

          {previewUrl && (
            <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
              {isVideo ? (
                <div className="relative">
                  <video src={previewUrl} className="w-full max-h-[60vh] object-contain bg-black" controls preload="metadata" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
                    <Video className="w-3.5 h-3.5" /> Video preview
                  </div>
                </div>
              ) : isImage ? (
                <div className="relative">
                  <img src={previewUrl} alt="preview" className="w-full max-h-[60vh] object-contain bg-black" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
                    <ImageIcon className="w-3.5 h-3.5" /> Image preview
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 text-black font-semibold disabled:opacity-60 hover:bg-emerald-400 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {submitting ? 'Uploading…' : 'Upload'}
            </button>
            <Link to="/" className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium">Cancel</Link>
          </div>
        </form>
      </main>
      <NavBar />
    </div>
  );
};

export default UploadReel;
