import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LiveClass } from '../../types';
import { formatDateTime } from '../../lib/utils';
import { Card, Button, LoadingSpinner, Badge, EmptyState } from '../ui';

const MeetingManagement: React.FC = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*, batch:batches(name)')
        .eq('is_active', true)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      if (data) setLiveClasses(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Meeting link copied to clipboard!');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">
                info
              </span>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  External Meeting Links Only
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This system uses external meeting platforms (Zoom, Google Meet, Microsoft Teams). 
                  Students will be redirected to your provided meeting link when they join a class.
                  No built-in video conferencing or attendance tracking is available.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-black mb-2">Active Live Classes</h2>
          <p className="text-sm opacity-60">Manage external meeting links for scheduled classes</p>
        </div>

        {liveClasses.length === 0 ? (
          <EmptyState
            icon="video_call"
            title="No Active Classes"
            description="Create live classes from the Live Classes section"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal/10 dark:border-white/10">
                  <th className="text-left px-4 py-3 text-sm font-semibold opacity-60">Class Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold opacity-60">Batch</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold opacity-60">Scheduled</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold opacity-60">Duration</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold opacity-60">Meeting Link</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold opacity-60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {liveClasses.map((liveClass) => (
                  <tr 
                    key={liveClass.id} 
                    className="border-b border-charcoal/10 dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold">{liveClass.title}</p>
                        {liveClass.description && (
                          <p className="text-xs opacity-60 mt-1 line-clamp-1">
                            {liveClass.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="info" size="sm">
                        {liveClass.batch?.name || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {formatDateTime(liveClass.scheduled_at)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {liveClass.duration_minutes} min
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={liveClass.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline max-w-[200px] truncate block"
                        >
                          {new URL(liveClass.meeting_link).hostname}
                        </a>
                        <button
                          onClick={() => copyToClipboard(liveClass.meeting_link)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
                          title="Copy link"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={liveClass.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="primary"
                            icon="open_in_new"
                          >
                            Open
                          </Button>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="bg-gray-50 dark:bg-white/5">
        <h3 className="font-bold mb-3">How It Works</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">check_circle</span>
            <span>Create external meetings on Zoom, Google Meet, or Microsoft Teams</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">check_circle</span>
            <span>Add the meeting link when creating a Live Class</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">check_circle</span>
            <span>Students click "Join Class" and are redirected to your external meeting</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">check_circle</span>
            <span>Attendance tracking must be done within your external platform (Zoom, Meet, etc.)</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default MeetingManagement;
