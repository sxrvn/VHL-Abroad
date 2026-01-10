import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, LoadingSpinner } from '../ui';
import { formatDateTime } from '../../lib/utils';

interface Stats {
  totalStudents: number;
  activeBatches: number;
  totalExams: number;
  totalVideos: number;
  examResults: number;
  liveClasses: number;
}

interface RecentEnrollment {
  id: string;
  student: {
    full_name: string;
    email: string;
  };
  batch: {
    name: string;
  };
  created_at: string;
}

interface ActivityData {
  date: string;
  count: number;
}

interface RecentActivity {
  id: string;
  student_name: string;
  action: string;
  details: string;
  created_at: string;
  icon: string;
  color: string;
}

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    activeBatches: 0,
    totalExams: 0,
    totalVideos: 0,
    examResults: 0,
    liveClasses: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, batchesRes, examsRes, videosRes, resultsRes, classesRes, enrollmentsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('batches').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('exams').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('results').select('id', { count: 'exact', head: true }),
        supabase.from('live_classes').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('batch_students').select('*, student:profiles!batch_students_student_id_fkey(full_name, email), batch:batches(name)').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        activeBatches: batchesRes.count || 0,
        totalExams: examsRes.count || 0,
        totalVideos: videosRes.count || 0,
        examResults: resultsRes.count || 0,
        liveClasses: classesRes.count || 0,
      });

      if (enrollmentsRes.data) {
        setRecentEnrollments(enrollmentsRes.data as any);
      }

      // Fetch activity data for the chart (last 7 days)
      await fetchActivityData();
      
      // Fetch recent activities
      await fetchRecentActivities();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    try {
      // Get exam attempts from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (attempts) {
        // Group by date
        const activityMap: { [key: string]: number } = {};
        
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          activityMap[dateKey] = 0;
        }

        // Count activities per day
        attempts.forEach((attempt) => {
          const date = new Date(attempt.created_at);
          const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (activityMap[dateKey] !== undefined) {
            activityMap[dateKey]++;
          }
        });

        const chartData = Object.entries(activityMap).map(([date, count]) => ({
          date,
          count,
        }));

        setActivityData(chartData);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Fetch recent exam attempts
      const { data: examAttempts } = await supabase
        .from('exam_attempts')
        .select('*, student:profiles!exam_attempts_student_id_fkey(full_name), exam:exams(title)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (examAttempts) {
        examAttempts.forEach((attempt: any) => {
          if (attempt.is_submitted) {
            activities.push({
              id: `exam-${attempt.id}`,
              student_name: attempt.student?.full_name || 'Unknown',
              action: 'Exam Submitted',
              details: attempt.exam?.title || 'Exam',
              created_at: attempt.created_at,
              icon: 'task_alt',
              color: 'text-green-600',
            });
          } else {
            activities.push({
              id: `exam-start-${attempt.id}`,
              student_name: attempt.student?.full_name || 'Unknown',
              action: 'Exam Started',
              details: attempt.exam?.title || 'Exam',
              created_at: attempt.created_at,
              icon: 'play_circle',
              color: 'text-blue-600',
            });
          }
        });
      }

      // Sort by date and take latest 8
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivities(activities.slice(0, 8));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const maxActivity = Math.max(...activityData.map(d => d.count), 1);

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: 'person',
      gradient: 'from-red-500 to-pink-500',
      path: '/admin?view=students',
    },
    {
      title: 'Active Batches',
      value: stats.activeBatches,
      icon: 'groups',
      gradient: 'from-blue-500 to-cyan-500',
      path: '/admin?view=batches',
    },
    {
      title: 'Total Exams',
      value: stats.totalExams,
      icon: 'quiz',
      gradient: 'from-orange-500 to-amber-500',
      path: '/admin?view=exams',
    },
    {
      title: 'Exam Results',
      value: stats.examResults,
      icon: 'grade',
      gradient: 'from-green-500 to-emerald-500',
      path: '/admin?view=results',
    },
    {
      title: 'Video Lectures',
      value: stats.totalVideos,
      icon: 'play_circle',
      gradient: 'from-purple-500 to-indigo-500',
      path: '/admin?view=notes',
    },
    {
      title: 'Live Classes',
      value: stats.liveClasses,
      icon: 'video_call',
      gradient: 'from-pink-500 to-rose-500',
      path: '/admin?view=classes',
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            hover 
            padding="md" 
            className="group cursor-pointer"
            onClick={() => navigate(stat.path)}
          >
            <div className="space-y-4">
              <div className={`size-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md shadow-primary/10 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1">{stat.title}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Student Activity Chart */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="relative mb-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white shadow-md shadow-primary/10">
                <span className="material-symbols-outlined text-xl">trending_up</span>
              </div>
              <div>
                <h3 className="font-black text-xl">Student Activity</h3>
                <p className="text-sm opacity-60">Activity over the last 7 days</p>
              </div>
            </div>
          </div>
          <div className="h-64 relative">
            {activityData.length > 0 ? (
              <div className="h-full pb-8 relative">
                <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="0" x2="700" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="50" x2="700" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="100" x2="700" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="150" x2="700" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="200" x2="700" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                  
                  {/* Area fill */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0 200 ${activityData.map((data, i) => {
                      const x = (i / (activityData.length - 1)) * 700;
                      const y = 200 - (data.count / maxActivity) * 200;
                      return `L ${x} ${y}`;
                    }).join(' ')} L 700 200 Z`}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Line */}
                  <path
                    d={activityData.map((data, i) => {
                      const x = (i / (activityData.length - 1)) * 700;
                      const y = 200 - (data.count / maxActivity) * 200;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {activityData.map((data, i) => {
                    const x = (i / (activityData.length - 1)) * 700;
                    const y = 200 - (data.count / maxActivity) * 200;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="5" fill="white" stroke="#ef4444" strokeWidth="2" />
                        <circle cx={x} cy={y} r="3" fill="#ef4444" />
                      </g>
                    );
                  })}
                </svg>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                  {activityData.map((data, index) => (
                    <span key={index} className="text-xs text-gray-500 font-medium">{data.date}</span>
                  ))}
                </div>
                
                {/* Hover tooltips */}
                <div className="absolute inset-0 flex justify-between">
                  {activityData.map((data, index) => (
                    <div key={index} className="flex-1 group cursor-pointer">
                      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {data.count} {data.count === 1 ? 'activity' : 'activities'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-400">No activity data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Enrollments */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="relative flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-green-500/10">
                  <span className="material-symbols-outlined text-xl">person_add</span>
                </div>
                <div>
                  <h3 className="font-black text-xl">Recent Enrollments</h3>
                  <p className="text-sm opacity-60">Latest student enrollments</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {recentEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <div className="size-16 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl opacity-30">person_add</span>
                </div>
                <p className="text-sm opacity-60">No recent enrollments</p>
              </div>
            ) : (
              recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/10 flex-shrink-0">
                    {(enrollment.student?.full_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{enrollment.student?.full_name || 'Unknown'}</p>
                    <p className="text-xs opacity-60 truncate">{enrollment.student?.email || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">{enrollment.batch?.name || 'N/A'}</p>
                    <p className="text-xs opacity-50">
                      {new Date(enrollment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="relative mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/10">
              <span className="material-symbols-outlined text-xl">notifications_active</span>
            </div>
            <div>
              <h3 className="font-black text-xl">Recent Activity Feed</h3>
              <p className="text-sm opacity-60">Latest student activities across the platform</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {recentActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="size-16 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl opacity-30">notification_important</span>
              </div>
              <p className="text-sm opacity-60">No recent activities</p>
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group">
                <div className={`size-12 rounded-xl ${activity.color === 'text-green-600' ? 'bg-green-500/10' : 'bg-blue-500/10'} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined text-xl ${activity.color}`}>{activity.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{activity.student_name}</p>
                  <p className="text-xs opacity-60">{activity.action} • {activity.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold opacity-50">
                    {new Date(activity.created_at).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminOverview;
