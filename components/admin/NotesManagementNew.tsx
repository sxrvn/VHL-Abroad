import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Material, Batch } from '../../types';
import MaterialUploadForm from './MaterialUploadForm';
import { getMaterialIcon, getProviderIcon, getProviderColor, formatFileSize, formatDuration } from '../../lib/materialUtils';
import { Card, Badge, Button, EmptyState, LoadingSpinner } from '../ui';

const NotesManagement: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterBatch, setFilterBatch] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [materialsRes, batchesRes] = await Promise.all([
        supabase
          .from('materials')
          .select(`*, batch:batches(*)`)
          .order('batch_id')
          .order('order_index'),
        supabase
          .from('batches')
          .select('*')
          .order('name'),
      ]);

      if (materialsRes.data) setMaterials(materialsRes.data);
      if (batchesRes.data) setBatches(batchesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (material: Material) => {
    try {
      const { error } = await supabase
        .from('materials')
        .update({ is_published: !material.is_published })
        .eq('id', material.id);

      if (!error) fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm('Delete this material? This action cannot be undone.')) return;

    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (!error) fetchData();
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const duplicateMaterial = async (material: Material) => {
    try {
      const { id, created_at, updated_at, ...materialData } = material;
      const { error } = await supabase.from('materials').insert([{
        ...materialData,
        title: `${material.title} (Copy)`,
        is_published: false
      }]);
      
      if (!error) {
        fetchData();
        alert('Material duplicated successfully!');
      }
    } catch (error) {
      console.error('Error duplicating material:', error);
      alert('Failed to duplicate material');
    }
  };

  const openModal = (material?: Material) => {
    setEditingMaterial(material || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.material_type === filterType;
    const matchesBatch = filterBatch === 'all' || material.batch_id === filterBatch;
    return matchesSearch && matchesType && matchesBatch;
  });

  const groupedMaterials = batches.map((batch) => ({
    batch,
    materials: filteredMaterials.filter((m) => m.batch_id === batch.id),
  }));

  const stats = {
    total: materials.length,
    published: materials.filter(m => m.is_published).length,
    videos: materials.filter(m => m.material_type === 'video').length,
    documents: materials.filter(m => m.material_type !== 'video').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Materials</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-blue-600">library_books</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.published}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-green-600">check_circle</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Videos</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.videos}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-purple-600">play_circle</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documents</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.documents}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-orange-600">description</span>
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
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
          >
            <option value="all">All Batches</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>{batch.name}</option>
            ))}
          </select>
          
          <Button
            onClick={() => openModal()}
            variant="primary"
            className="whitespace-nowrap"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Material
          </Button>
        </div>
      </Card>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <EmptyState
          icon="menu_book"
          title="No materials found"
          description={searchTerm || filterType !== 'all' || filterBatch !== 'all' 
            ? "Try adjusting your filters" 
            : "Start by adding your first learning material"}
          action={{
            label: "Add Material",
            onClick: () => openModal()
          }}
        />
      ) : (
        <div className="space-y-8">
          {groupedMaterials.map(({ batch, materials }) => (
            materials.length > 0 && (
              <div key={batch.id} className="space-y-4">
                {/* Batch Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{batch.name}</h3>
                    <p className="text-sm text-gray-500">{materials.length} materials</p>
                  </div>
                </div>

                {/* Materials Grid */}
                <div className="grid gap-4">
                  {materials.map((material) => (
                    <Card key={material.id} className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
                          <span className="material-symbols-outlined text-3xl text-blue-600">{getMaterialIcon(material.material_type)}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
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
                              <div className="flex flex-wrap gap-2">
                                <Badge variant={material.material_type === 'video' ? 'purple' : 'blue'}>
                                  {material.material_type}
                                </Badge>
                                <Badge variant={material.storage_provider === 'youtube' ? 'red' : 'green'}>
                                  {material.storage_provider === 'youtube' ? 'YouTube' : 'Google Drive'}
                                </Badge>
                                {material.duration_minutes && (
                                  <Badge variant="gray">
                                    {formatDuration(material.duration_minutes)}
                                  </Badge>
                                )}
                                {material.file_size_mb && (
                                  <Badge variant="gray">
                                    {formatFileSize(material.file_size_mb)}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                {material.view_count} views • Created {new Date(material.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 items-end">
                              <button
                                onClick={() => togglePublish(material)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 shadow-md ${
                                  material.is_published
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {material.is_published ? 'Published' : 'Draft'}
                              </button>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openModal(material)}
                                  className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                
                                <button
                                  onClick={() => duplicateMaterial(material)}
                                  className="p-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
                                  title="Duplicate"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                
                                <button
                                  onClick={() => deleteMaterial(material.id)}
                                  className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <MaterialUploadForm
        isOpen={showModal}
        onClose={closeModal}
        onSuccess={fetchData}
        editingMaterial={editingMaterial}
        batches={batches}
      />
    </div>
  );
};

export default NotesManagement;
