import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

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
      return { icon: '🎥', label: 'Video', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', bgGradient: 'from-purple-500/20 to-pink-500/20' };
    } else if (url.includes('.mp3') || url.includes('.wav') || url.includes('audio')) {
      return { icon: '🎧', label: 'Audio', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', bgGradient: 'from-blue-500/20 to-cyan-500/20' };
    }
    return { icon: '📄', label: 'Document', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', bgGradient: 'from-green-500/20 to-emerald-500/20' };
  };

  const handleViewNote = (note: Video) => {
    setSelectedNote(note);
  };

  const closeViewer = () => {
    setSelectedNote(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

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
      <div>
        <h2 className="text-2xl font-bold">Study Notes</h2>
      {notes.length === 0 ? (
        <Card>
          <EmptyState
            icon="description"
            title="No Study Notes"
            description="Your instructor will upload study materials soon. Check back later!"
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => {
            const typeInfo = getNoteTypeInfo(note.video_url);
            const badgeVariant = 
              typeInfo.label === 'Video' ? 'purple' : 
              typeInfo.label === 'Audio' ? 'info' : 'success';
            
            return (
              <Card key={note.id} hover padding="none">
                <div className={`aspect-video bg-gradient-to-br ${typeInfo.bgGradient} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="relative text-5xl">
                    {typeInfo.icon}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={badgeVariant} size="sm">
                      {typeInfo.label}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base mb-2 line-clamp-2">{note.title}</h3>
                  {note.description && (
                    <p className="text-sm opacity-60 mb-3 line-clamp-2">{note.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-40">
                      {new Date(note.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
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
                return (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 text-center">
                    <span className="material-symbols-outlined text-5xl text-blue-600 mb-4">headphones</span>
                    <audio controls className="w-full mb-4" preload="metadata">
                      <source src={selectedNote.video_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <Button
                      onClick={() => window.open(selectedNote.video_url, '_blank')}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="relative text-6xl transform group-hover:scale-110 transition-transform duration-300">
                    {typeInfo.icon}
                  </div>
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${typeInfo.color} backdrop-blur-sm`}>
                    {typeInfo.label}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{note.title}</h3>
                  {note.description && (
                    <p className="text-sm opacity-60 mb-4 line-clamp-2">{note.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-40">
                      {new Date(note.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <button
                      onClick={() => handleViewNote(note)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {typeInfo.label === 'Video' ? 'play_arrow' : typeInfo.label === 'Audio' ? 'headphones' : 'visibility'}
                      </span>
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Viewer Modal */}
      {selectedNote && (
        <>
          <div className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" onClick={closeViewer} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-bg-dark rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-charcoal/10 dark:border-white/10 bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {getNoteTypeInfo(selectedNote.video_url).icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedNote.title}</h3>
                    {selectedNote.description && (
                      <p className="text-sm opacity-60 mt-1">{selectedNote.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeViewer}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {(() => {
                  const typeInfo = getNoteTypeInfo(selectedNote.video_url);
                  
                  if (typeInfo.label === 'Video') {
                    // Video embed or link
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
                          <span className="material-symbols-outlined text-6xl text-primary mb-4">smart_display</span>
                          <p className="text-lg font-semibold mb-4">Video Resource</p>
                          <a
                            href={selectedNote.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-lg font-semibold"
                          >
                            <span className="material-symbols-outlined">open_in_new</span>
                            Open Video in New Tab
                          </a>
                        </div>
                      );
                    }
                  } else if (typeInfo.label === 'Audio') {
                    // Audio player
                    return (
                      <div className="max-w-2xl mx-auto">
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 text-center">
                          <span className="material-symbols-outlined text-6xl text-blue-600 mb-4">headphones</span>
                          <p className="text-lg font-semibold mb-6">Audio Recording</p>
                          <audio controls className="w-full mb-6" preload="metadata">
                            <source src={selectedNote.video_url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                          <a
                            href={selectedNote.video_url}
                            download
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg font-semibold"
                          >
                            <span className="material-symbols-outlined">download</span>
                            Download Audio
                          </a>
                        </div>
                      </div>
                    );
                  } else {
                    // Document viewer
                    const isPDF = selectedNote.video_url.toLowerCase().includes('.pdf');
                    
                    return (
                      <div className="max-w-2xl mx-auto">
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-8 text-center">
                          <span className="material-symbols-outlined text-6xl text-green-600 mb-4">description</span>
                          <p className="text-lg font-semibold mb-6">Document Resource</p>
                          
                          {isPDF && (
                            <div className="mb-6 aspect-[3/4] bg-white rounded-xl overflow-hidden shadow-lg">
                              <iframe
                                src={selectedNote.video_url}
                                className="w-full h-full"
                                title="PDF Viewer"
                              />
                            </div>
                          )}
                          
                          <div className="flex gap-3 justify-center">
                            <a
                              href={selectedNote.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg font-semibold"
                            >
                              <span className="material-symbols-outlined">open_in_new</span>
                              Open Document
                            </a>
                            <a
                              href={selectedNote.video_url}
                              download
                              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-green-600 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all font-semibold"
                            >
                              <span className="material-symbols-outlined">download</span>
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notes;
