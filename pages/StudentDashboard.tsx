import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar, Header, DashboardLayout } from '../components/ui';
import StudentOverview from '../components/student/StudentOverview';
import LiveClasses from '../components/student/LiveClasses';
import Notes from '../components/student/NotesNew';
import ExamsList from '../components/student/ExamsList';
import ExamTaking from '../components/student/ExamTaking';
import ExamResult from '../components/student/ExamResult';
import ResultsList from '../components/student/ResultsList';
import Updates from '../components/student/Updates';
import { supabase } from '../lib/supabase';

type ViewType = 'overview' | 'classes' | 'videos' | 'exams' | 'results' | 'updates' | 'exam-taking' | 'exam-result';

const StudentDashboard: React.FC = () => {
  const { signOut, profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = (searchParams.get('view') || 'overview') as ViewType;
  const examId = searchParams.get('examId');
  const [examResult, setExamResult] = useState<{ examTitle: string; score: number; totalMarks: number; percentage: number } | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const setActiveView = (view: ViewType, params?: Record<string, string>) => {
    const newParams: Record<string, string> = { view, ...params };
    setSearchParams(newParams);
  };

  const handleExamStart = (examId: string) => {
    setActiveView('exam-taking', { examId });
  };

  const handleExamComplete = (examTitle: string, score: number, totalMarks: number, percentage: number) => {
    setExamResult({ examTitle, score, totalMarks, percentage });
    setActiveView('exam-result');
  };

  const handleBackToExams = () => {
    setExamResult(null);
    setActiveView('exams');
  };

  const handleViewResults = () => {
    setExamResult(null);
    setActiveView('results');
  };

  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      icon: 'dashboard',
      path: '/dashboard?view=overview'
    },
    { 
      id: 'classes', 
      label: 'Live Classes', 
      icon: 'video_call',
      path: '/dashboard?view=classes'
    },
    { 
      id: 'videos', 
      label: 'Study Notes', 
      icon: 'description',
      path: '/dashboard?view=videos'
    },
    { 
      id: 'exams', 
      label: 'Exams', 
      icon: 'quiz',
      path: '/dashboard?view=exams'
    },
    { 
      id: 'results', 
      label: 'Results', 
      icon: 'grade',
      path: '/dashboard?view=results'
    },
    { 
      id: 'updates', 
      label: 'Updates', 
      icon: 'notifications',
      path: '/dashboard?view=updates'
    },
  ];

  const getViewTitle = () => {
    const titles: Record<ViewType, { title: string; subtitle: string }> = {
      overview: { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your learning overview' },
      classes: { title: 'Live Classes', subtitle: 'Join your scheduled live sessions' },
      videos: { title: 'Study Notes', subtitle: 'Access your course materials and resources' },
      exams: { title: 'Exams', subtitle: 'Take tests and track your progress' },
      'exam-taking': { title: 'Taking Exam', subtitle: 'Answer all questions carefully' },
      'exam-result': { title: 'Exam Result', subtitle: 'Your exam has been submitted successfully' },
      results: { title: 'Results', subtitle: 'View your exam performance and scores' },
      updates: { title: 'Updates', subtitle: 'Stay informed with the latest announcements' },
    };
    return titles[activeView];
  };

  return (
    <DashboardLayout
      brandText="VHL"
      sidebar={
        <Sidebar
          items={sidebarItems}
          userInfo={{
            name: profile?.full_name || 'Student',
            role: 'Student',
          }}
          onLogout={handleSignOut}
          brandText="VHL"
          isMobileOpen={false}
          setIsMobileOpen={() => {}}
        />
      }
    >
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
        {activeView !== 'exam-taking' && activeView !== 'exam-result' && (
          <Header 
            title={getViewTitle().title} 
            subtitle={getViewTitle().subtitle}
          />
        )}

        <div className={activeView === 'exam-taking' || activeView === 'exam-result' ? '' : 'mt-6'}>
          {activeView === 'overview' && <StudentOverview />}
          {activeView === 'classes' && <LiveClasses />}
          {activeView === 'videos' && <Notes />}
          {activeView === 'exams' && <ExamsList onExamStart={handleExamStart} />}
          {activeView === 'exam-taking' && examId && (
            <ExamTaking 
              examId={examId} 
              onComplete={(score, totalMarks, percentage) => {
                // Get exam title
                (async () => {
                  const { data } = await supabase.from('exams').select('title').eq('id', examId).single();
                  handleExamComplete(data?.title || 'Exam', score, totalMarks, percentage);
                })();
              }}
              onBack={handleBackToExams}
            />
          )}
          {activeView === 'exam-result' && examResult && (
            <ExamResult
              examTitle={examResult.examTitle}
              score={examResult.score}
              totalMarks={examResult.totalMarks}
              percentage={examResult.percentage}
              onBackToExams={handleBackToExams}
              onViewResults={handleViewResults}
            />
          )}
          {activeView === 'results' && <ResultsList />}
          {activeView === 'updates' && <Updates />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
