import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Result, Batch, Exam } from '../../types';
import { formatDate } from '../../lib/utils';

const ResultsManagement: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBatch, setFilterBatch] = useState('');
  const [filterExam, setFilterExam] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsRes, batchesRes, examsRes] = await Promise.all([
        supabase.from('results').select(`*, exam:exams(title, batch_id), student:profiles(full_name, email)`).order('created_at', { ascending: false }),
        supabase.from('batches').select('*').order('name'),
        supabase.from('exams').select('*').order('title'),
      ]);
      if (resultsRes.data) setResults(resultsRes.data);
      if (batchesRes.data) setBatches(batchesRes.data);
      if (examsRes.data) setExams(examsRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((r) => {
    if (filterBatch && r.exam?.batch_id !== filterBatch) return false;
    if (filterExam && r.exam_id !== filterExam) return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)} className="pl-4 pr-10 py-2.5 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-bg-dark font-semibold">
          <option value="">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filterExam} onChange={(e) => setFilterExam(e.target.value)} className="pl-4 pr-10 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-bg-dark">
          <option value="">All Exams</option>
          {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </div>

      {filteredResults.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-green-500">grade</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No results found</h3>
          <p className="text-base opacity-60">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-charcoal/10 dark:border-white/10 overflow-hidden shadow-sm">
          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Exam</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10 dark:divide-white/10">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{result.student?.full_name}</p>
                        <p className="text-xs opacity-60">{result.student?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{result.exam?.title}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold">{result.score}</span>
                      <span className="opacity-60">/{result.total_marks}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${result.percentage >= 50 ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                        {result.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(result.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-charcoal/10 dark:divide-white/10">
            {filteredResults.map((result) => (
              <div key={result.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base mb-0.5">{result.student?.full_name}</h4>
                    <p className="text-xs opacity-60 truncate">{result.student?.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex-shrink-0 ${result.percentage >= 50 ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                    {result.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base opacity-60">assignment</span>
                    <span className="font-semibold">{result.exam?.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 opacity-70">
                      <span className="material-symbols-outlined text-base">grading</span>
                      <span><span className="font-bold">{result.score}</span>/{result.total_marks}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-70">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                      <span>{formatDate(result.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsManagement;
