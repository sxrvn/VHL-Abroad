import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

interface Consultation {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  desired_degree: string;
  field_of_interest: string;
  status: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'consultations'>('overview');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData && !usersError) {
        setUsers(usersData);
      }

      // Fetch all consultations (table may not exist)
      const { data: consultationsData } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (consultationsData) {
        setConsultations(consultationsData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConsultationStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('consultations')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-6xl text-primary">progress_activity</span>
          <p className="mt-4 text-lg font-semibold">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-bg-dark border-b border-charcoal/10 dark:border-white/10 px-6 md:px-20 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-primary size-8">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight">VHL <span className="text-primary">ABROAD</span> <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">ADMIN</span></h1>
          </Link>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-charcoal/10 dark:border-white/10 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-charcoal to-primary text-white py-12 px-6 md:px-20">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-4xl font-black mb-3">Admin Dashboard 👨‍💼</h1>
          <p className="text-lg opacity-90">Manage users, consultations, and system overview</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-20 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-charcoal/10 dark:border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-bold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent hover:text-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-bold border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent hover:text-primary'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-6 py-3 font-bold border-b-2 transition-colors ${
              activeTab === 'consultations'
                ? 'border-primary text-primary'
                : 'border-transparent hover:text-primary'
            }`}
          >
            Consultations ({consultations.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-blue-500">group</span>
                  <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Total Users</h3>
                </div>
                <p className="text-4xl font-black">{users.length}</p>
              </div>

              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-green-500">school</span>
                  <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Students</h3>
                </div>
                <p className="text-4xl font-black">{users.filter(u => u.role === 'student').length}</p>
              </div>

              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-orange-500">pending</span>
                  <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Pending</h3>
                </div>
                <p className="text-4xl font-black">{consultations.filter(c => c.status === 'pending').length}</p>
              </div>

              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary">contact_mail</span>
                  <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Consultations</h3>
                </div>
                <p className="text-4xl font-black">{consultations.length}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
              <h2 className="text-2xl font-black mb-6">Recent Consultations</h2>
              <div className="space-y-4">
                {consultations.slice(0, 5).map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-4 bg-bg-light dark:bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">person</span>
                      </div>
                      <div>
                        <p className="font-bold">{consultation.full_name}</p>
                        <p className="text-sm opacity-60">{consultation.email} • {consultation.desired_degree}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      consultation.status === 'pending' ? 'bg-orange-500/10 text-orange-600' :
                      consultation.status === 'contacted' ? 'bg-blue-500/10 text-blue-600' :
                      consultation.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                      'bg-gray-500/10 text-gray-600'
                    }`}>
                      {consultation.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-charcoal/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-light dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-bg-light dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-sm">person</span>
                          </div>
                          <span className="font-semibold">{user.full_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-600'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
          <div className="space-y-6">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-charcoal/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{consultation.full_name}</h3>
                    <p className="text-sm opacity-60">{consultation.email} • {consultation.phone}</p>
                  </div>
                  <select
                    value={consultation.status}
                    onChange={(e) => updateConsultationStatus(consultation.id, e.target.value)}
                    className="px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-white/5 font-semibold text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Degree</p>
                    <p className="font-semibold">{consultation.desired_degree}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Field</p>
                    <p className="font-semibold">{consultation.field_of_interest}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      consultation.status === 'pending' ? 'bg-orange-500/10 text-orange-600' :
                      consultation.status === 'contacted' ? 'bg-blue-500/10 text-blue-600' :
                      consultation.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                      'bg-gray-500/10 text-gray-600'
                    }`}>
                      {consultation.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Submitted</p>
                    <p className="font-semibold text-sm">{new Date(consultation.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
