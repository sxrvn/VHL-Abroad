import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LiveClass, Batch } from '../../types';
import { formatDateTime, getClassStatus, formatDuration } from '../../lib/utils';

const LiveClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    meeting_link: '',
    scheduled_at: '',
    duration_minutes: 60,
    batch_id: '',
    is_active: true,
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, batchesRes] = await Promise.all([
        supabase.from('live_classes').select(`*, batch:batches(*)`).order('scheduled_at', { ascending: false }),
        supabase.from('batches').select('*').order('name'),
      ]);

      if (classesRes.data) setClasses(classesRes.data);
      if (batchesRes.data) setBatches(batchesRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClass) {
        await supabase.from('live_classes').update(formData).eq('id', editingClass.id);
      } else {
        await supabase.from('live_classes').insert([formData]);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save');
    }
  };

  const toggleActive = async (lc: LiveClass) => {
    await supabase.from('live_classes').update({ is_active: !lc.is_active }).eq('id', lc.id);
    fetchData();
  };

  const deleteClass = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('live_classes').delete().eq('id', id);
    fetchData();
  };

  const openModal = (lc?: LiveClass) => {
    if (lc) {
      setEditingClass(lc);
      setFormData({
        title: lc.title,
        meeting_link: lc.meeting_link,
        scheduled_at: lc.scheduled_at.slice(0, 16),
        duration_minutes: lc.duration_minutes,
        batch_id: lc.batch_id,
        is_active: lc.is_active,
        description: lc.description || '',
      });
    } else {
      setEditingClass(null);
      setFormData({ title: '', meeting_link: '', scheduled_at: '', duration_minutes: 60, batch_id: '', is_active: true, description: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClass(null);
  };

  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  
  const filteredClasses = selectedBatch === 'all' 
    ? classes 
    : classes.filter(c => c.batch_id === selectedBatch);

  if (loading) return <div className="flex items-center justify-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e] px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] transition-all">
          <span className="material-symbols-outlined">add</span>Schedule Class
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
        <span className="text-sm opacity-60">{filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'}</span>
      </div>

      {filteredClasses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-blue-500">video_call</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No live classes found</h3>
          <p className="text-base opacity-60">Schedule your first live class to get started</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10 overflow-hidden">
          {/* Desktop Table Header - Hidden on Mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-charcoal/10 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
            <div className="col-span-3 text-sm font-bold opacity-60 uppercase tracking-wider">Class</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider">Batch</div>
            <div className="col-span-3 text-sm font-bold opacity-60 uppercase tracking-wider">Schedule</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider">Status</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider text-right">Actions</div>
          </div>
          
          {/* Table Body / Card List */}
          <div className="divide-y divide-charcoal/10 dark:divide-white/10">
            {filteredClasses.map((lc) => {
              const status = getClassStatus(lc.scheduled_at, lc.duration_minutes);
              const date = new Date(lc.scheduled_at);
              const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              
              return (
                <div key={lc.id} className="md:grid md:grid-cols-12 gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="size-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="material-symbols-outlined text-xl text-white">video_call</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base mb-1">{lc.title}</h4>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          status === 'live' ? 'bg-red-500 text-white animate-pulse' :
                          status === 'upcoming' ? 'bg-green-500 text-white' :
                          'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {status === 'live' ? '🔴 Live' : status === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </span>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => openModal(lc)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => deleteClass(lc.id)}
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
                          {lc.batch?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-70">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        <span className="font-medium">{formattedDate} · {formattedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-70">
                        <span className="material-symbols-outlined text-base">timer</span>
                        <span>{lc.duration_minutes} minutes</span>
                      </div>
                      <a
                        href={lc.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                      >
                        <span className="material-symbols-outlined text-base">link</span>
                        Join Meeting
                      </a>
                    </div>
                  </div>

                  {/* Desktop Grid Layout */}
                  <div className="hidden md:contents">
                    {/* Class Column */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-xl text-red-600">sensors</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{lc.title}</h4>
                        <a
                          href={lc.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-red-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          Join Link
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                      </div>
                    </div>

                    {/* Batch Column */}
                    <div className="col-span-2 flex items-center">
                      <span className="px-3 py-1 bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e] rounded-full text-sm font-semibold">
                        {lc.batch?.name || 'N/A'}
                      </span>
                    </div>

                    {/* Schedule Column */}
                    <div className="col-span-3 flex items-center">
                      <div>
                        <p className="text-sm font-bold">{formattedDate}</p>
                        <p className="text-xs opacity-60">{formattedTime} · {lc.duration_minutes}min</p>
                      </div>
                    </div>

                    {/* Status Column */}
                    <div className="col-span-2 flex items-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        status === 'live' ? 'bg-red-500 text-white' :
                        status === 'upcoming' ? 'bg-green-500 text-white' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {status === 'live' ? 'Live' : status === 'upcoming' ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>

                    {/* Actions Column */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(lc)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => deleteClass(lc.id)}
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

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white pr-2">{editingClass ? 'Edit Class' : 'Schedule Live Class'}</h3>
                <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-gray-500 text-xl">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Class Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base focus:border-primary focus:ring-0 transition-colors" placeholder="e.g., Physics - Chapter 5 Discussion" required />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Description (Optional)</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base focus:border-primary focus:ring-0 transition-colors resize-none" placeholder="Topics to be covered in this session..." rows={3} />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Meeting Link</label>
                  <input type="url" value={formData.meeting_link} onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base focus:border-primary focus:ring-0 transition-colors" placeholder="https://zoom.us/j/..." required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Scheduled Date & Time</label>
                    <input type="datetime-local" value={formData.scheduled_at} onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base focus:border-primary focus:ring-0 transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Duration (Minutes)</label>
                    <input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base focus:border-primary focus:ring-0 transition-colors" min="1" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Batch</label>
                  <select value={formData.batch_id} onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base focus:border-primary focus:ring-0 transition-colors" required>
                    <option value="">Select a batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Active</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">Students can see and join this class</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only peer" />
                      <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 dark:bg-primary text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-800 dark:hover:bg-primary-hover transition-colors">{editingClass ? 'Update Class' : 'Schedule Class'}</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveClassManagement;
