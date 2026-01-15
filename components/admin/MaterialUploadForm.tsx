import React, { useState, useEffect } from 'react';
import { Material, Batch } from '../../types';
import { 
  validateMaterial, 
  detectProvider, 
  suggestMaterialType,
  parseYoutubeUrl,
  parseDriveUrl,
  getMaterialIcon,
  getProviderIcon
} from '../../lib/materialUtils';
import { supabase } from '../../lib/supabase';
import { Button, Modal } from '../ui';

interface MaterialUploadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingMaterial?: Material | null;
  batches: Batch[];
}

const MaterialUploadForm: React.FC<MaterialUploadFormProps> = ({
  isOpen,
  onClose,
  editingMaterial,
  onSuccess,
  batches
}) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'google_drive'>('youtube');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [urlPreview, setUrlPreview] = useState<{
    isValid: boolean;
    thumbnailUrl?: string;
    error?: string;
  }>({ isValid: false });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    batchId: '',
    materialType: 'video' as 'video' | 'pdf' | 'audio' | 'document' | 'image',
    storageProvider: 'youtube' as 'youtube' | 'google_drive',
    fileSizeMb: '',
    durationMinutes: '',
    isPublished: false,
    orderIndex: 0
  });

  useEffect(() => {
    if (editingMaterial) {
      setFormData({
        title: editingMaterial.title,
        description: editingMaterial.description || '',
        url: editingMaterial.external_url,
        batchId: editingMaterial.batch_id,
        materialType: editingMaterial.material_type,
        storageProvider: editingMaterial.storage_provider,
        fileSizeMb: editingMaterial.file_size_mb?.toString() || '',
        durationMinutes: editingMaterial.duration_minutes?.toString() || '',
        isPublished: editingMaterial.is_published,
        orderIndex: editingMaterial.order_index
      });
      setActiveTab(editingMaterial.storage_provider);
    } else {
      resetForm();
    }
  }, [editingMaterial, isOpen]);

  useEffect(() => {
    // Auto-detect provider and validate URL
    if (formData.url) {
      const provider = detectProvider(formData.url);
      if (provider) {
        setFormData(prev => ({ ...prev, storageProvider: provider }));
        setActiveTab(provider);
        
        // Auto-suggest material type
        const suggestedType = suggestMaterialType(formData.url);
        setFormData(prev => ({ 
          ...prev, 
          materialType: suggestedType as any 
        }));
        
        // Preview URL
        validateUrl(formData.url, provider);
      }
    }
  }, [formData.url]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      batchId: '',
      materialType: activeTab === 'youtube' ? 'video' : 'pdf',
      storageProvider: activeTab,
      fileSizeMb: '',
      durationMinutes: '',
      isPublished: false,
      orderIndex: 0
    });
    setErrors([]);
    setUrlPreview({ isValid: false });
  };

  const validateUrl = (url: string, provider: string) => {
    if (provider === 'youtube') {
      const parsed = parseYoutubeUrl(url);
      setUrlPreview({
        isValid: parsed.isValid,
        thumbnailUrl: parsed.thumbnailUrl,
        error: parsed.error
      });
    } else if (provider === 'google_drive') {
      const parsed = parseDriveUrl(url);
      setUrlPreview({
        isValid: parsed.isValid,
        thumbnailUrl: parsed.thumbnailUrl,
        error: parsed.error
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validate
    const validation = validateMaterial({
      title: formData.title,
      materialType: formData.materialType,
      storageProvider: formData.storageProvider,
      url: formData.url,
      batchId: formData.batchId
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Parse URL to get proper format
      let externalUrl = formData.url;
      let thumbnailUrl = '';

      if (formData.storageProvider === 'youtube') {
        const parsed = parseYoutubeUrl(formData.url);
        externalUrl = formData.url; // Keep original URL
        thumbnailUrl = parsed.thumbnailUrl || '';
      } else if (formData.storageProvider === 'google_drive') {
        const parsed = parseDriveUrl(formData.url);
        externalUrl = parsed.embedUrl;
        thumbnailUrl = parsed.thumbnailUrl || '';
      }

      const materialData = {
        title: formData.title,
        description: formData.description || null,
        material_type: formData.materialType,
        storage_provider: formData.storageProvider,
        external_url: externalUrl,
        batch_id: formData.batchId,
        file_size_mb: formData.fileSizeMb ? parseFloat(formData.fileSizeMb) : null,
        duration_minutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
        thumbnail_url: thumbnailUrl || null,
        is_published: formData.isPublished,
        order_index: formData.orderIndex,
        created_by: user?.id
      };

      let error;
      if (editingMaterial) {
        const result = await supabase
          .from('materials')
          .update(materialData)
          .eq('id', editingMaterial.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('materials')
          .insert([materialData]);
        error = result.error;
      }

      if (error) throw error;

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error saving material:', error);
      setErrors([error.message || 'Failed to save material']);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'youtube' | 'google_drive') => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      storageProvider: tab,
      materialType: tab === 'youtube' ? 'video' : 'pdf',
      url: ''
    }));
    setUrlPreview({ isValid: false });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingMaterial ? 'Edit Material' : 'Add New Material'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Selector */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => handleTabChange('youtube')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
              activeTab === 'youtube'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="material-symbols-outlined">{getProviderIcon('youtube')}</span>
            YouTube Video
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('google_drive')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
              activeTab === 'google_drive'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="material-symbols-outlined">{getProviderIcon('google_drive')}</span>
            Google Drive File
          </button>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900 mb-1">Please fix the following errors:</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter material title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add a brief description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a batch</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {activeTab === 'youtube' ? 'YouTube URL' : 'Google Drive Share Link'} <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={
              activeTab === 'youtube'
                ? 'https://www.youtube.com/watch?v=...'
                : 'https://drive.google.com/file/d/...'
            }
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            {activeTab === 'youtube'
              ? 'Paste the YouTube video URL. The video should be set to "Unlisted" or "Public".'
              : 'Paste the Google Drive share link. Make sure the file is shared as "Anyone with the link can view".'}
          </p>
          
          {/* URL Preview */}
          {formData.url && urlPreview.isValid && urlPreview.thumbnailUrl && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <img 
                  src={urlPreview.thumbnailUrl} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Valid URL detected
                </div>
              </div>
            </div>
          )}
          
          {formData.url && !urlPreview.isValid && urlPreview.error && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">{urlPreview.error}</p>
            </div>
          )}
        </div>

        {/* Material Type (for Google Drive) */}
        {activeTab === 'google_drive' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['pdf', 'audio', 'document', 'image', 'video'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, materialType: type as any })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    formData.materialType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{getMaterialIcon(type)}</span>
                  <span className="text-sm font-medium capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Optional Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 45"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Size (MB)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.fileSizeMb}
              onChange={(e) => setFormData({ ...formData, fileSizeMb: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 25.5"
              min="0"
            />
          </div>
        </div>

        {/* Publishing Options */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="isPublished" className="flex-1 cursor-pointer">
            <span className="block text-sm font-medium text-gray-900">Publish immediately</span>
            <span className="block text-sm text-gray-500">Make this material visible to students right away</span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Saving...' : editingMaterial ? 'Update Material' : 'Add Material'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MaterialUploadForm;
