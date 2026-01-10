import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Video } from '../../types';
import { isBatchExpired } from '../../lib/utils';

const RecordedVideos: React.FC = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
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

        if (data) setVideos(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;

  if (batchExpired) {
    return (
      <div className="text-center py-20 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-500">
        <span className="material-symbols-outlined text-6xl text-red-600">lock</span>
        <p className="mt-4 text-lg font-semibold text-red-800 dark:text-red-400">Access Expired</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Recorded Videos</h2>
        <p className="text-sm opacity-60 mt-1">Watch course content</p>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-xl border border-charcoal/10 dark:border-white/10">
          <span className="material-symbols-outlined text-6xl opacity-20">video_library</span>
          <p className="mt-4 text-lg font-semibold">No videos available yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white dark:bg-white/5 rounded-xl border border-charcoal/10 dark:border-white/10 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl sm:text-6xl text-primary">play_circle</span>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-bold mb-2 text-sm sm:text-base">{video.title}</h3>
                {video.description && (
                  <p className="text-sm opacity-60 mb-3 line-clamp-2">{video.description}</p>
                )}
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm sm:text-base"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">play_arrow</span>
                  Watch Video
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordedVideos;
