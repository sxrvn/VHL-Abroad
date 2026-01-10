import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Exam, ExamAttempt } from '../../types';
import { useNavigate } from 'react-router-dom';
import { isBatchExpired, formatDuration } from '../../lib/utils';
import { Card, Badge, Button, EmptyState, LoadingSpinner } from '../ui';

const ExamsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [batchExpired, setBatchExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: enrollment } = await supabase
        .from('batch_students')
        .select('*')
        .eq('student_id', user?.id)
        .single();

      if (enrollment) {
        setBatchExpired(isBatchExpired(enrollment.access_expiry));
        
        const [examsRes, attemptsRes] = await Promise.all([
          supabase.from('exams').select('*').eq('batch_id', enrollment.batch_id).eq('is_published', true).order('created_at', { ascending: false }),
          supabase.from('exam_attempts').select('*').eq('student_id', user?.id),
        ]);

        if (examsRes.data) setExams(examsRes.data);
        if (attemptsRes.data) setAttempts(attemptsRes.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (examId: string) => {
    const attempt = attempts.find((a) => a.exam_id === examId);
    if (!attempt) return { status: 'not-started', label: 'Not Started', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
    if (attempt.is_submitted) return { status: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    return { status: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
  };

  const handleExamAction = (exam: Exam) => {
    const attempt = attempts.find((a) => a.exam_id === exam.id);
    if (attempt?.is_submitted) {
      // View result - handled in Results tab
      return;
    }
    navigate(`/exam/${exam.id}`);
  };

  if (loading) return <LoadingSpinner />;

  if (batchExpired) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-500">
        <EmptyState
          icon="lock"
          title="Access Expired"
          description="Your batch access has expired. Please contact support to renew."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {exams.length === 0 ? (
        <Card className="text-center py-16">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-purple-500">quiz</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No Exams Available</h3>
          <p className="text-base opacity-60">No exams have been published yet. Check back later!</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {exams.map((exam) => {
            const examStatus = getExamStatus(exam.id);
            const badgeVariant = 
              examStatus.status === 'completed' ? 'success' : 
              examStatus.status === 'in-progress' ? 'warning' : 'info';
            
            return (
              <Card key={exam.id} hover className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex flex-col h-full">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="size-12 sm:size-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/10 flex-shrink-0">
                      <span className="material-symbols-outlined text-xl sm:text-2xl">quiz</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-black tracking-tight mb-1.5 sm:mb-2 line-clamp-2">{exam.title}</h3>
                      <Badge variant={badgeVariant} icon={examStatus.status === 'completed' ? 'check_circle' : examStatus.status === 'in-progress' ? 'pending' : 'schedule'}>
                        {examStatus.label}
                      </Badge>
                    </div>
                  </div>
                  
                  {exam.description && (
                    <p className="text-xs sm:text-sm opacity-70 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{exam.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-100 dark:bg-white/10 text-xs sm:text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm sm:text-base text-primary">schedule</span>
                      <span>{formatDuration(exam.duration_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-100 dark:bg-white/10 text-xs sm:text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm sm:text-base text-primary">assignment</span>
                      <span>{exam.total_marks} marks</span>
                    </div>
                  </div>
                  
                  {examStatus.status !== 'completed' && (
                    <Button
                      onClick={() => handleExamAction(exam)}
                      variant={examStatus.status === 'in-progress' ? 'success' : 'primary'}
                      icon={examStatus.status === 'in-progress' ? 'resume' : 'play_arrow'}
                      size="lg"
                      fullWidth
                      className="mt-auto"
                    >
                      {examStatus.status === 'in-progress' ? 'Resume Exam' : 'Start Exam'}
                    </Button>
                  )}
                  {examStatus.status === 'completed' && (
                    <div className="mt-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-bold">
                      <span className="material-symbols-outlined">check_circle</span>
                      Exam Completed
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamsList;
