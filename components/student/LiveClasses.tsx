import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LiveClass } from '../../types';
import { formatDateTime, getClassStatus, isBatchExpired } from '../../lib/utils';
import { Card, Badge, Button, EmptyState, LoadingSpinner } from '../ui';

const LiveClasses: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [batchExpired, setBatchExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: enrollment } = await supabase
        .from('batch_students')
        .select('*, batch:batches(*)')
        .eq('student_id', user?.id)
        .single();

      if (enrollment) {
        setBatchExpired(isBatchExpired(enrollment.access_expiry));
        
        const { data } = await supabase
          .from('live_classes')
          .select('*')
          .eq('batch_id', enrollment.batch_id)
          .eq('is_active', true)
          .order('scheduled_at', { ascending: false });

        if (data) setClasses(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
      {classes.length === 0 ? (
        <Card className="text-center py-16">
          <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-blue-500">video_call</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">No Live Classes</h3>
          <p className="text-base opacity-60">No live classes are scheduled at the moment. Check back later!</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {classes.map((lc) => {
            const status = getClassStatus(lc.scheduled_at, lc.duration_minutes);
            const statusVariant = status === 'live' ? 'error' : status === 'upcoming' ? 'info' : 'default';
            
            return (
              <Card key={lc.id} hover className="relative overflow-hidden">
                {status === 'live' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 animate-pulse"></div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
                        <span className="material-symbols-outlined text-2xl">video_call</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black tracking-tight">{lc.title}</h3>
                        <Badge 
                          variant={statusVariant} 
                          size="sm"
                          className={status === 'live' ? 'animate-pulse shadow-lg shadow-red-500/30' : ''}
                        >
                          {status === 'live' ? '🔴 LIVE NOW' : status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {lc.description && (
                      <p className="text-sm opacity-70 mb-4 leading-relaxed">{lc.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/10">
                        <span className="material-symbols-outlined text-base text-primary">schedule</span>
                        <span>{formatDateTime(lc.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/10">
                        <span className="material-symbols-outlined text-base text-primary">timer</span>
                        <span>{lc.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                  {(status === 'upcoming' || status === 'live') && (
                    <a
                      href={lc.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant={status === 'live' ? 'danger' : 'primary'}
                        icon="video_call"
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        {status === 'live' ? 'Join Now' : 'Join Class'}
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
