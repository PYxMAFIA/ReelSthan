import React, { useMemo, useState } from 'react';
import { UploadCloud, Video, Image as ImageIcon, Loader2, FileWarning, Type, FileVideo } from 'lucide-react';
import api from '../lib/api.js';
import { Link, useNavigate } from 'react-router-dom';

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
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header can be here or integrated, we removed it for mobile but need a global container for margin */}

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
        <form onSubmit={onSubmit} className="space-y-8">
          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm inline-flex items-center gap-2 w-full ${message.type === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
              {message.type === 'error' ? <FileWarning className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Form Inputs */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Type className="w-4 h-4" /> Title <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your reel a catchy title"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white placeholder-zinc-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this video about? #hashtags"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 min-h-[120px] transition-all text-white placeholder-zinc-600 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <FileVideo className="w-4 h-4" /> Media File <span className="text-emerald-500">*</span>
                </label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-emerald-500/30 hover:bg-white/5 transition-all text-center">
                  <input
                    type="file"
                    id="file-upload"
                    accept="video/*,image/png,image/jpeg"
                    onChange={onFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-emerald-400 font-medium hover:underline">Click to upload</span>
                      <span className="text-zinc-500"> or drag and drop</span>
                    </div>
                    <p className="text-xs text-zinc-600">MP4, WebM, PNG, JPG (Max 50MB)</p>
                  </label>
                </div>
                {file && (
                  <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-2">
                    <span className="text-sm text-emerald-300 truncate max-w-[80%]">{file.name}</span>
                    <button type="button" onClick={() => setFile(null)} className="text-zinc-500 hover:text-red-400 transition-colors">
                      <span className="text-xs">Remove</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Preview</label>

              {previewUrl ? (
                <div className="rounded-xl border border-white/5 bg-black overflow-hidden relative shadow-lg">
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
              ) : (
                <div className="aspect-[9/16] bg-black/60 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center relative shadow-lg">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm">Media preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-4">
            <Link to="/" className="px-6 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg hover:shadow-emerald-500/20 transform hover:-translate-y-0.5"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              {submitting ? 'Publishing...' : 'Publish Reel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadReel;
