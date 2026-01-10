import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar, Header } from '../components/ui';
import AdminOverview from '../components/admin/AdminOverview';
import BatchManagement from '../components/admin/BatchManagement';
import StudentManagement from '../components/admin/StudentManagement';
import NotesManagement from '../components/admin/NotesManagement';
import LiveClassManagement from '../components/admin/LiveClassManagement';
import ExamManagement from '../components/admin/ExamManagement';
import ResultsManagement from '../components/admin/ResultsManagement';

type ViewType = 'overview' | 'batches' | 'students' | 'notes' | 'classes' | 'exams' | 'results';

const AdminDashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = (searchParams.get('view') || 'overview') as ViewType;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      icon: 'dashboard',
      path: '/admin?view=overview'
    },
    { 
      id: 'batches', 
      label: 'Batches', 
      icon: 'groups',
      path: '/admin?view=batches'
    },
    { 
      id: 'students', 
      label: 'Students', 
      icon: 'person',
      path: '/admin?view=students'
    },
    { 
      id: 'notes', 
      label: 'Study Materials', 
      icon: 'description',
      path: '/admin?view=notes'
    },
    { 
      id: 'classes', 
      label: 'Live Classes', 
      icon: 'video_call',
      path: '/admin?view=classes'
    },
    { 
      id: 'exams', 
      label: 'Exams', 
      icon: 'quiz',
      path: '/admin?view=exams'
    },
    { 
      id: 'results', 
      label: 'Results', 
      icon: 'grade',
      path: '/admin?view=results'
    },
  ];

  const getViewTitle = () => {
    const titles: Record<ViewType, { title: string; subtitle: string }> = {
      overview: { title: 'Dashboard', subtitle: 'Overview of your learning platform' },
      batches: { title: 'Batch Management', subtitle: 'Manage student batches and enrollments' },
      students: { title: 'Student Management', subtitle: 'Manage student accounts and access' },
      notes: { title: 'Study Materials', subtitle: 'Upload and manage course content' },
      classes: { title: 'Live Classes', subtitle: 'Schedule and manage live sessions' },
      exams: { title: 'Exam Management', subtitle: 'Create and manage assessments' },
      results: { title: 'Results Management', subtitle: 'Review and publish exam results' },
    };
    return titles[activeView];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bg-dark flex">
      <Sidebar
        items={sidebarItems}
        userInfo={{
          name: profile?.full_name || 'Admin',
          role: 'Administrator',
        }}
        onLogout={handleSignOut}
        brandText="VHL"
      />

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Header 
            title={getViewTitle().title} 
            subtitle={getViewTitle().subtitle}
          />

          <div>
            {activeView === 'overview' && <AdminOverview />}
            {activeView === 'batches' && <BatchManagement />}
            {activeView === 'students' && <StudentManagement />}
            {activeView === 'notes' && <NotesManagement />}
            {activeView === 'classes' && <LiveClassManagement />}
            {activeView === 'exams' && <ExamManagement />}
            {activeView === 'results' && <ResultsManagement />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
          {activeTab === 'exams' && <ExamManagement />}
          {activeTab === 'results' && <ResultsManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
