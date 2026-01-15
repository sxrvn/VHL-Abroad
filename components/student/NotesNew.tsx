import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Material, MaterialProgress } from '../../types';
import { isBatchExpired } from '../../lib/utils';
import { getMaterialIcon, getProviderIcon, getProviderColor, formatFileSize, formatDuration } from '../../lib/materialUtils';
import MaterialViewer from './MaterialViewer';
import { Card, Badge, Button, EmptyState, LoadingSpinner, Modal } from '../ui';

const Notes: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [progress, setProgress] = useState<Map<string, MaterialProgress>>(new Map());
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [batchExpired, setBatchExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'type'>('recent');

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Get student's enrollment
      const { data: enrollment } = await supabase
        .from('batch_students')
        .select('*')
        .eq('student_id', user.id)
        .single();

      if (enrollment) {
        setBatchExpired(isBatchExpired(enrollment.access_expiry));

        // Fetch materials
        const { data: materialsData } = await supabase
          .from('materials')
          .select('*')
          .eq('batch_id', enrollment.batch_id)
          .eq('is_published', true)
          .order('order_index');

        if (materialsData) {
          setMaterials(materialsData);

          // Fetch progress for all materials
          const { data: progressData } = await supabase
            .from('material_progress')
            .select('*')
            .eq('student_id', user.id)
            .in('material_id', materialsData.map(m => m.id));

          if (progressData) {
            const progressMap = new Map();
            progressData.forEach(p => progressMap.set(p.material_id, p));
            setProgress(progressMap);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const updateProgress = useCallback(async (materialId: string, percentage: number, watchTime: number) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase.from('material_progress').upsert({
        student_id: user.id,
        material_id: materialId,
        watch_percentage: percentage,
        completed: percentage >= 90,
        last_watched_at: new Date().toISOString(),
        total_watch_time: watchTime
      }, {
        onConflict: 'student_id,material_id'
      });

      if (error) {
        console.error('Error updating progress:', error);
      }

      // Increment view count (fire and forget)
      supabase.rpc('increment_material_views', { material_id: materialId }).catch(console.error);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [user?.id]);

  const handleMaterialClick = (material: Material) => {
    setSelectedMaterial(material);
  };

  const handleCloseViewer = () => {
    setSelectedMaterial(null);
    // Refresh progress after closing
    setTimeout(() => fetchData(), 500);
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.material_type === filterType;
    return matchesSearch && matchesType;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'type':
        return a.material_type.localeCompare(b.material_type);
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const stats = {
    total: materials.length,
    completed: Array.from(progress.values()).filter((p: MaterialProgress) => p.completed).length,
    inProgress: Array.from(progress.values()).filter((p: MaterialProgress) => !p.completed && p.watch_percentage > 0).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (batchExpired) {
    return (
      <Card className="p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Batch Access Expired</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your access to this batch has expired. Please contact support to renew your access.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Materials</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-white dark:bg-blue-900/50 rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl text-blue-600">library_books</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-300">Completed</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
            </div>
            <div className="w-14 h-14 bg-white dark:bg-green-900/50 rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-300">In Progress</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.inProgress}</p>
            </div>
            <div className="w-14 h-14 bg-white dark:bg-orange-900/50 rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-3xl text-orange-600">pending</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search materials..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
          >
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="pdf">PDFs</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
          >
            <option value="recent">Most Recent</option>
            <option value="title">Title (A-Z)</option>
            <option value="type">Type</option>
          </select>
        </div>
      </Card>

      {/* Materials Grid */}
      {sortedMaterials.length === 0 ? (
        <EmptyState
          icon="search"
          title="No materials found"
          description={searchTerm || filterType !== 'all' 
            ? "Try adjusting your search or filters" 
            : "No materials have been published yet"}
        />
      ) : (
        <div className="grid gap-4">
          {sortedMaterials.map((material) => {
            const materialProgress = progress.get(material.id);
            const isCompleted = materialProgress?.completed || false;
            const progressPercentage = materialProgress?.watch_percentage || 0;

            return (
              <Card
                key={material.id}
                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => handleMaterialClick(material)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
                      <span className="material-symbols-outlined text-3xl text-blue-600">{getMaterialIcon(material.material_type)}</span>
                    </div>
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{material.title}</h4>
                          <span className={`material-symbols-outlined text-lg ${getProviderColor(material.storage_provider)}`}>{getProviderIcon(material.storage_provider)}</span>
                        </div>
                        {material.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {material.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant={material.material_type === 'video' ? 'purple' : 'blue'}>
                        {material.material_type}
                      </Badge>
                      {material.duration_minutes && (
                        <Badge variant="gray">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDuration(material.duration_minutes)}
                        </Badge>
                      )}
                      {material.file_size_mb && (
                        <Badge variant="gray">
                          {formatFileSize(material.file_size_mb)}
                        </Badge>
                      )}
                      {material.view_count > 0 && (
                        <Badge variant="gray">
                          👁️ {material.view_count} views
                        </Badge>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {progressPercentage > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>{isCompleted ? 'Completed' : 'In Progress'}</span>
                          <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Material Viewer Modal */}
      <Modal
        isOpen={!!selectedMaterial}
        onClose={handleCloseViewer}
        title=""
        size="full"
      >
        {selectedMaterial && (
          <MaterialViewer
            material={selectedMaterial}
            onProgress={(percentage, watchTime) => 
              updateProgress(selectedMaterial.id, percentage, watchTime)
            }
            showInfo={true}
          />
        )}
      </Modal>
    </div>
  );
};

export default Notes;
