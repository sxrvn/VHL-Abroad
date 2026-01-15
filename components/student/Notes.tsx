import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Video } from '../../types';
import { isBatchExpired } from '../../lib/utils';
import { Card, Badge, Button, EmptyState, LoadingSpinner, Modal } from '../ui';

const Notes: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Video[]>([]);
  const [selectedNote, setSelectedNote] = useState<Video | null>(null);
  const [batchExpired, setBatchExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const watchTimeInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    // Track progress when viewing a note
    if (selectedNote) {
      startTime.current = Date.now();
      startProgressTracking();
    }

    return () => {
      if (watchTimeInterval.current) {
        clearInterval(watchTimeInterval.current);
      }
      if (selectedNote) {
        // Save final progress when closing
        saveProgress(selectedNote.id, 100, Math.floor((Date.now() - startTime.current) / 1000));
      }
    };
  }, [selectedNote]);

  const startProgressTracking = () => {
    // Update progress every 30 seconds
    watchTimeInterval.current = setInterval(() => {
      if (selectedNote) {
        const watchTime = Math.floor((Date.now() - startTime.current) / 1000);
        updateProgress(selectedNote.id, 50, watchTime); // 50% for viewing
      }
    }, 30000);
  };

  const updateProgress = async (videoId: string, percentage: number, watchTime: number) => {
    try {
      const { error } = await supabase.from('learning_progress').upsert({
        student_id: user?.id,
        video_id: videoId,
        watch_percentage: percentage,
        completed: percentage >= 90,
        last_watched_at: new Date().toISOString(),
        total_watch_time: watchTime
      });
      
      if (error) console.error('Error updating progress:', error);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveProgress = async (videoId: string, percentage: number, watchTime: number) => {
    await updateProgress(videoId, percentage, watchTime);
  };

  const fetchData = async () => {
    try {
      const { data: enrollment } = await supabase
        .from('batch_students')
        .select('*')
        .eq('student_id', user?.id)
        .single();

      if (enrollment) {
        setBatchExpired(isBatchExpired(enrollment.access_expiry));
        
        const { data } = await supabase
          .from('videos')
          .select('*')
          .eq('batch_id', enrollment.batch_id)
          .eq('is_published', true)
          .order('order_index');

        if (data) setNotes(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNoteTypeInfo = (url: string) => {
    if (url.includes('http') && (url.includes('youtube') || url.includes('vimeo') || url.includes('youtu.be'))) {
      return { icon: 'videocam', label: 'Video', bgGradient: 'from-purple-500/20 to-pink-500/20' };
    } else if (url.includes('.mp3') || url.includes('.wav') || url.includes('audio')) {
      return { icon: 'headphones', label: 'Audio', bgGradient: 'from-blue-500/20 to-cyan-500/20' };
    }
    return { icon: 'description', label: 'Document', bgGradient: 'from-green-500/20 to-emerald-500/20' };
  };

  const handleViewNote = (note: Video) => {
    setSelectedNote(note);
  };

  const closeViewer = () => {
    setSelectedNote(null);
  };

  if (loading) return <LoadingSpinner />;

  if (batchExpired) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-500">
        <EmptyState
          icon="lock"
          title="Access Expired"
          description="Your batch access has expired. Please contact support to renew."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {notes.length === 0 ? (
        <Card className="text-center py-16">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-orange-500">description</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No Study Notes</h3>
          <p className="text-base opacity-60">Your instructor will upload study materials soon. Check back later!</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => {
            const typeInfo = getNoteTypeInfo(note.video_url);
            const badgeVariant = 
              typeInfo.label === 'Video' ? 'purple' : 
              typeInfo.label === 'Audio' ? 'info' : 'success';
            
            return (
              <Card key={note.id} hover padding="none" className="overflow-hidden group">
                <div className={`aspect-video bg-gradient-to-br ${typeInfo.bgGradient} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="relative transform group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-6xl">{typeInfo.icon}</span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant={badgeVariant} size="sm" className="shadow-lg">
                      {typeInfo.label}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-white text-sm font-bold">
                      <span className="material-symbols-outlined">play_circle</span>
                      <span>View Content</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg mb-2 line-clamp-2 leading-tight">{note.title}</h3>
                  {note.description && (
                    <p className="text-sm opacity-70 mb-4 line-clamp-2 leading-relaxed">{note.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold opacity-50">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      <span>
                        {new Date(note.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleViewNote(note)}
                      variant="primary"
                      size="sm"
                      icon={typeInfo.label === 'Video' ? 'play_arrow' : typeInfo.label === 'Audio' ? 'headphones' : 'visibility'}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Note Viewer Modal */}
      <Modal
        isOpen={!!selectedNote}
        onClose={closeViewer}
        title={selectedNote?.title || ''}
        size="xl"
      >
        {selectedNote && (
          <div className="space-y-4">
            {selectedNote.description && (
              <p className="text-sm opacity-60">{selectedNote.description}</p>
            )}
            
            {(() => {
              const typeInfo = getNoteTypeInfo(selectedNote.video_url);
              
              if (typeInfo.label === 'Video') {
                const isYouTube = selectedNote.video_url.includes('youtube') || selectedNote.video_url.includes('youtu.be');
                const isVimeo = selectedNote.video_url.includes('vimeo');
                
                if (isYouTube) {
                  const videoId = selectedNote.video_url.includes('youtu.be') 
                    ? selectedNote.video_url.split('youtu.be/')[1]?.split('?')[0]
                    : new URLSearchParams(new URL(selectedNote.video_url).search).get('v');
                  
                  return (
                    <div className="aspect-video rounded-xl overflow-hidden bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  );
                } else if (isVimeo) {
                  const videoId = selectedNote.video_url.split('vimeo.com/')[1]?.split('?')[0];
                  return (
                    <div className="aspect-video rounded-xl overflow-hidden bg-black">
                      <iframe
                        src={`https://player.vimeo.com/video/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                      />
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-10">
                      <EmptyState
                        icon="smart_display"
                        title="Video Resource"
                        description="This video is hosted externally"
                        action={
                          <Button
                            onClick={() => window.open(selectedNote.video_url, '_blank')}
                            variant="primary"
                            icon="open_in_new"
                          >
                            Open Video
                          </Button>
                        }
                      />
                    </div>
                  );
                }
              } else if (typeInfo.label === 'Audio') {
                // Convert Google Drive preview URL to direct audio URL if needed
                let audioUrl = selectedNote.video_url;
                const driveFileIdMatch = audioUrl.match(/\/file\/d\/([^\/\?]+)/);
                if (driveFileIdMatch && audioUrl.includes('drive.google.com')) {
                  audioUrl = `https://drive.google.com/uc?export=view&id=${driveFileIdMatch[1]}`;
                }
                
                return (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 text-center">
                    <span className="material-symbols-outlined text-5xl text-blue-600 mb-4">headphones</span>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md mb-4">
                      <audio controls className="w-full" preload="metadata">
                        <source src={audioUrl} type="audio/mpeg" />
                        <source src={audioUrl} type="audio/mp3" />
                        <source src={audioUrl} type="audio/wav" />
                        <source src={audioUrl} type="audio/ogg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      If audio doesn't play, try downloading the file below.
                    </p>
                    <Button
                      onClick={() => window.open(driveFileIdMatch ? `https://drive.google.com/uc?export=download&id=${driveFileIdMatch[1]}` : selectedNote.video_url, '_blank')}
                      variant="primary"
                      icon="download"
                    >
                      Download Audio
                    </Button>
                  </div>
                );
              } else {
                const isPDF = selectedNote.video_url.toLowerCase().includes('.pdf');
                
                return (
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6">
                    {isPDF && (
                      <div className="mb-4 aspect-[3/4] bg-white rounded-xl overflow-hidden shadow-lg">
                        <iframe
                          src={selectedNote.video_url}
                          className="w-full h-full"
                          title="PDF Viewer"
                        />
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => window.open(selectedNote.video_url, '_blank')}
                        variant="primary"
                        icon="open_in_new"
                      >
                        Open Document
                      </Button>
                      <Button
                        onClick={() => window.open(selectedNote.video_url, '_blank')}
                        variant="secondary"
                        icon="download"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notes;
