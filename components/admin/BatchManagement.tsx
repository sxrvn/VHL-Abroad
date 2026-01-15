import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Batch } from '../../types';
import { formatDate, addMonths } from '../../lib/utils';

const BatchManagement: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBatches(data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBatch) {
        const { error } = await supabase
          .from('batches')
          .update({
            name: formData.name,
            start_date: formData.start_date,
            end_date: formData.end_date,
          })
          .eq('id', editingBatch.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('batches').insert([
          {
            name: formData.name,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: 'active',
          },
        ]);

        if (error) throw error;
      }

      fetchBatches();
      closeModal();
    } catch (error) {
      console.error('Error saving batch:', error);
      alert('Failed to save batch');
    }
  };

  const toggleStatus = async (batch: Batch) => {
    try {
      const newStatus = batch.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('batches')
        .update({ status: newStatus })
        .eq('id', batch.id);

      if (!error) {
        fetchBatches();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deleteBatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this batch? This will remove all enrollments.')) {
      return;
    }

    try {
      const { error } = await supabase.from('batches').delete().eq('id', id);
      if (!error) {
        fetchBatches();
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  const openModal = (batch?: Batch) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        name: batch.name,
        start_date: batch.start_date.split('T')[0],
        end_date: batch.end_date.split('T')[0],
        description: batch.description || '',
        status: batch.status as 'active' | 'inactive',
      });
    } else {
      setEditingBatch(null);
      const today = new Date();
      const endDate = addMonths(today, 6);
      setFormData({
        name: '',
        start_date: today.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        description: '',
        status: 'active',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBatch(null);
    setFormData({ name: '', start_date: '', end_date: '', description: '', status: 'active' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Create Batch
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-blue-500">groups</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No batches yet</h3>
          <p className="text-base opacity-60">Create your first batch to get started</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">
                    Batch Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10 dark:divide-white/10">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 font-semibold">{batch.name}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(batch.start_date)}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(batch.end_date)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(batch)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          batch.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {batch.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(batch)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => deleteBatch(batch.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 my-auto">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white pr-2">
                  {editingBatch ? 'Edit Batch' : 'Create New Batch'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-gray-500 text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Batch Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base focus:border-primary focus:ring-0 transition-colors"
                    placeholder="e.g., Batch 2026 - Morning"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Description (Optional)</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base focus:border-primary focus:ring-0 transition-colors resize-none"
                    placeholder="Brief description of this batch..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base focus:border-primary focus:ring-0 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base focus:border-primary focus:ring-0 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Active Status</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">Enable to allow students to access this batch</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.status === 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 dark:bg-primary text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-800 dark:hover:bg-primary-hover transition-colors"
                  >
                    {editingBatch ? 'Update Batch' : 'Create Batch'}
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

export default BatchManagement;
