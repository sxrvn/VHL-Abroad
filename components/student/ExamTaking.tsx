import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Exam, Question, ExamAttempt } from '../../types';
import { LoadingSpinner } from '../ui';

interface ExamTakingProps {
  examId: string;
  onComplete: (score: number, totalMarks: number, percentage: number) => void;
  onBack: () => void;
}

const ExamTaking: React.FC<ExamTakingProps> = ({ examId, onComplete, onBack }) => {
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (examId && user) initExam();
    
    // Prevent browser back/refresh/close during exam and auto-submit
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitting && attempt && !attempt.is_submitted) {
        e.preventDefault();
        e.returnValue = 'Your exam is in progress. Are you sure you want to leave?';
        // Auto-submit exam when tab is closing
        autoSubmit();
      }
    };
    
    // Auto-submit when user navigates away or closes page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !submitting && attempt && !attempt.is_submitted) {
        autoSubmit();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examId, user, submitting, attempt]);

  const initExam = async () => {
    try {
      const [examRes, questionsRes, attemptRes] = await Promise.all([
        supabase.from('exams').select('*').eq('id', examId).single(),
        supabase.from('questions').select('*').eq('exam_id', examId).order('order_index'),
        supabase.from('exam_attempts').select('*').eq('exam_id', examId).eq('student_id', user?.id).single(),
      ]);

      if (!examRes.data) {
        alert('Exam not found');
        onBack();
        return;
      }

      setExam(examRes.data);
      setQuestions(questionsRes.data || []);

      if (attemptRes.data) {
        if (attemptRes.data.is_submitted) {
          alert('You have already submitted this exam');
          onBack();
          return;
        }
        setAttempt(attemptRes.data);
        setAnswers(attemptRes.data.answers || {});
        const elapsed = Math.floor((Date.now() - new Date(attemptRes.data.started_at).getTime()) / 1000);
        const remaining = Math.max(0, examRes.data.duration_minutes * 60 - elapsed);
        setTimeLeft(remaining);
      } else {
        const { data: newAttempt } = await supabase
          .from('exam_attempts')
          .insert([{ exam_id: examId, student_id: user?.id, answers: {} }])
          .select()
          .single();
        setAttempt(newAttempt);
        setTimeLeft(examRes.data.duration_minutes * 60);
      }

      setLoading(false);
      startAutoSave();
      startTimer();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load exam');
      onBack();
    }
  };

  const startTimer = () => {
    timerInterval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startAutoSave = () => {
    autoSaveInterval.current = setInterval(() => {
      saveAnswers();
    }, 2000);
  };

  const saveAnswers = useCallback(async () => {
    if (!attempt || submitting) return;
    try {
      await supabase
        .from('exam_attempts')
        .update({ answers })
        .eq('id', attempt.id);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [answers, attempt, submitting]);

  const calculateScore = (studentAnswers: Record<string, string>, examQuestions: Question[]) => {
    let score = 0;
    examQuestions.forEach((q) => {
      if (studentAnswers[q.id] === q.correct_option) {
        score += q.marks;
      }
    });
    return score;
  };

  const submitExam = async () => {
    setShowReviewModal(false);
    setSubmitting(true);

    try {
      const score = calculateScore(answers, questions);
      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
      const percentage = (score / totalMarks) * 100;

      await supabase
        .from('exam_attempts')
        .update({ answers, is_submitted: true, submitted_at: new Date().toISOString() })
        .eq('id', attempt!.id);

      await supabase.from('results').insert([{
        student_id: user?.id,
        exam_id: examId,
        score,
        total_marks: totalMarks,
        percentage,
      }]);

      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);

      onComplete(score, totalMarks, percentage);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit exam');
      setSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    setShowReviewModal(true);
  };

  const autoSubmit = async () => {
    if (submitting || !attempt) return;
    setSubmitting(true);
    await submitExam();
  };

  const handleAnswerChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-bg-dark border-b border-charcoal/10 dark:border-white/10 shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={onBack}
                className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Back to exams"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="text-base sm:text-xl font-bold truncate">{exam?.title}</h1>
            </div>
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap ${timeLeft < 300 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-primary/10 text-primary'}`}>
              <span className="material-symbols-outlined text-lg sm:text-xl">schedule</span>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white dark:bg-white/5 rounded-xl border border-charcoal/10 dark:border-white/10 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-4">
                <span className="font-bold text-primary text-sm sm:text-base">Q{idx + 1}.</span>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-base sm:text-lg leading-relaxed">{q.question}</p>
                      <p className="text-xs opacity-60 mt-1">{q.marks} mark(s)</p>
                    </div>
                    <button
                      onClick={() => toggleMarkForReview(q.id)}
                      className={`self-start flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        markedForReview.has(q.id)
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {markedForReview.has(q.id) ? 'flag' : 'outlined_flag'}
                      </span>
                      <span className="hidden sm:inline">Review</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5 sm:space-y-3 ml-0 sm:ml-8">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      answers[q.id] === opt
                        ? 'border-primary bg-primary/10'
                        : 'border-charcoal/10 dark:border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 accent-primary cursor-pointer"
                    />
                    <span className="flex-1 text-sm sm:text-base leading-relaxed">
                      <strong>{opt}.</strong> {q[`option_${opt.toLowerCase()}` as keyof Question]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 bg-white dark:bg-white/5 rounded-xl border border-charcoal/10 dark:border-white/10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold opacity-60">Answered: {Object.keys(answers).length}/{questions.length}</p>
              {markedForReview.size > 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  {markedForReview.size} question(s) marked for review
                </p>
              )}
              <p className="text-xs opacity-40 mt-1">Auto-saving every 2 seconds</p>
            </div>
            <button
              onClick={handleSubmitClick}
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">send</span>
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowReviewModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white dark:bg-bg-dark rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold">Review Before Submit</h3>
                <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{Object.keys(answers).length}</p>
                    <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 mt-1">Answered</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{questions.length - Object.keys(answers).length}</p>
                    <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 mt-1">Unanswered</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{markedForReview.size}</p>
                    <p className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400 mt-1">For Review</p>
                  </div>
                </div>

                {markedForReview.size > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Questions marked for review:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(markedForReview).map((qId) => {
                        const qIndex = questions.findIndex(q => q.id === qId);
                        return (
                          <span key={qId} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 rounded text-sm">
                            Q{qIndex + 1}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {questions.length - Object.keys(answers).length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">Unanswered questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {questions.filter(q => !answers[q.id]).map((q) => {
                        const qIndex = questions.findIndex(quest => quest.id === q.id);
                        return (
                          <span key={q.id} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 rounded text-sm">
                            Q{qIndex + 1}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">warning</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Important</p>
                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                      Once you submit, you cannot change your answers. Make sure you've reviewed all questions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-3 border border-charcoal/10 dark:border-white/10 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  Continue Exam
                </button>
                <button
                  onClick={submitExam}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover disabled:opacity-50 shadow-lg shadow-primary/20 transition-all"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submit'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamTaking;
