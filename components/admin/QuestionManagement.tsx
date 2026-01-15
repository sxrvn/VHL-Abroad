import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Question } from '../../types';

interface QuestionManagementProps {
  examId: string;
  onBack: () => void;
}

const QuestionManagement: React.FC<QuestionManagementProps> = ({ examId, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A' as 'A' | 'B' | 'C' | 'D',
    marks: 1,
    order_index: 0,
  });

  useEffect(() => {
    if (examId) fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      const [questionsRes, examRes] = await Promise.all([
        supabase.from('questions').select('*').eq('exam_id', examId).order('order_index'),
        supabase.from('exams').select('title').eq('id', examId).single(),
      ]);
      if (questionsRes.data) setQuestions(questionsRes.data);
      if (examRes.data) setExamTitle(examRes.data.title);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, exam_id: examId };
      if (editingQuestion) {
        await supabase.from('questions').update(data).eq('id', editingQuestion.id);
      } else {
        await supabase.from('questions').insert([data]);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save');
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await supabase.from('questions').delete().eq('id', id);
    fetchData();
  };

  const openModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question: question.question,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_option: question.correct_option,
        marks: question.marks,
        order_index: question.order_index,
      });
    } else {
      setEditingQuestion(null);
      setFormData({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', marks: 1, order_index: questions.length });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
  };

  const moveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const sortedQuestions = [...questions].sort((a, b) => a.order_index - b.order_index);
    const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortedQuestions.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentQuestion = sortedQuestions[currentIndex];
    const targetQuestion = sortedQuestions[targetIndex];

    try {
      await Promise.all([
        supabase.from('questions').update({ order_index: targetQuestion.order_index }).eq('id', currentQuestion.id),
        supabase.from('questions').update({ order_index: currentQuestion.order_index }).eq('id', targetQuestion.id),
      ]);
      fetchData();
    } catch (error) {
      console.error('Error reordering questions:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="size-12 rounded-xl bg-white dark:bg-white/5 hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10 flex items-center justify-center transition-all hover:scale-105">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 mx-4">
          <h2 className="text-xl font-bold">{examTitle}</h2>
          <p className="text-sm opacity-60">Manage exam questions</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] transition-all">
          <span className="material-symbols-outlined">add</span>Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-purple-500">help</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No questions yet</h3>
        </div>
      ) : (
        <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10 p-6 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Q{idx + 1}.</span>
                      <span className="text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full">{q.marks} mark(s)</span>
                    </div>
                    <p className="font-bold text-lg mb-4">{q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <div key={opt} className={`p-3 rounded-xl text-sm font-semibold transition-all ${q.correct_option === opt ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500 shadow-lg shadow-green-500/10' : 'bg-gray-50 dark:bg-white/5 border border-charcoal/10 dark:border-white/10'}`}>
                          <span className="font-black text-primary">{opt}.</span> {q[`option_${opt.toLowerCase()}` as keyof Question]}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => moveQuestion(q.id, 'up')}
                        disabled={idx === 0}
                        className="size-9 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105"
                        title="Move up"
                      >
                        <span className="material-symbols-outlined text-base">arrow_upward</span>
                      </button>
                      <button
                        onClick={() => moveQuestion(q.id, 'down')}
                        disabled={idx === questions.length - 1}
                        className="size-9 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105"
                        title="Move down"
                      >
                        <span className="material-symbols-outlined text-base">arrow_downward</span>
                      </button>
                    </div>
                    <button onClick={() => openModal(q)} className="size-10 rounded-lg bg-blue-500/10 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 flex items-center justify-center transition-all group hover:scale-105">
                      <span className="material-symbols-outlined text-base text-blue-500 group-hover:scale-110 transition-transform">edit</span>
                    </button>
                    <button onClick={() => deleteQuestion(q.id)} className="size-10 rounded-lg bg-red-500/10 hover:bg-gradient-to-br hover:from-red-500/20 hover:to-pink-500/20 flex items-center justify-center transition-all group hover:scale-105">
                      <span className="material-symbols-outlined text-base text-red-500 group-hover:scale-110 transition-transform">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {showModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-bg-dark rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
                  <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Question</label>
                    <textarea value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary" rows={3} required />
                  </div>
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt}>
                      <label className="block text-sm font-semibold mb-2">Option {opt}</label>
                      <input type="text" value={formData[`option_${opt.toLowerCase()}` as keyof typeof formData] as string} onChange={(e) => setFormData({ ...formData, [`option_${opt.toLowerCase()}`]: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary" required />
                    </div>
                  ))}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Correct Answer</label>
                      <select value={formData.correct_option} onChange={(e) => setFormData({ ...formData, correct_option: e.target.value as 'A' | 'B' | 'C' | 'D' })} className="w-full pl-4 pr-10 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary" required>
                        {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Marks</label>
                      <input type="number" value={formData.marks} onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary" min="1" required />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-charcoal/10 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover">{editingQuestion ? 'Update' : 'Create'}</button>
                  </div>
                </form>
              </div>
            </div>
        </>
      )}
    </div>
  );
};

export default QuestionManagement;
