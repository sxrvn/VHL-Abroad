import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar, Header, DashboardLayout } from '../components/ui';
import StudentOverview from '../components/student/StudentOverview';
import LiveClasses from '../components/student/LiveClasses';
import Notes from '../components/student/Notes';
import ExamsList from '../components/student/ExamsList';
import ResultsList from '../components/student/ResultsList';
import Updates from '../components/student/Updates';

type ViewType = 'overview' | 'classes' | 'videos' | 'exams' | 'results' | 'updates';

const StudentDashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = (searchParams.get('view') || 'overview') as ViewType;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const setActiveView = (view: ViewType) => {
    setSearchParams({ view });
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
        <Header 
          title={getViewTitle().title} 
          subtitle={getViewTitle().subtitle}
        />

        <div className="mt-6">
          {activeView === 'overview' && <StudentOverview />}
          {activeView === 'classes' && <LiveClasses />}
          {activeView === 'videos' && <Notes />}
          {activeView === 'exams' && <ExamsList />}
          {activeView === 'results' && <ResultsList />}
          {activeView === 'updates' && <Updates />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
