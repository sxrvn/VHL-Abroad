import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar, Header, Card, DashboardLayout } from '../components/ui';
import AdminOverview from '../components/admin/AdminOverview';
import BatchManagement from '../components/admin/BatchManagement';
import StudentManagement from '../components/admin/StudentManagement';
import NotesManagement from '../components/admin/NotesManagement';
import LiveClassManagement from '../components/admin/LiveClassManagement';
import ExamManagement from '../components/admin/ExamManagement';
import ResultsManagement from '../components/admin/ResultsManagement.tsx';
import NotificationManagement from '../components/admin/NotificationManagement';

type ViewType = 'overview' | 'batches' | 'students' | 'notes' | 'classes' | 'exams' | 'results' | 'notifications' | 'guide';

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
      id: 'classes', 
      label: 'Live Classes', 
      icon: 'video_call',
      path: '/admin?view=classes'
    },
    { 
      id: 'notes', 
      label: 'Videos', 
      icon: 'play_circle',
      path: '/admin?view=notes'
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
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: 'notifications',
      path: '/admin?view=notifications'
    },
    { 
      id: 'guide', 
      label: 'Quick Start Guide', 
      icon: 'help',
      path: '/admin?view=guide'
    },
  ];

  const getViewTitle = () => {
    const titles: Record<ViewType, { title: string; subtitle: string }> = {
      overview: { title: 'Admin Dashboard', subtitle: 'Manage your teaching portal and track student activity.' },
      batches: { title: 'Batch Management', subtitle: 'Manage student batches and enrollments' },
      students: { title: 'Student Management', subtitle: 'Manage student accounts and access' },
      notes: { title: 'Video Management', subtitle: 'Upload and manage video content' },
      classes: { title: 'Live Classes', subtitle: 'Schedule and manage live sessions' },
      exams: { title: 'Exam Management', subtitle: 'Create and manage assessments' },
      results: { title: 'Results Management', subtitle: 'Review and publish exam results' },
      notifications: { title: 'Notifications', subtitle: 'View and manage system notifications' },
      guide: { title: 'Quick Start Guide', subtitle: 'Get started with your admin portal' },
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
            name: profile?.full_name || 'Admin',
            role: 'Administrator',
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
          {activeView === 'overview' && <AdminOverview />}
          {activeView === 'batches' && <BatchManagement />}
          {activeView === 'students' && <StudentManagement />}
          {activeView === 'notes' && <NotesManagement />}
          {activeView === 'classes' && <LiveClassManagement />}
          {activeView === 'exams' && <ExamManagement />}
          {activeView === 'results' && <ResultsManagement />}
          {activeView === 'notifications' && <NotificationManagement />}
          {activeView === 'guide' && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl text-primary">rocket_launch</span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome to VHL Admin Portal</h2>
                    <p className="text-sm sm:text-base opacity-70">Follow these steps to get started with managing your teaching portal</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_one</span>
                  Create Batches
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Start by creating batches to organize your students. Each batch can have multiple students enrolled.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Go to the <strong>Batches</strong> section from the sidebar</li>
                  <li>Click the <strong>Add New Batch</strong> button</li>
                  <li>Enter batch details like name, description, and dates</li>
                  <li>Batches help organize students by course or semester</li>
                </ul>
              </Card>

              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_two</span>
                  Add Students
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Add students to your portal and assign them to appropriate batches.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Navigate to the <strong>Students</strong> section</li>
                  <li>Click <strong>Add New Student</strong></li>
                  <li>Fill in student information and credentials</li>
                  <li>Assign students to one or more batches</li>
                  <li>Students can log in using their assigned credentials</li>
                </ul>
              </Card>

              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_3</span>
                  Upload Content
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Share educational content with your students through videos.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Go to <strong>Videos</strong> section</li>
                  <li>Upload video content or add YouTube links</li>
                  <li>Assign videos to specific batches</li>
                  <li>Videos will be available to students in assigned batches</li>
                </ul>
              </Card>

              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_4</span>
                  Schedule Live Classes
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Set up live interactive sessions with your students.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Access <strong>Live Classes</strong> section</li>
                  <li>Create a new live class with date and time</li>
                  <li>Add meeting links (Zoom, Google Meet, etc.)</li>
                  <li>Assign to specific batches</li>
                  <li>Students will see scheduled classes in their dashboard</li>
                </ul>
              </Card>

              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_5</span>
                  Create Exams
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Test student knowledge with exams and assessments.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Go to <strong>Exams</strong> section</li>
                  <li>Create a new exam with title and description</li>
                  <li>Add questions (multiple choice, true/false, etc.)</li>
                  <li>Set duration and passing marks</li>
                  <li>Assign to batches and set start/end dates</li>
                </ul>
              </Card>

              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_6</span>
                  Review Results
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Monitor student performance and manage exam results.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Visit <strong>Results</strong> section</li>
                  <li>View all student exam attempts</li>
                  <li>Check scores, answers, and completion status</li>
                  <li>Results are automatically calculated for objective questions</li>
                  <li>Export results for further analysis</li>
                </ul>
              </Card>

              <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-orange-500/5 border-primary/20">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl text-primary">tips_and_updates</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-3">Pro Tips</h3>
                    <ul className="space-y-2 text-sm sm:text-base opacity-70">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm mt-1">check_circle</span>
                        <span>Use the <strong>Dashboard</strong> to get an overview of all activities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm mt-1">check_circle</span>
                        <span>Regularly check student progress through the Results section</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm mt-1">check_circle</span>
                        <span>Keep content organized by assigning it to appropriate batches</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm mt-1">check_circle</span>
                        <span>Schedule live classes in advance to give students time to prepare</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
