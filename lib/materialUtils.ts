/**
 * Material Utils - Helper functions for file upload system
 * Handles YouTube and Google Drive URL parsing, validation, and metadata extraction
 */

export interface MaterialMetadata {
  videoId?: string;
  fileId?: string;
  embedUrl: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  isValid: boolean;
  error?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/v/
 */
export const extractYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\s?]+)/,
    /youtube\.com\/.*[?&]v=([^&\s]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Extract Google Drive file ID from share URL
 * Supports: drive.google.com/file/d/, drive.google.com/open?id=
 */
export const extractDriveFileId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /\/file\/d\/([^\/\?]+)/,
    /\/d\/([^\/\?]+)/,
    /[?&]id=([^&]+)/,
    /^([a-zA-Z0-9_-]{25,})$/ // Direct file ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Validate and parse YouTube URL
 */
export const parseYoutubeUrl = (url: string): MaterialMetadata => {
  const videoId = extractYoutubeVideoId(url);

  if (!videoId) {
    return {
      embedUrl: '',
      isValid: false,
      error: 'Invalid YouTube URL. Please use a valid YouTube video link.'
    };
  }

  return {
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    isValid: true
  };
};

/**
 * Validate and parse Google Drive URL
 */
export const parseDriveUrl = (url: string): MaterialMetadata => {
  const fileId = extractDriveFileId(url);

  if (!fileId) {
    return {
      embedUrl: '',
      isValid: false,
      error: 'Invalid Google Drive URL. Please use a valid share link or file ID.'
    };
  }

  return {
    fileId,
    embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}`,
    isValid: true
  };
};

/**
 * Get material type icon class
 */
export const getMaterialIcon = (type: string): string => {
  const icons: Record<string, string> = {
    video: 'play_circle',
    pdf: 'picture_as_pdf',
    audio: 'audio_file',
    document: 'description',
    image: 'image'
  };
  return icons[type] || 'attach_file';
};

/**
 * Get storage provider icon class or logo
 */
export const getProviderIcon = (provider: string): string => {
  const icons: Record<string, string> = {
    youtube: 'smart_display',
    google_drive: 'folder'
  };
  return icons[provider] || 'cloud';
};

/**
 * Get storage provider color class
 */
export const getProviderColor = (provider: string): string => {
  const colors: Record<string, string> = {
    youtube: 'text-red-600',
    google_drive: 'text-blue-600'
  };
  return colors[provider] || 'text-gray-600';
};

/**
 * Format file size
 */
export const formatFileSize = (sizeMb?: number): string => {
  if (!sizeMb) return 'Unknown';
  if (sizeMb < 1) return `${Math.round(sizeMb * 1024)} KB`;
  if (sizeMb > 1024) return `${(sizeMb / 1024).toFixed(2)} GB`;
  return `${sizeMb.toFixed(2)} MB`;
};

/**
 * Format duration
 */
export const formatDuration = (minutes?: number): string => {
  if (!minutes) return 'Unknown';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Validate material data before submission
 */
export const validateMaterial = (data: {
  title: string;
  materialType: string;
  storageProvider: string;
  url: string;
  batchId: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('Title is required');
  }

  if (!data.batchId) {
    errors.push('Batch selection is required');
  }

  if (!data.url?.trim()) {
    errors.push('URL is required');
  }

  // Validate URL format based on provider
  if (data.storageProvider === 'youtube') {
    const parsed = parseYoutubeUrl(data.url);
    if (!parsed.isValid) {
      errors.push(parsed.error || 'Invalid YouTube URL');
    }
  } else if (data.storageProvider === 'google_drive') {
    const parsed = parseDriveUrl(data.url);
    if (!parsed.isValid) {
      errors.push(parsed.error || 'Invalid Google Drive URL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get embed URL based on provider and type
 */
export const getEmbedUrl = (
  provider: string,
  url: string,
  type: string
): string => {
  if (provider === 'youtube') {
    const parsed = parseYoutubeUrl(url);
    return parsed.embedUrl;
  } else if (provider === 'google_drive') {
    const parsed = parseDriveUrl(url);
    // For audio files, use direct download URL for proper playback
    if (type === 'audio') {
      return `https://drive.google.com/uc?export=download&id=${parsed.fileId}`;
    }
    return parsed.embedUrl;
  }
  return url;
};

/**
 * Check if URL is a YouTube URL
 */
export const isYoutubeUrl = (url: string): boolean => {
  return /(?:youtube\.com|youtu\.be)/.test(url);
};

/**
 * Check if URL is a Google Drive URL
 */
export const isDriveUrl = (url: string): boolean => {
  return /drive\.google\.com/.test(url);
};

/**
 * Auto-detect storage provider from URL
 */
export const detectProvider = (url: string): 'youtube' | 'google_drive' | null => {
  if (isYoutubeUrl(url)) return 'youtube';
  if (isDriveUrl(url)) return 'google_drive';
  return null;
};

/**
 * Get material type suggestions based on URL
 */
export const suggestMaterialType = (url: string): string => {
  if (isYoutubeUrl(url)) return 'video';
  
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('.pdf')) return 'pdf';
  if (lowerUrl.includes('.mp3') || lowerUrl.includes('.wav') || lowerUrl.includes('.m4a')) return 'audio';
  if (lowerUrl.includes('.doc') || lowerUrl.includes('.ppt') || lowerUrl.includes('.txt')) return 'document';
  if (lowerUrl.includes('.jpg') || lowerUrl.includes('.png') || lowerUrl.includes('.jpeg')) return 'image';
  
  return 'document';
};
