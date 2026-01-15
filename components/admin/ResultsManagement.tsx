import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, Button, EmptyState } from '../ui';

interface ResultData {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  created_at: string;
  student_name: string;
  student_email: string;
  exam_title: string;
  batch_id: string;
  batch_name: string;
}

interface Batch {
  id: string;
  name: string;
}

interface Exam {
  id: string;
  title: string;
  batch_id: string;
}

const ResultsManagement: React.FC = () => {
  const [results, setResults] = useState<ResultData[]>([]);
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
      setLoading(true);

      // Fetch batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('batches')
        .select('id, name')
        .order('name');

      if (batchesError) throw batchesError;
      if (batchesData) setBatches(batchesData);

      // Fetch exams
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('id, title, batch_id')
        .order('title');

      if (examsError) throw examsError;
      if (examsData) setExams(examsData);

      // Fetch results with manual joins
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('*')
        .order('created_at', { ascending: false });

      if (resultsError) throw resultsError;

      if (resultsData && resultsData.length > 0) {
        // Get all unique student IDs
        const studentIds = [...new Set(resultsData.map(r => r.student_id))];
        
        // Fetch student profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);

        if (profilesError) throw profilesError;

        // Fetch exam details
        const examIds = [...new Set(resultsData.map(r => r.exam_id))];
        const { data: examDetailsData, error: examDetailsError } = await supabase
          .from('exams')
          .select('id, title, batch_id')
          .in('id', examIds);

        if (examDetailsError) throw examDetailsError;

        // Create lookup maps
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const examsMap = new Map(examDetailsData?.map(e => [e.id, e]) || []);
        const batchesMap = new Map(batchesData?.map(b => [b.id, b]) || []);

        // Combine the data
        const enrichedResults: ResultData[] = resultsData.map(result => {
          const profile = profilesMap.get(result.student_id);
          const exam = examsMap.get(result.exam_id);
          const batch = exam ? batchesMap.get(exam.batch_id) : null;

          return {
            ...result,
            student_name: profile?.full_name || 'Unknown Student',
            student_email: profile?.email || '',
            exam_title: exam?.title || 'Unknown Exam',
            batch_id: exam?.batch_id || '',
            batch_name: batch?.name || 'Unknown Batch'
          };
        });

        setResults(enrichedResults);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    if (filterBatch && result.batch_id !== filterBatch) return false;
    if (filterExam && result.exam_id !== filterExam) return false;
    return true;
  });

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    if (percentage >= 40) return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary mb-4">progress_activity</span>
          <p className="text-sm opacity-60">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Filter by Batch</label>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Filter by Exam</label>
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Exams</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>

          {(filterBatch || filterExam) && (
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilterBatch('');
                  setFilterExam('');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Results Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">assessment</span>
            </div>
            <div>
              <p className="text-sm opacity-70">Total Results</p>
              <p className="text-2xl font-bold">{filteredResults.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-green-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">trending_up</span>
            </div>
            <div>
              <p className="text-sm opacity-70">Pass Rate</p>
              <p className="text-2xl font-bold">
                {filteredResults.length > 0
                  ? `${Math.round((filteredResults.filter(r => r.percentage >= 40).length / filteredResults.length) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">calculate</span>
            </div>
            <div>
              <p className="text-sm opacity-70">Average Score</p>
              <p className="text-2xl font-bold">
                {filteredResults.length > 0
                  ? `${(filteredResults.reduce((acc, r) => acc + r.percentage, 0) / filteredResults.length).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Results Table/List */}
      {filteredResults.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon="grade"
            title="No Results Found"
            description={
              filterBatch || filterExam
                ? 'No results match your current filters. Try adjusting or clearing the filters.'
                : 'No exam results have been recorded yet. Results will appear here once students complete exams.'
            }
          />
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Exam
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredResults.map((result) => (
                    <tr
                      key={result.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{result.student_name}</p>
                          <p className="text-sm opacity-60">{result.student_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{result.exam_title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {result.batch_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-lg">
                          {result.score}
                          <span className="text-sm opacity-60 font-normal">/{result.total_marks}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getScoreColor(result.percentage)}`}>
                          {result.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm opacity-70">
                        {formatDate(result.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredResults.map((result) => (
              <Card key={result.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base mb-1">{result.student_name}</h4>
                    <p className="text-xs opacity-60 truncate mb-2">{result.student_email}</p>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {result.batch_name}
                    </span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border flex-shrink-0 ${getScoreColor(result.percentage)}`}>
                    {result.percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base opacity-60">assignment</span>
                    <span className="font-medium">{result.exam_title}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 opacity-70">
                      <span className="material-symbols-outlined text-base">grading</span>
                      <span>
                        Score: <span className="font-bold">{result.score}</span>/{result.total_marks}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 opacity-70">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                      <span className="text-xs">{formatDate(result.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsManagement;
