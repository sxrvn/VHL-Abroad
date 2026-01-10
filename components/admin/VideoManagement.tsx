import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Video, Batch } from '../../types';

const VideoManagement: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    description: '',
    batch_id: '',
    is_published: false,
    order_index: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [videosRes, batchesRes] = await Promise.all([
        supabase.from('videos').select(`*, batch:batches(*)`).order('batch_id').order('order_index'),
        supabase.from('batches').select('*').order('name'),
      ]);

      if (videosRes.data) setVideos(videosRes.data);
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
      if (editingVideo) {
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
          .eq('id', editingVideo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('videos').insert([formData]);
        if (error) throw error;
      }

      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Failed to save video');
    }
  };

  const togglePublish = async (video: Video) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_published: !video.is_published })
        .eq('id', video.id);

      if (!error) fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Delete this video?')) return;

    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (!error) fetchData();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const openModal = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        video_url: video.video_url,
        description: video.description || '',
        batch_id: video.batch_id,
        is_published: video.is_published,
        order_index: video.order_index,
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: '',
        video_url: '',
        description: '',
        batch_id: '',
        is_published: false,
        order_index: 0,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
  };

  const moveVideo = async (videoId: string, direction: 'up' | 'down') => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    const batchVideos = videos
      .filter(v => v.batch_id === video.batch_id)
      .sort((a, b) => a.order_index - b.order_index);
    
    const currentIndex = batchVideos.findIndex(v => v.id === videoId);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === batchVideos.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetVideo = batchVideos[targetIndex];

    try {
      await Promise.all([
        supabase.from('videos').update({ order_index: targetVideo.order_index }).eq('id', video.id),
        supabase.from('videos').update({ order_index: video.order_index }).eq('id', targetVideo.id),
      ]);
      fetchData();
    } catch (error) {
      console.error('Error reordering videos:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  
  const filteredVideos = selectedBatch === 'all' 
    ? videos 
    : videos.filter(v => v.batch_id === selectedBatch);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e] px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Add Video
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="pl-4 pr-10 py-2.5 bg-white dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Batches</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>{batch.name}</option>
          ))}
        </select>
        <span className="text-sm opacity-60">{filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}</span>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-purple-500">video_library</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No videos found</h3>
          <p className="text-base opacity-60">Add your first video lecture</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10 overflow-hidden">
          {/* Desktop Table Header - Hidden on Mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-charcoal/10 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
            <div className="col-span-4 text-sm font-bold opacity-60 uppercase tracking-wider">Video</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider">Batch</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider">Duration</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider">Status</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider text-right">Actions</div>
          </div>
          
          {/* Table Body / Card List */}
          <div className="divide-y divide-charcoal/10 dark:divide-white/10">
            {filteredVideos.map((video) => {
              return (
                <div key={video.id} className="md:grid md:grid-cols-12 gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="size-12 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-xl">videocam</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base mb-1">{video.title}</h4>
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Open Video
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => openModal(video)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base opacity-60">groups</span>
                        <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-semibold">
                          {video.batch?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-70">
                        <span className="material-symbols-outlined text-base">timer</span>
                        <span>{video.description?.match(/\d+\s*min/)?.[0] || 'N/A'}</span>
                      </div>
                      <div>
                        <button
                          onClick={() => togglePublish(video)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            video.is_published
                              ? 'bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e]'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {video.is_published ? 'Published' : 'Draft'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Grid Layout */}
                  <div className="hidden md:contents">
                    {/* Video Column */}
                    <div className="col-span-4 flex items-center gap-3">
                    <div className="size-12 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-xl">videocam</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{video.title}</h4>
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-red-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        Open
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                    </div>
                  </div>

                  {/* Batch Column */}
                  <div className="col-span-2 flex items-center">
                    <span className="px-3 py-1 bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e] rounded-full text-sm font-semibold">
                      {video.batch?.name || 'N/A'}
                    </span>
                  </div>

                  {/* Duration Column */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm font-medium opacity-70">
                      {video.description?.match(/\d+\s*min/)?.[0] || 'N/A'}
                    </span>
                  </div>

                  {/* Status Column */}
                  <div className="col-span-2 flex items-center">
                    <button
                      onClick={() => togglePublish(video)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        video.is_published
                          ? 'bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e]'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {video.is_published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                    {/* Actions Column */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(video)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-bg-dark rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{editingVideo ? 'Edit Video' : 'Add Video'}</h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Batch</label>
                  <select
                    value={formData.batch_id}
                    onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                    className="w-full pl-4 pr-10 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
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
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Video URL (Private)</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_published" className="text-sm font-semibold">
                    Publish immediately
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-charcoal/10 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                  >
                    {editingVideo ? 'Update' : 'Create'}
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

export default VideoManagement;
