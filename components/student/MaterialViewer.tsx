import React, { useEffect, useRef, useCallback } from 'react';
import type { Material } from '../../types';
import { getEmbedUrl, formatFileSize, formatDuration, getMaterialIcon } from '../../lib/materialUtils';

interface MaterialViewerProps {
  material: Material;
  onProgress?: (percentage: number, watchTime: number) => void;
  showInfo?: boolean;
}

const MaterialViewer: React.FC<MaterialViewerProps> = ({ 
  material, 
  onProgress,
  showInfo = true 
}) => {
  const startTimeRef = useRef<number>(Date.now());
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const reportProgress = useCallback((percentage: number) => {
    if (onProgress && isMountedRef.current) {
      const watchTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onProgress(percentage, watchTime);
    }
  }, [onProgress]);

  useEffect(() => {
    isMountedRef.current = true;
    startTimeRef.current = Date.now();

    // Only track progress for videos, not for documents/PDFs
    if (onProgress && (material.material_type === 'video' || material.material_type === 'audio')) {
      progressIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          reportProgress(50);
        }
      }, 30000);
    }

    return () => {
      isMountedRef.current = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // Report final progress only for video/audio content
      if (material.material_type === 'video' || material.material_type === 'audio') {
        const watchTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        // Only report if watched for more than 5 seconds
        if (watchTime > 5 && onProgress) {
          onProgress(100, watchTime);
        }
      }
    };
  }, [material.id, material.material_type, onProgress, reportProgress]);

  const embedUrl = getEmbedUrl(
    material.storage_provider,
    material.external_url,
    material.material_type
  );

  const renderViewer = useCallback(() => {
    if (material.storage_provider === 'youtube' && material.material_type === 'video') {
      return (
        <div className="relative w-full pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={material.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }

    if (material.storage_provider === 'google_drive' && material.material_type === 'audio') {
      const driveId = extractDriveId(material.external_url);
      return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-lg">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '4rem' }}>audio_file</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mb-6">
              <iframe
                src={`https://drive.google.com/file/d/${driveId}/preview`}
                className="w-full h-16"
                allow="autoplay"
                title={material.title}
              />
            </div>
            <div className="flex justify-center">
              <a
                href={`https://drive.google.com/uc?export=download&id=${driveId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (material.storage_provider === 'google_drive') {
      return (
        <div className="relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={material.title}
            allow="autoplay"
          />
        </div>
      );
    }

    if (material.material_type === 'image') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <img 
            src={embedUrl} 
            alt={material.title}
            className="max-w-full h-auto mx-auto rounded"
          />
        </div>
      );
    }

    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <p className="text-gray-500">Preview not available for this file type.</p>
        <a 
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open in New Tab
        </a>
      </div>
    );
  }, [embedUrl, material]);

  const extractDriveId = (url: string): string => {
    const match = url.match(/\/d\/([^/]+)/);
    return match?.[1] || '';
  };

  return (
    <div className="space-y-4">
      {/* Material Info Header */}
      {showInfo && (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-2xl text-blue-600">{getMaterialIcon(material.material_type)}</span>
              <h2 className="text-2xl font-bold text-gray-900">{material.title}</h2>
            </div>
            {material.description && (
              <p className="text-gray-600 mb-3">{material.description}</p>
            )}
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              {material.duration_minutes && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(material.duration_minutes)}
                </span>
              )}
              {material.file_size_mb && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {formatFileSize(material.file_size_mb)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {material.view_count} views
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Material Viewer */}
      {renderViewer()}

      {/* Download Button for Google Drive files (except audio which has its own buttons) */}
      {material.storage_provider === 'google_drive' && material.external_url && material.material_type !== 'audio' && (
        <div className="flex justify-center">
          <a
            href={`https://drive.google.com/uc?export=download&id=${extractDriveId(material.external_url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download File
          </a>
        </div>
      )}
    </div>
  );
};

export default MaterialViewer;
