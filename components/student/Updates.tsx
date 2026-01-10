import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, EmptyState, LoadingSpinner } from '../ui';

interface Update {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'class' | 'content' | 'exam';
  created_at: string;
}

const Updates: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      general: 'info',
      class: 'video_call',
      content: 'description',
      exam: 'assignment'
    };
    return icons[type as keyof typeof icons] || 'notifications';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      general: 'from-blue-500 to-cyan-500',
      class: 'from-purple-500 to-indigo-500',
      content: 'from-green-500 to-emerald-500',
      exam: 'from-orange-500 to-pink-500'
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      content: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      exam: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">


      {/* Updates List */}
      {updates.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon="notifications"
            title="No updates yet"
            description="You'll see all important updates and announcements here"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => (
            <Card key={update.id} className="p-5">
              <div className="flex items-start gap-3">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg opacity-60">
                        {getTypeIcon(update.type)}
                      </span>
                      <h3 className="font-semibold">{update.title}</h3>
                    </div>
                    <span className="text-xs opacity-50 flex-shrink-0">
                      {formatDate(update.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm opacity-70 leading-relaxed mb-3 whitespace-pre-wrap">
                    {update.message}
                  </p>

                  <span className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${getTypeBadgeColor(update.type)}`}>
                    {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Updates;
