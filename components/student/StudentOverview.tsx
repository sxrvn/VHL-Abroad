import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BatchStudent, Result } from '../../types';
import { formatDate, isBatchExpired, getDaysRemaining } from '../../lib/utils';
import { Card, StatCard, Badge, EmptyState, LoadingSpinner } from '../ui';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'class' | 'content' | 'exam';
  created_at: string;
}

const StudentOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [batchEnrollment, setBatchEnrollment] = useState<BatchStudent | null>(null);
  const [stats, setStats] = useState({ videos: 0, liveClasses: 0, exams: 0, completed: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [examResults, setExamResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: enrollment } = await supabase
        .from('batch_students')
        .select(`*, batch:batches(*)`)
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (enrollment) {
        setBatchEnrollment(enrollment);
        
        const [materialsRes, classesRes, examsRes, attemptsRes, notificationsRes, resultsRes] = await Promise.all([
          supabase.from('materials').select('id', { count: 'exact', head: true }).eq('batch_id', enrollment.batch_id).eq('is_published', true),
          supabase.from('live_classes').select('id', { count: 'exact', head: true }).eq('batch_id', enrollment.batch_id).eq('is_active', true),
          supabase.from('exams').select('id', { count: 'exact', head: true }).eq('batch_id', enrollment.batch_id).eq('is_published', true),
          supabase.from('exam_attempts').select('id', { count: 'exact', head: true }).eq('student_id', user?.id).eq('is_submitted', true),
          supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('results').select('*, exam:exams(title)').eq('student_id', user?.id).order('created_at', { ascending: false }).limit(5)
        ]);

        setStats({
          videos: materialsRes.count || 0,
          liveClasses: classesRes.count || 0,
          exams: examsRes.count || 0,
          completed: attemptsRes.count || 0,
        });
        
        setNotifications(notificationsRes.data || []);
        setExamResults(resultsRes.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Watch time tracking removed per project scope

  if (loading) return <LoadingSpinner />;

  if (!batchEnrollment) {
    return (
      <Card>
        <EmptyState
          icon="school"
          title="No Batch Assigned"
          description="Contact your administrator to get enrolled in a batch"
        />
      </Card>
    );
  }

  const expired = isBatchExpired(batchEnrollment.access_expiry);
  const daysLeft = getDaysRemaining(batchEnrollment.access_expiry);

  const getTypeIcon = (type: string) => {
    const icons = {
      general: 'info',
      class: 'video_call',
      content: 'description',
      exam: 'assignment'
    };
    return icons[type as keyof typeof icons] || 'notifications';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      general: 'from-blue-500 to-cyan-500',
      class: 'from-purple-500 to-indigo-500',
      content: 'from-green-500 to-emerald-500',
      exam: 'from-orange-500 to-pink-500'
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/10 to-orange-500/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-orange-500/20 border-primary/20">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-2xl">waving_hand</span>
                <h2 className="text-3xl font-black tracking-tight">
                  Welcome back, {profile?.full_name}!
                </h2>
              </div>
              <p className="text-base opacity-70">Track your progress and continue your learning journey</p>
            </div>
            {!expired && (
              <Badge variant="success" size="lg" icon="check_circle" className="shadow-md shadow-green-500/10">
                Active Enrollment
              </Badge>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/60 dark:bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/40 dark:border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">school</span>
                <p className="text-xs font-bold uppercase tracking-wide opacity-60">Current Batch</p>
              </div>
              <p className="font-black text-xl">{batchEnrollment.batch?.name}</p>
            </div>
            <div className="bg-white/60 dark:bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/40 dark:border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <p className="text-xs font-bold uppercase tracking-wide opacity-60">Access Validity</p>
              </div>
              {expired ? (
                <Badge variant="error" icon="lock" className="shadow-lg shadow-red-500/20">
                  Access Expired
                </Badge>
              ) : (
                <div>
                  <p className="font-bold text-sm mb-1">
                    {formatDate(batchEnrollment.batch?.start_date!)} - {formatDate(batchEnrollment.access_expiry)}
                  </p>
                  <p className="text-xs opacity-70 font-semibold">{daysLeft} days remaining</p>
                </div>
              )}
            </div>
          </div>

          {expired && (
            <div className="mt-6 p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-500/50 rounded-xl flex items-start gap-4">
              <div className="size-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
              </div>
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-400 font-bold text-base mb-1">
                  Your batch access has expired
                </p>
                <p className="text-red-600 dark:text-red-500 text-sm">
                  Please contact your administrator to renew access and continue learning
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Study Notes"
          value={stats.videos}
          icon="description"
          iconColor="bg-gradient-to-br from-orange-500 to-pink-500"
          onClick={() => navigate('/dashboard?view=videos')}
        />
        <StatCard
          title="Live Classes"
          value={stats.liveClasses}
          icon="video_call"
          iconColor="bg-gradient-to-br from-blue-500 to-cyan-500"
          onClick={() => navigate('/dashboard?view=classes')}
        />
        <StatCard
          title="Available Exams"
          value={stats.exams}
          icon="quiz"
          iconColor="bg-gradient-to-br from-purple-500 to-indigo-500"
          onClick={() => navigate('/dashboard?view=exams')}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon="check_circle"
          iconColor="bg-gradient-to-br from-green-500 to-emerald-500"
          onClick={() => navigate('/dashboard?view=results')}
        />
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Updates</h2>
            <button
              onClick={() => navigate('/dashboard?view=updates')}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View All
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
          
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate('/dashboard?view=updates')}
              >
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base opacity-60 mt-0.5">
                    {getTypeIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notification.title}</h3>
                      <span className="text-xs opacity-50 flex-shrink-0">
                        {formatNotificationDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-xs opacity-60 leading-relaxed line-clamp-2">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentOverview;
