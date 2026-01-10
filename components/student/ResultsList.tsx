import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Result } from '../../types';
import { formatDate } from '../../lib/utils';
import { Card, Badge, EmptyState, LoadingSpinner } from '../ui';

const ResultsList: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data } = await supabase
        .from('results')
        .select(`*, exam:exams(title, publish_result)`)
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) setResults(data.filter(r => r.exam?.publish_result));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {results.length === 0 ? (
        <Card className="text-center py-16">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-green-500">grade</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No Results Available</h3>
          <p className="text-base opacity-60">Results will appear here after exams are graded and published</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {results.map((result) => {
            const passed = result.percentage >= 50;
            const grade = 
              result.percentage >= 90 ? 'A+' :
              result.percentage >= 80 ? 'A' :
              result.percentage >= 70 ? 'B' :
              result.percentage >= 60 ? 'C' :
              result.percentage >= 50 ? 'D' : 'F';
            
            return (
              <Card key={result.id} hover className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 ${passed ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-full blur-3xl`}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`size-14 rounded-xl ${passed ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-pink-500'} flex items-center justify-center text-white shadow-md ${passed ? 'shadow-green-500/10' : 'shadow-red-500/10'}`}>
                        <span className="material-symbols-outlined text-2xl">
                          {passed ? 'check_circle' : 'cancel'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black mb-2 tracking-tight">{result.exam?.title}</h3>
                        <div className="flex items-center gap-2 text-sm font-semibold opacity-60">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          <span>{formatDate(result.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={passed ? 'success' : 'error'} size="lg" icon={passed ? 'check' : 'close'}>
                      {passed ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
                    <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10">
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide opacity-60 mb-1 sm:mb-2">Score</p>
                      <p className="text-lg sm:text-2xl font-black">{result.score}<span className="text-xs sm:text-base opacity-50">/{result.total_marks}</span></p>
                    </div>
                    <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10">
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide opacity-60 mb-1 sm:mb-2">Percentage</p>
                      <p className="text-lg sm:text-2xl font-black">{result.percentage.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10">
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide opacity-60 mb-1 sm:mb-2">Grade</p>
                      <p className={`text-lg sm:text-2xl font-black ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{grade}</p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="relative h-3 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <div 
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                        passed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultsList;
