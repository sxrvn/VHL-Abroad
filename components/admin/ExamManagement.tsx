import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Exam, Batch, Question } from '../../types';

interface ExamManagementProps {
  onManageQuestions: (examId: string) => void;
}

const ExamManagement: React.FC<ExamManagementProps> = ({ onManageQuestions }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    batch_id: '',
    duration_minutes: 60,
    total_marks: 100,
    passing_marks: 40,
    is_published: false,
    publish_result: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, batchesRes] = await Promise.all([
        supabase.from('exams').select(`*, batch:batches(*)`).order('created_at', { ascending: false }),
        supabase.from('batches').select('*').order('name'),
      ]);
      if (examsRes.data) setExams(examsRes.data);
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
      if (editingExam) {
        // Update exam
        const { data: updatedExam } = await supabase
          .from('exams')
          .update(formData)
          .eq('id', editingExam.id)
          .select()
          .single();
      } else {
        // Insert new exam
        await supabase
          .from('exams')
          .insert([formData])
          .select()
          .single();
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save');
    }
  };

  const togglePublish = async (exam: Exam) => {
    await supabase.from('exams').update({ is_published: !exam.is_published }).eq('id', exam.id);
    fetchData();
  };

  const toggleResultVisibility = async (exam: Exam) => {
    await supabase.from('exams').update({ publish_result: !exam.publish_result }).eq('id', exam.id);
    fetchData();
  };

  const deleteExam = async (id: string) => {
    if (!confirm('Delete exam and all questions?')) return;
    
    try {
      // Delete the exam
      await supabase.from('exams').delete().eq('id', id);

      fetchData();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Failed to delete exam');
    }
  };

  const openModal = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        title: exam.title,
        description: exam.description || '',
        batch_id: exam.batch_id,
        duration_minutes: exam.duration_minutes,
        total_marks: exam.total_marks,
        passing_marks: exam.passing_marks || Math.floor(exam.total_marks * 0.4),
        is_published: exam.is_published,
        publish_result: exam.publish_result,
      });
    } else {
      setEditingExam(null);
      setFormData({ title: '', description: '', batch_id: '', duration_minutes: 60, total_marks: 100, passing_marks: 40, is_published: false, publish_result: false });
    }
    setShowModal(true);
  };

  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});

  const filteredExams = selectedBatch === 'all' 
    ? exams 
    : exams.filter(e => e.batch_id === selectedBatch);

  useEffect(() => {
    const fetchQuestionCounts = async () => {
      const counts: Record<string, number> = {};
      for (const exam of exams) {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('exam_id', exam.id);
        counts[exam.id] = count || 0;
      }
      setQuestionCounts(counts);
    };
    if (exams.length > 0) fetchQuestionCounts();
  }, [exams]);

  const closeModal = () => {
    setShowModal(false);
    setEditingExam(null);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e] px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] transition-all">
          <span className="material-symbols-outlined">add</span>Create Exam
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
        <span className="text-sm opacity-60">{filteredExams.length} {filteredExams.length === 1 ? 'exam' : 'exams'}</span>
      </div>

      {filteredExams.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-purple-500">quiz</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No exams found</h3>
          <p className="text-base opacity-60">Create your first exam to get started</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10 overflow-hidden">
          {/* Desktop Table Header - Hidden on Mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-charcoal/10 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
            <div className="col-span-3 text-sm font-bold opacity-60 uppercase tracking-wider">Exam</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider">Batch</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider">Questions</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider">Duration</div>
            <div className="col-span-1 text-sm font-bold opacity-60 uppercase tracking-wider">Status</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider text-right">Actions</div>
          </div>
          
          {/* Table Body / Card List */}
          <div className="divide-y divide-charcoal/10 dark:divide-white/10">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="md:grid md:grid-cols-12 gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-xl text-yellow-600">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base mb-1">{exam.title}</h4>
                      <p className="text-xs opacity-60">{exam.total_marks} marks · Pass: {exam.passing_marks || Math.floor(exam.total_marks * 0.4)}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onManageQuestions(exam.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title="Manage Questions"
                      >
                        <span className="material-symbols-outlined text-lg">list</span>
                      </button>
                      <button
                        onClick={() => openModal(exam)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base opacity-60">groups</span>
                      <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-semibold">
                        {exam.batch?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 opacity-70">
                        <span className="material-symbols-outlined text-base">quiz</span>
                        <span>{questionCounts[exam.id] || 0} questions</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-70">
                        <span className="material-symbols-outlined text-base">timer</span>
                        <span>{exam.duration_minutes} min</span>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${exam.is_published ? 'bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e]' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {exam.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop Grid Layout */}
                <div className="hidden md:contents">
                  {/* Exam Column */}
                  <div className="col-span-3 flex items-center gap-3">
                  <div className="size-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-xl text-yellow-600">description</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{exam.title}</h4>
                    <p className="text-xs opacity-60">{exam.total_marks} marks · Pass: {exam.passing_marks || Math.floor(exam.total_marks * 0.4)}</p>
                  </div>
                </div>

                {/* Batch Column */}
                <div className="col-span-2 flex items-center">
                  <span className="px-3 py-1 bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e] rounded-full text-sm font-semibold">
                    {exam.batch?.name || 'N/A'}
                  </span>
                </div>

                {/* Questions Column */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm font-medium opacity-70">
                    {questionCounts[exam.id] || 0} questions
                  </span>
                </div>

                {/* Duration Column */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm font-medium opacity-70">{exam.duration_minutes} min</span>
                </div>

                {/* Status Column */}
                <div className="col-span-1 flex items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${exam.is_published ? 'bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e]' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {exam.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                  {/* Actions Column */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => onManageQuestions(exam.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                      title="Manage Questions"
                    >
                      <span className="material-symbols-outlined text-lg">list</span>
                    </button>
                    <button
                      onClick={() => openModal(exam)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{editingExam ? 'Edit Exam' : 'Create New Exam'}</h3>
                <button onClick={closeModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Exam Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-0 transition-colors" placeholder="e.g., Physics Unit Test 1" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Description (Optional)</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-0 transition-colors resize-none" placeholder="Instructions or topics covered..." rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Batch</label>
                  <select value={formData.batch_id} onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-0 transition-colors" required>
                    <option value="">Select a batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Duration (Min)</label>
                    <input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-0 transition-colors" min="1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Total Marks</label>
                    <input type="number" value={formData.total_marks} onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-0 transition-colors" min="1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Passing Marks</label>
                    <input type="number" value={formData.passing_marks || Math.floor(formData.total_marks * 0.4)} onChange={(e) => setFormData({ ...formData, passing_marks: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-0 transition-colors" min="1" />
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Show Results</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Students can view their results after submission</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.publish_result} onChange={(e) => setFormData({ ...formData, publish_result: e.target.checked })} className="sr-only peer" />
                      <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Publish Exam</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Make visible to students (add questions first)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="sr-only peer" />
                      <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-gray-900 dark:bg-primary text-white rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-primary-hover transition-colors">{editingExam ? 'Update Exam' : 'Create Exam'}</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamManagement;
