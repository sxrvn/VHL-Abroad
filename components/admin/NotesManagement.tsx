import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Video, Batch } from '../../types';

const NotesManagement: React.FC = () => {
  const [notes, setNotes] = useState<Video[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Video | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    description: '',
    batch_id: '',
    is_published: false,
    order_index: 0,
    note_type: 'document' as 'document' | 'audio' | 'video',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notesRes, batchesRes] = await Promise.all([
        supabase.from('videos').select(`*, batch:batches(*)`).order('batch_id').order('order_index'),
        supabase.from('batches').select('*').order('name'),
      ]);

      if (notesRes.data) setNotes(notesRes.data);
      if (batchesRes.data) setBatches(batchesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingNote) {
        const { error } = await supabase
          .from('videos')
          .update({
            title: formData.title,
            video_url: formData.video_url,
            description: formData.description,
            batch_id: formData.batch_id,
            is_published: formData.is_published,
            order_index: formData.order_index,
          })
          .eq('id', editingNote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('videos').insert([{
          title: formData.title,
          video_url: formData.video_url,
          description: formData.description,
          batch_id: formData.batch_id,
          is_published: formData.is_published,
          order_index: formData.order_index,
        }]);
        if (error) throw error;
      }

      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  const togglePublish = async (note: Video) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_published: !note.is_published })
        .eq('id', note.id);

      if (!error) fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this note? This action cannot be undone.')) return;

    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (!error) fetchData();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const openModal = (note?: Video) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        video_url: note.video_url,
        description: note.description || '',
        batch_id: note.batch_id,
        is_published: note.is_published,
        order_index: note.order_index,
        note_type: note.video_url.includes('http') ? 'video' : 'document',
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        video_url: '',
        description: '',
        batch_id: '',
        is_published: false,
        order_index: 0,
        note_type: 'document',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setUploadProgress(0);
  };

  const getNoteTypeIcon = (url: string) => {
    if (url.includes('http') || url.includes('youtube') || url.includes('vimeo')) {
      return { icon: 'videocam', label: 'Video', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' };
    } else if (url.includes('.mp3') || url.includes('.wav') || url.includes('audio')) {
      return { icon: 'headphones', label: 'Audio', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' };
    }
    return { icon: 'description', label: 'Document', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  const groupedNotes = batches.map((batch) => ({
    batch,
    notes: notes.filter((n) => n.batch_id === batch.id),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-orange-500">description</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No notes yet</h3>
          <p className="text-base opacity-60">Start by adding your first study material</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedNotes.map(({ batch, notes }) => (
            notes.length > 0 && (
              <div key={batch.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-lg">folder</span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{batch.name}</h3>
                  <span className="text-sm font-semibold opacity-50">({notes.length} notes)</span>
                </div>
                <div className="grid gap-4">
                  {notes.map((note) => {
                    const typeInfo = getNoteTypeIcon(note.video_url);
                    return (
                      <div
                        key={note.id}
                        className="bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10 p-6 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                            <div className="size-14 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-3xl">{typeInfo.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-black tracking-tight truncate">{note.title}</h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeInfo.color}`}>
                                    {typeInfo.label}
                                  </span>
                                </div>
                                {note.description && (
                                  <p className="text-sm opacity-70 line-clamp-2 mb-3">{note.description}</p>
                                )}
                                <p className="text-xs opacity-50 font-semibold">
                                  {new Date(note.created_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => togglePublish(note)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 ${
                                    note.is_published
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/10'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-900/50'
                                  }`}
                                >
                                  {note.is_published ? 'Published' : 'Draft'}
                                </button>
                                <button
                                  onClick={() => openModal(note)}
                                  className="size-10 rounded-lg bg-blue-500/10 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 flex items-center justify-center transition-all group hover:scale-105"
                                  title="Edit"
                                >
                                  <span className="material-symbols-outlined text-base text-blue-500 group-hover:scale-110 transition-transform">edit</span>
                                </button>
                                <button
                                  onClick={() => deleteNote(note.id)}
                                  className="size-10 rounded-lg bg-red-500/10 hover:bg-gradient-to-br hover:from-red-500/20 hover:to-pink-500/20 flex items-center justify-center transition-all group hover:scale-105"
                                  title="Delete"
                                >
                                  <span className="material-symbols-outlined text-base text-red-500 group-hover:scale-110 transition-transform">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-bg-dark rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-bg-dark border-b border-charcoal/10 dark:border-white/10 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingNote ? 'Edit Note' : 'Add New Note'}</h3>
                <button 
                  onClick={closeModal} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      Only enrolled students will be able to access this note.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.batch_id}
                    onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  >
                    <option value="">-- Select Batch --</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Note Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {
                      [
                      { value: 'document', icon: 'description', label: 'Document' },
                      { value: 'audio', icon: 'headphones', label: 'Audio' },
                      { value: 'video', icon: 'videocam', label: 'Video' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, note_type: type.value as any })}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          formData.note_type === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-charcoal/10 dark:border-white/10 hover:border-primary/50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl sm:text-2xl mb-1 block">{type.icon}</span>
                        <div className="text-[10px] sm:text-xs font-semibold">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Note Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., German Grammar Basics"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Short Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Brief description of this note..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    {formData.note_type === 'video' ? 'Video URL' : 'File URL / Link'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder={
                      formData.note_type === 'video'
                        ? 'https://youtube.com/watch?v=...'
                        : formData.note_type === 'audio'
                        ? 'https://example.com/audio.mp3'
                        : 'https://example.com/document.pdf'
                    }
                    required
                  />
                  <p className="text-xs opacity-50 mt-2">
                    {formData.note_type === 'video' 
                      ? 'Enter YouTube, Vimeo, or any video URL'
                      : formData.note_type === 'audio'
                      ? 'Enter direct link to audio file (MP3, WAV, etc.)'
                      : 'Enter direct link to document (PDF, DOC, etc.)'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    min="0"
                  />
                  <p className="text-xs opacity-50 mt-2">Lower numbers appear first</p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-5 h-5 rounded border-charcoal/20 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="is_published" className="text-sm font-semibold cursor-pointer">
                    Publish immediately (students will see this note)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border-2 border-charcoal/10 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover font-semibold shadow-lg shadow-primary/20 transition-all"
                  >
                    {editingNote ? 'Update Note' : 'Create Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotesManagement;
