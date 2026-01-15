import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Result } from '../../types';
import { formatDate } from '../../lib/utils';
import { Card, Badge, EmptyState, LoadingSpinner } from '../ui';
import ExamResultDetailsModal from './ExamResultDetailsModal';

const ResultsList: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleResultClick = (result: Result) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
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
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          {results.map((result) => {
            const passed = result.percentage >= 50;
            const grade = 
              result.percentage >= 90 ? 'A+' :
              result.percentage >= 80 ? 'A' :
              result.percentage >= 70 ? 'B' :
              result.percentage >= 60 ? 'C' :
              result.percentage >= 50 ? 'D' : 'F';
            
            return (
              <Card key={result.id} hover className="cursor-pointer" onClick={() => handleResultClick(result)}>
                <div className="space-y-4">
                  {/* Header - Simplified */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`size-12 sm:size-14 shrink-0 rounded-lg ${passed ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center text-white`}>
                        <span className="material-symbols-outlined text-xl sm:text-2xl">
                          {passed ? 'check' : 'close'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold mb-1 truncate">{result.exam?.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm opacity-60">
                          <span className="material-symbols-outlined text-xs sm:text-sm">calendar_today</span>
                          <span className="truncate">{formatDate(result.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={passed ? 'success' : 'error'} size="sm">
                      {passed ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                  
                  {/* Stats - Simplified */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <p className="text-[10px] sm:text-xs font-semibold opacity-60 mb-1">Score</p>
                      <p className="text-base sm:text-lg font-bold">{result.score}<span className="text-xs opacity-50">/{result.total_marks}</span></p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <p className="text-[10px] sm:text-xs font-semibold opacity-60 mb-1">Percentage</p>
                      <p className="text-base sm:text-lg font-bold">{result.percentage.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <p className="text-[10px] sm:text-xs font-semibold opacity-60 mb-1">Grade</p>
                      <p className={`text-base sm:text-lg font-bold ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{grade}</p>
                    </div>
                  </div>
                  
                  {/* Progress bar - Simplified */}
                  <div className="h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                  
                  {/* View details */}
                  <div className="pt-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium opacity-60">
                    <span className="material-symbols-outlined text-base">visibility</span>
                    <span>View Details</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Result Details Modal */}
      {selectedResult && (
        <ExamResultDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          result={selectedResult}
        />
      )}
    </div>
  );
};

export default ResultsList;
