import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar, Header, Card, DashboardLayout } from '../components/ui';
import AdminOverview from '../components/admin/AdminOverview';
import BatchManagement from '../components/admin/BatchManagement';
import StudentManagement from '../components/admin/StudentManagement';
import NotesManagement from '../components/admin/NotesManagementNew';
import LiveClassManagement from '../components/admin/LiveClassManagement';
import ExamManagement from '../components/admin/ExamManagement';
import QuestionManagement from '../components/admin/QuestionManagement';
import ResultsManagement from '../components/admin/ResultsManagement';
import NotificationManagement from '../components/admin/NotificationManagement';
import AddonsManagement from '../components/admin/AddonsManagement';
import { supabase } from '../lib/supabase';

type ViewType = 'overview' | 'batches' | 'students' | 'notes' | 'classes' | 'exams' | 'questions' | 'results' | 'notifications' | 'guide' | 'addons';

const AdminDashboard: React.FC = () => {
  const { signOut, profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = (searchParams.get('view') || 'overview') as ViewType;
  const examId = searchParams.get('examId');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleManageQuestions = (examId: string) => {
    setSearchParams({ view: 'questions', examId });
  };

  const handleBackFromQuestions = () => {
    setSearchParams({ view: 'exams' });
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
      label: 'Study Material', 
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
      id: 'addons', 
      label: 'Add-ons', 
      icon: 'extension',
      path: '/admin?view=addons'
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
      notes: { title: 'Study Material Management', subtitle: 'Upload and manage study materials and content' },
      classes: { title: 'Live Classes', subtitle: 'Schedule and manage live sessions' },
      exams: { title: 'Exam Management', subtitle: 'Create and manage assessments' },
      questions: { title: 'Question Management', subtitle: 'Add and edit exam questions' },
      results: { title: 'Results Management', subtitle: 'Review and publish exam results' },
      notifications: { title: 'Notifications', subtitle: 'Send one-way notifications to students' },
      addons: { title: 'Add-ons & Optional Features', subtitle: 'Explore additional features and upgrades' },
      guide: { title: 'Quick Start Guide', subtitle: 'Get started with your instructor portal' },
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
        {activeView !== 'questions' && (
          <Header 
            title={getViewTitle().title} 
            subtitle={getViewTitle().subtitle}
          />
        )}

        <div className={activeView === 'questions' ? '' : 'mt-6'}>
          {activeView === 'overview' && <AdminOverview />}
          {activeView === 'batches' && <BatchManagement />}
          {activeView === 'students' && <StudentManagement />}
          {activeView === 'notes' && <NotesManagement />}
          {activeView === 'classes' && <LiveClassManagement />}
          {activeView === 'exams' && <ExamManagement onManageQuestions={handleManageQuestions} />}
          {activeView === 'questions' && examId && (
            <QuestionManagement examId={examId} onBack={handleBackFromQuestions} />
          )}
          {activeView === 'results' && <ResultsManagement />}
          {activeView === 'notifications' && <NotificationManagement />}
          {activeView === 'addons' && <AddonsManagement />}
          {activeView === 'guide' && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl text-primary">rocket_launch</span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome to VHL Abroad Career Portal</h2>
                    <p className="text-sm sm:text-base opacity-70">Your complete guide to managing students, content, exams, and more. Follow these steps to get started.</p>
                  </div>
                </div>
              </Card>

              {/* System Overview */}
              <Card className="p-6 sm:p-8 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl text-blue-600">info</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">What You Can Do</h3>
                    <p className="text-sm sm:text-base opacity-70 mb-3">This portal offers comprehensive tools for education management:</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 ml-4">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-600 mt-1">check_circle</span>
                    <span className="text-sm">Organize students into batches</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-600 mt-1">check_circle</span>
                    <span className="text-sm">Upload videos, PDFs & documents</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-600 mt-1">check_circle</span>
                    <span className="text-sm">Schedule live classes with Zoom/Meet</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-600 mt-1">check_circle</span>
                    <span className="text-sm">Create exams with multiple question types</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-600 mt-1">check_circle</span>
                    <span className="text-sm">Track results & student performance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-600 mt-1">check_circle</span>
                    <span className="text-sm">Send notifications to students</span>
                  </div>
                </div>
              </Card>

              {/* Step 1: Create Batches */}
              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_one</span>
                  Create Batches
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Batches are the foundation of your portal. They help organize students by course, program, or semester.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Navigate to <strong>Batches</strong> from the sidebar</li>
                  <li>Click <strong>Add New Batch</strong> button</li>
                  <li>Enter batch name (e.g., "IELTS Batch 2026", "Study Abroad Program")</li>
                  <li>Add description and start/end dates</li>
                  <li>All content (materials, classes, exams) will be assigned to batches</li>
                </ul>
              </Card>

              {/* Step 2: Add Students */}
              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_two</span>
                  Add Students
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Create student accounts and assign them to batches for organized access.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Go to <strong>Students</strong> section</li>
                  <li>Click <strong>Add New Student</strong></li>
                  <li>Enter student details: name, email, phone, password</li>
                  <li>Assign to one or more batches</li>
                  <li>Students can login with their email and password</li>
                  <li>Edit student details or change batch assignments anytime</li>
                </ul>
              </Card>

              {/* Step 3: Upload Study Materials */}
              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_3</span>
                  Upload Study Materials
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Share various types of educational content with your students.</p>
                <div className="bg-primary/5 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold mb-2">Supported Content Types:</p>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm opacity-70">
                    <div>• Video files (MP4, MOV, etc.)</div>
                    <div>• PDF documents</div>
                    <div>• YouTube video links</div>
                    <div>• Vimeo video links</div>
                    <div>• Word documents</div>
                    <div>• PowerPoint presentations</div>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Navigate to <strong>Study Material</strong></li>
                  <li>Click <strong>Upload New Material</strong></li>
                  <li>Choose material type (video file, PDF, YouTube, etc.)</li>
                  <li>Add title, description, and select batches</li>
                  <li>Upload files or paste video URLs</li>
                  <li>Materials appear instantly in student dashboards</li>
                </ul>
              </Card>

              {/* Step 4: Schedule Live Classes */}
              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_4</span>
                  Schedule Live Classes
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Conduct interactive live sessions with your students using any video conferencing platform.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Go to <strong>Live Classes</strong> section</li>
                  <li>Click <strong>Schedule New Class</strong></li>
                  <li>Enter class title and description</li>
                  <li>Set date and time for the session</li>
                  <li>Add meeting link (Zoom, Google Meet, Microsoft Teams, etc.)</li>
                  <li>Assign to specific batches</li>
                  <li>Students see classes in their dashboard</li>
                </ul>
              </Card>

              {/* Step 5: Create Exams */}
              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_5</span>
                  Create Exams & Questions
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Build comprehensive assessments to test student knowledge.</p>
                <div className="bg-orange-500/5 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold mb-2">Question Types Available:</p>
                  <div className="space-y-1 text-sm opacity-70">
                    <div>• <strong>Multiple Choice (MCQ)</strong> - Auto-graded with single correct answer</div>
                    <div>• <strong>True/False</strong> - Simple binary questions</div>
                    <div>• <strong>Multiple Select</strong> - Multiple correct answers (partial credit supported)</div>
                    <div>• <strong>Short Answer</strong> - Text input for brief responses</div>
                    <div>• <strong>Coding</strong> - For programming assessments</div>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Visit <strong>Exams</strong> section</li>
                  <li>Click <strong>Create New Exam</strong></li>
                  <li>Set exam title, description, duration, and passing marks</li>
                  <li>Add questions one by one or bulk import</li>
                  <li>Set correct answers and points for each question</li>
                  <li>Configure exam settings: shuffle questions, show correct answers, etc.</li>
                  <li>Assign to batches and set available date/time range</li>
                  <li>Exams auto-submit when time expires</li>
                </ul>
              </Card>

              {/* Step 6: Review Results */}
              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">looks_6</span>
                  Review & Manage Results
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Track student performance and analyze exam results.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Navigate to <strong>Results</strong> section</li>
                  <li>View all exam attempts by students</li>
                  <li>Filter by exam, batch, or student</li>
                  <li>Review individual answers and scoring</li>
                  <li>MCQs are auto-graded instantly</li>
                  <li>Manually grade subjective/coding questions if needed</li>
                  <li>Results are automatically visible to students</li>
                  <li>Export results for record-keeping or analysis</li>
                </ul>
              </Card>

              {/* Step 7: Send Notifications */}
              <Card className="p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notifications_active</span>
                  Send Notifications
                </h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">Keep students informed with important announcements and updates.</p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base opacity-70 ml-4">
                  <li>Go to <strong>Notifications</strong> section</li>
                  <li>Click <strong>Send New Notification</strong></li>
                  <li>Write your message title and content</li>
                  <li>Select target batches (or send to all)</li>
                  <li>Choose notification type/priority</li>
                  <li>Students receive instant updates in their dashboard</li>
                  <li>Use for announcements, reminders, schedule changes, etc.</li>
                </ul>
              </Card>

              {/* Pro Tips */}
              <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-orange-500/5 border-primary/20">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl text-primary">tips_and_updates</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold mb-4">Best Practices & Tips</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">dashboard</span>
                          Dashboard Overview
                        </p>
                        <p className="text-sm opacity-70 ml-6">Check the Dashboard regularly for quick insights on total students, active batches, scheduled exams, and recent activity.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          Schedule in Advance
                        </p>
                        <p className="text-sm opacity-70 ml-6">Schedule live classes and exams at least 2-3 days in advance so students can prepare accordingly.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">folder_open</span>
                          Organize Content
                        </p>
                        <p className="text-sm opacity-70 ml-6">Use clear, descriptive titles for materials and organize them by topic or week for easy student navigation.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">quiz</span>
                          Exam Best Practices
                        </p>
                        <p className="text-sm opacity-70 ml-6">Test exams yourself before assigning to students. Set appropriate time limits and passing marks based on difficulty.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">trending_up</span>
                          Monitor Progress
                        </p>
                        <p className="text-sm opacity-70 ml-6">Regularly check the Results section to identify struggling students and provide additional support.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">notifications</span>
                          Stay Connected
                        </p>
                        <p className="text-sm opacity-70 ml-6">Use notifications for important updates like deadline reminders, new material uploads, or schedule changes.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Reference */}
              <Card className="p-6 sm:p-8 bg-gradient-to-br from-green-500/5 to-teal-500/5 border-green-500/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl text-green-600">menu_book</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Quick Reference</h3>
                    <p className="text-sm opacity-70">Common tasks and where to find them:</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 ml-4">
                  <div className="text-sm">
                    <strong>View all students:</strong> Students section
                  </div>
                  <div className="text-sm">
                    <strong>Check exam scores:</strong> Results section
                  </div>
                  <div className="text-sm">
                    <strong>Upload a video:</strong> Study Material → Upload
                  </div>
                  <div className="text-sm">
                    <strong>Schedule class:</strong> Live Classes → Schedule New
                  </div>
                  <div className="text-sm">
                    <strong>Create assessment:</strong> Exams → Create New Exam
                  </div>
                  <div className="text-sm">
                    <strong>Send announcement:</strong> Notifications section
                  </div>
                  <div className="text-sm">
                    <strong>Organize students:</strong> Batches → Add New Batch
                  </div>

                </div>
              </Card>

              {/* Need Help */}
              <Card className="p-6 sm:p-8 text-center bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
                <div className="size-16 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-4xl text-purple-600">support_agent</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Need Help?</h3>
                <p className="text-sm sm:text-base opacity-70 mb-4">If you encounter any issues or have questions, don't hesitate to reach out.</p>
                <p className="text-sm opacity-60">For technical support or feature requests, contact the development team.</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
