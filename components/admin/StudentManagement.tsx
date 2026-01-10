import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile, Batch, BatchStudent } from '../../types';
import { formatDate, addMonths } from '../../lib/utils';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Profile[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchStudents, setBatchStudents] = useState<BatchStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [assignFormData, setAssignFormData] = useState({
    batch_id: '',
    access_expiry: '',
  });
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, batchesRes, batchStudentsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false }),
        supabase.from('batches').select('*').order('name'),
        supabase.from('batch_students').select(`
          *,
          batch:batches(*),
          student:profiles(*)
        `),
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (batchesRes.data) setBatches(batchesRes.data);
      if (batchStudentsRes.data) setBatchStudents(batchStudentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (student: Profile) => {
    setSelectedStudent(student);
    const today = new Date();
    const expiry = addMonths(today, 6);
    setAssignFormData({
      batch_id: '',
      access_expiry: expiry.toISOString().split('T')[0],
    });
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedStudent(null);
    setAssignFormData({ batch_id: '', access_expiry: '' });
  };

  const openCreateModal = () => {
    setCreateFormData({ email: '', password: '', full_name: '', phone: '' });
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({ email: '', password: '', full_name: '', phone: '' });
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createFormData.email,
        password: createFormData.password,
        options: {
          data: {
            full_name: createFormData.full_name,
            phone: createFormData.phone,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with role
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: 'student',
            full_name: createFormData.full_name,
            phone: createFormData.phone || null,
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        alert(`Student account created successfully!\nEmail: ${createFormData.email}\nPassword: ${createFormData.password}\n\nPlease share these credentials with the student.`);
        fetchData();
        closeCreateModal();
      }
    } catch (error: any) {
      console.error('Error creating student:', error);
      alert(error.message || 'Failed to create student account');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const { error } = await supabase.from('batch_students').insert([
        {
          batch_id: assignFormData.batch_id,
          student_id: selectedStudent.id,
          access_expiry: assignFormData.access_expiry,
        },
      ]);

      if (error) throw error;

      await fetchData();
      alert('Student assigned to batch successfully!');
      closeAssignModal();
    } catch (error: any) {
      console.error('Error assigning student:', error);
      if (error.code === '23505') {
        alert('Student is already enrolled in this batch');
      } else {
        alert('Failed to assign student to batch');
      }
    }
  };

  const removeFromBatch = async (batchStudentId: string) => {
    if (!confirm('Remove student from batch?')) return;

    try {
      const { error } = await supabase.from('batch_students').delete().eq('id', batchStudentId);
      if (!error) {
        await fetchData();
        alert('Student removed from batch successfully!');
      }
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Failed to remove student from batch');
    }
  };

  const getStudentBatches = (studentId: string) => {
    return batchStudents.filter((bs) => bs.student_id === studentId);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchQuery || 
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedBatch === 'all') return matchesSearch;
    
    const studentBatches = batchStudents.filter(bs => bs.student_id === student.id);
    return matchesSearch && studentBatches.some(bs => bs.batch_id === selectedBatch);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e] rounded-xl font-bold hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] transition-all"
        >
          <span className="material-symbols-outlined">person_add</span>
          Add Student
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl">search</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white dark:bg-white/5 border border-charcoal/10 dark:border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[140px]"
        >
          <option value="all">All Batches</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>{batch.name}</option>
          ))}
        </select>
      </div>
      <p className="text-sm opacity-60">{filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} found</p>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-blue-500">person</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No students found</h3>
          <p className="text-base opacity-60">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10 overflow-hidden">
          {/* Desktop Table Header - Hidden on Mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-charcoal/10 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
            <div className="col-span-4 text-sm font-bold opacity-60 uppercase tracking-wider">Student</div>
            <div className="col-span-3 text-sm font-bold opacity-60 uppercase tracking-wider">Batch</div>
            <div className="col-span-2 text-sm font-bold opacity-60 uppercase tracking-wider">Enrolled</div>
            <div className="col-span-3 text-sm font-bold opacity-60 uppercase tracking-wider text-right">Actions</div>
          </div>
          
          {/* Table Body / Card List */}
          <div className="divide-y divide-charcoal/10 dark:divide-white/10">
            {filteredStudents.map((student) => {
              const studentBatches = getStudentBatches(student.id);
              const primaryBatch = studentBatches[0];
              
              return (
                <div key={student.id} className="md:grid md:grid-cols-12 gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-base">{student.full_name}</h4>
                        <p className="text-sm opacity-60 mt-0.5">{student.email}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => openAssignModal(student)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                          title="Assign to Batch"
                        >
                          <span className="material-symbols-outlined text-lg">group_add</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold opacity-50 uppercase">Batch:</span>
                      {primaryBatch ? (
                        <span className="px-2.5 py-1 bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e] rounded-full text-xs font-semibold">
                          {primaryBatch.batch?.name}
                        </span>
                      ) : (
                        <span className="text-sm opacity-60">Not enrolled</span>
                      )}
                    </div>
                    {primaryBatch && (
                      <div className="flex items-center gap-2 text-xs opacity-60">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        <span>Enrolled: {new Date(primaryBatch.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                    {studentBatches.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs font-semibold text-primary cursor-pointer hover:underline">View All Batches ({studentBatches.length})</summary>
                        <div className="mt-2 space-y-2 pl-3">
                          {studentBatches.map((bs) => (
                            <div key={bs.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                              <span className="font-medium">{bs.batch?.name}</span>
                              <button
                                onClick={() => removeFromBatch(bs.id)}
                                className="text-red-600 hover:text-red-700 p-1"
                                title="Remove"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>

                  {/* Desktop Grid Layout */}
                  <div className="hidden md:contents">
                    {/* Student Column */}
                    <div className="col-span-4">
                      <h4 className="font-bold">{student.full_name}</h4>
                      <p className="text-sm opacity-60">{student.email}</p>
                    </div>

                    {/* Batch Column */}
                    <div className="col-span-3 flex items-center">
                      {primaryBatch ? (
                        <span className="px-3 py-1 bg-[#0a0f1e] dark:bg-white text-white dark:text-[#0a0f1e] rounded-full text-sm font-semibold">
                          {primaryBatch.batch?.name}
                        </span>
                      ) : (
                        <span className="text-sm opacity-60">Not enrolled</span>
                      )}
                    </div>

                    {/* Enrolled Column */}
                    <div className="col-span-2 flex items-center">
                      {primaryBatch ? (
                        <span className="text-sm font-medium opacity-70">
                          {new Date(primaryBatch.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-sm opacity-60">-</span>
                      )}
                    </div>

                    {/* Actions Column */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openAssignModal(student)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title="Assign to Batch"
                      >
                        <span className="material-symbols-outlined text-lg">group_add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedStudent && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeAssignModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-bg-dark rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Assign to Batch</h3>
                <button
                  onClick={closeAssignModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                <p className="text-sm font-semibold">Student:</p>
                <p className="font-bold">{selectedStudent.full_name}</p>
                <p className="text-sm opacity-60">{selectedStudent.email}</p>
              </div>

              {/* Current Enrollments */}
              {getStudentBatches(selectedStudent.id).length > 0 && (
                <div className="mb-4 p-4 border border-charcoal/10 dark:border-white/10 rounded-lg">
                  <p className="text-sm font-semibold mb-3">Current Enrollments:</p>
                  <div className="space-y-2">
                    {getStudentBatches(selectedStudent.id).map((bs) => (
                      <div key={bs.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{bs.batch?.name}</p>
                          <p className="text-xs opacity-60">
                            Expires: {new Date(bs.access_expiry).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromBatch(bs.id)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded transition-colors"
                          title="Remove from batch"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Select Batch</label>
                  <select
                    value={assignFormData.batch_id}
                    onChange={(e) =>
                      setAssignFormData({ ...assignFormData, batch_id: e.target.value })
                    }
                    className="w-full pl-4 pr-10 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">-- Select Batch --</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} ({batch.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Access Expiry</label>
                  <input
                    type="date"
                    value={assignFormData.access_expiry}
                    onChange={(e) =>
                      setAssignFormData({ ...assignFormData, access_expiry: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
                    required
                  />
                  <p className="text-xs opacity-60 mt-1">
                    Students can access content until this date
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeAssignModal}
                    className="flex-1 px-4 py-2 border border-charcoal/10 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Create Student Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeCreateModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-bg-dark rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Create Student Account</h3>
                <button
                  onClick={closeCreateModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    value={createFormData.full_name}
                    onChange={(e) => setCreateFormData({ ...createFormData, full_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
                    required
                  />
                  <p className="text-xs opacity-60 mt-1">Student will use this email to login</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <input
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-transparent focus:ring-2 focus:ring-primary"
                    minLength={6}
                    required
                  />
                  <p className="text-xs opacity-60 mt-1">Minimum 6 characters</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">info</span>
                    <p className="text-xs text-blue-800 dark:text-blue-400">
                      After creation, you'll receive the credentials to share with the student. Make sure to save them securely.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="flex-1 px-4 py-2 border border-charcoal/10 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentManagement;
