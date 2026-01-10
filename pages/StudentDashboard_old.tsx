import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  role: string;
}

interface Enrollment {
  id: string;
  course_level: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
}

const StudentDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData && !profileError) {
          setProfile(profileData);
        }

        // Fetch enrollments (may not exist yet)
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .order('enrolled_at', { ascending: false });

        if (enrollmentData) {
          setEnrollments(enrollmentData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const courseLevels = ['A1', 'A2', 'B1', 'B2'];

  const handleEnroll = async (level: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('enrollments')
      .insert([
        {
          user_id: user.id,
          course_level: level,
          status: 'enrolled',
        },
      ]);

    if (!error) {
      // Refresh enrollments
      const { data } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (data) {
        setEnrollments(data);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-6xl text-primary">progress_activity</span>
          <p className="mt-4 text-lg font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-bg-dark border-b border-charcoal/10 dark:border-white/10 px-6 md:px-20 py-4">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-primary size-8">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight">VHL <span className="text-primary">ABROAD</span></h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold hidden sm:inline">{profile?.full_name}</span>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-charcoal/10 dark:border-white/10 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-orange-500 text-white py-12 px-6 md:px-20">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="text-4xl font-black mb-3">Welcome back, {profile?.full_name}! 👋</h1>
          <p className="text-lg opacity-90">Continue your journey to German language mastery</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-12 space-y-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary">school</span>
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Enrolled</h3>
            </div>
            <p className="text-3xl font-black">{enrollments.filter(e => e.status === 'enrolled' || e.status === 'in_progress').length}</p>
            <p className="text-xs opacity-60 mt-1">Active Courses</p>
          </div>

          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Completed</h3>
            </div>
            <p className="text-3xl font-black">{enrollments.filter(e => e.status === 'completed').length}</p>
            <p className="text-xs opacity-60 mt-1">Courses Finished</p>
          </div>

          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-blue-500">trending_up</span>
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Progress</h3>
            </div>
            <p className="text-3xl font-black">{Math.round((enrollments.filter(e => e.status === 'completed').length / Math.max(enrollments.length, 1)) * 100)}%</p>
            <p className="text-xs opacity-60 mt-1">Overall Completion</p>
          </div>

          <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-orange-500">workspace_premium</span>
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Level</h3>
            </div>
            <p className="text-3xl font-black">
              {enrollments.length > 0 ? enrollments[0].course_level : 'N/A'}
            </p>
            <p className="text-xs opacity-60 mt-1">Current Level</p>
          </div>
        </div>

        {/* My Courses */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black">My Courses</h2>
            <Link to="/enroll" className="text-sm font-bold text-primary hover:underline">View All Courses →</Link>
          </div>

          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-primary mb-1">Level {enrollment.course_level}</h3>
                      <p className="text-sm opacity-60">German Language Course</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      enrollment.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                      enrollment.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-orange-500/10 text-orange-600'
                    }`}>
                      {enrollment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-sm opacity-60">calendar_today</span>
                      <span>Started: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                    </div>
                    {enrollment.completed_at && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>Completed: {new Date(enrollment.completed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <button className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all">
                    {enrollment.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-white/5 rounded-2xl p-12 border border-charcoal/5 text-center">
              <span className="material-symbols-outlined text-6xl text-primary opacity-30 mb-4">school</span>
              <h3 className="text-xl font-bold mb-2">No courses yet</h3>
              <p className="opacity-60 mb-6">Start your German language journey by enrolling in a course below</p>
            </div>
          )}
        </section>

        {/* Available Courses */}
        <section>
          <h2 className="text-3xl font-black mb-6">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courseLevels.map((level) => {
              const isEnrolled = enrollments.some(e => e.course_level === level && e.status !== 'dropped');
              return (
                <div key={level} className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
                  <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl font-black text-primary">{level}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">German Level {level}</h3>
                  <p className="text-sm opacity-60 mb-4">
                    {level === 'A1' && 'Foundation - Start from basics'}
                    {level === 'A2' && 'Elementary - Build your skills'}
                    {level === 'B1' && 'Intermediate - Gain fluency'}
                    {level === 'B2' && 'Upper Intermediate - Master German'}
                  </p>
                  {isEnrolled ? (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Enrolled
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnroll(level)}
                      className="w-full py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-3xl font-black mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/contact" className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm hover:shadow-lg transition-all group">
              <span className="material-symbols-outlined text-4xl text-primary mb-3">support_agent</span>
              <h3 className="text-xl font-bold mb-2">Book Consultation</h3>
              <p className="text-sm opacity-60 mb-4">Schedule a session with our counselors</p>
              <span className="text-primary font-bold text-sm group-hover:underline">Book Now →</span>
            </Link>

            <Link to="/services" className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm hover:shadow-lg transition-all group">
              <span className="material-symbols-outlined text-4xl text-primary mb-3">description</span>
              <h3 className="text-xl font-bold mb-2">Visa Services</h3>
              <p className="text-sm opacity-60 mb-4">APS, Blocked Account, and more</p>
              <span className="text-primary font-bold text-sm group-hover:underline">Learn More →</span>
            </Link>

            <Link to="/universities" className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm hover:shadow-lg transition-all group">
              <span className="material-symbols-outlined text-4xl text-primary mb-3">account_balance</span>
              <h3 className="text-xl font-bold mb-2">Universities</h3>
              <p className="text-sm opacity-60 mb-4">Explore universities in Germany</p>
              <span className="text-primary font-bold text-sm group-hover:underline">Explore →</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
