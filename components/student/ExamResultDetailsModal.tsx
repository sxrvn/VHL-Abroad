import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal, Badge, LoadingSpinner } from '../ui';
import { Question, ExamAttempt } from '../../types';
import { formatDate } from '../../lib/utils';

interface ExamResultDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    id: string;
    student_id: string;
    exam_id: string;
    score: number;
    total_marks: number;
    percentage: number;
    created_at: string;
    exam?: {
      title: string;
      publish_result?: boolean;
    };
  };
}

interface QuestionWithAnswer extends Question {
  selectedAnswer?: string;
  isCorrect?: boolean;
}

const ExamResultDetailsModal: React.FC<ExamResultDetailsModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchExamDetails();
    }
  }, [isOpen, result.exam_id, result.student_id]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch questions for this exam
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', result.exam_id)
        .order('created_at', { ascending: true });

      // Fetch exam attempt to get student's answers
      const { data: attemptData } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', result.exam_id)
        .eq('student_id', result.student_id)
        .single();

      if (questionsData && attemptData) {
        setAttempt(attemptData);
        
        // Map questions with student answers and correctness
        const questionsWithAnswers = questionsData.map(q => {
          const selectedAnswer = attemptData.answers?.[q.id] || '';
          const isCorrect = selectedAnswer === q.correct_option;
          
          return {
            ...q,
            selectedAnswer,
            isCorrect,
          };
        });

        setQuestions(questionsWithAnswers);
      }
    } catch (error) {
      console.error('Error fetching exam details:', error);
    } finally {
      setLoading(false);
    }
  };

  const passed = result.percentage >= 50;
  const grade = 
    result.percentage >= 90 ? 'A+' :
    result.percentage >= 80 ? 'A' :
    result.percentage >= 70 ? 'B' :
    result.percentage >= 60 ? 'C' :
    result.percentage >= 50 ? 'D' : 'F';

  const correctAnswers = questions.filter(q => q.isCorrect).length;
  const wrongAnswers = questions.filter(q => !q.isCorrect && q.selectedAnswer).length;
  const unanswered = questions.filter(q => !q.selectedAnswer).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Exam Results">
      <div className="space-y-4">
        {/* Header - Simplified */}
        <div className="rounded-lg bg-gray-50 dark:bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-lg sm:text-xl font-bold flex-1">{result.exam?.title}</h3>
            <Badge variant={passed ? 'success' : 'error'} size="sm">
              {passed ? 'PASS' : 'FAIL'}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm opacity-60">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {formatDate(result.created_at)}
            </span>
            {attempt?.submitted_at && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {new Date(attempt.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Simplified Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
            <p className="text-[10px] sm:text-xs font-semibold opacity-60 mb-1">Score</p>
            <p className="text-lg sm:text-xl font-bold">
              {result.score}<span className="text-xs opacity-50">/{result.total_marks}</span>
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
            <p className="text-[10px] sm:text-xs font-semibold opacity-60 mb-1">Percentage</p>
            <p className="text-lg sm:text-xl font-bold">{result.percentage.toFixed(1)}%</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
            <p className="text-[10px] sm:text-xs font-semibold opacity-60 mb-1">Grade</p>
            <p className={`text-lg sm:text-xl font-bold ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {grade}
            </p>
          </div>
        </div>

        {/* Simplified Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
            <span className="font-medium opacity-60">Performance</span>
            <span className="font-bold">{result.percentage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                passed ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.percentage}%` }}
            />
          </div>
        </div>

        {/* Simplified Answer Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <div className="size-8 sm:size-10 mx-auto mb-2 rounded-lg bg-green-500 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg sm:text-xl">check</span>
            </div>
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Correct</p>
            <p className="text-lg sm:text-xl font-bold text-green-800 dark:text-green-300">{correctAnswers}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
            <div className="size-8 sm:size-10 mx-auto mb-2 rounded-lg bg-red-500 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
            </div>
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Wrong</p>
            <p className="text-lg sm:text-xl font-bold text-red-800 dark:text-red-300">{wrongAnswers}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
            <div className="size-8 sm:size-10 mx-auto mb-2 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg sm:text-xl">remove</span>
            </div>
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">Skipped</p>
            <p className="text-lg sm:text-xl font-bold text-orange-800 dark:text-orange-300">{unanswered}</p>
          </div>
        </div>

        {/* Question-wise Performance - Simplified */}
        <div>
          <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">quiz</span>
            Questions ({questions.length})
          </h3>
          
          {loading ? (
            <div className="py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {questions.map((question, index) => (
                <div 
                  key={question.id}
                  className={`p-3 sm:p-4 rounded-lg border ${
                    question.isCorrect 
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-500/30'
                      : question.selectedAnswer
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30'
                      : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-500/30'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-2 sm:gap-3 mb-3">
                    <div className={`size-6 sm:size-7 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 ${
                      question.isCorrect 
                        ? 'bg-green-500'
                        : question.selectedAnswer
                        ? 'bg-red-500'
                        : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <p className="text-sm sm:text-base font-medium flex-1">{question.question}</p>
                    <span className={`material-symbols-outlined text-lg sm:text-xl shrink-0 ${
                      question.isCorrect 
                        ? 'text-green-600 dark:text-green-400'
                        : question.selectedAnswer
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {question.isCorrect ? 'check_circle' : question.selectedAnswer ? 'cancel' : 'help'}
                    </span>
                  </div>
                  
                  {/* Options - Simplified */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {['option_a', 'option_b', 'option_c', 'option_d'].map((optionKey) => {
                      const optionValue = question[optionKey as keyof Question] as string;
                      const optionLabel = optionKey.split('_')[1].toUpperCase();
                      const isCorrect = optionLabel === question.correct_option;
                      const isSelected = optionLabel === question.selectedAnswer;
                      
                      return (
                        <div 
                          key={optionKey}
                          className={`p-2 rounded-md flex items-start gap-2 text-xs sm:text-sm ${
                            isCorrect 
                              ? 'bg-green-100 dark:bg-green-900/30 font-medium'
                              : isSelected 
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : 'bg-white/50 dark:bg-white/5'
                          }`}
                        >
                          <span className="font-bold shrink-0">{optionLabel}.</span>
                          <span className="flex-1">{optionValue}</span>
                          {isCorrect && (
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm shrink-0">
                              check
                            </span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-sm shrink-0">
                              close
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {!question.selectedAnswer && (
                    <div className="mt-2 flex items-center gap-1.5 text-orange-700 dark:text-orange-400 text-xs sm:text-sm">
                      <span className="material-symbols-outlined text-sm">info</span>
                      <span>Not answered</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ExamResultDetailsModal;
