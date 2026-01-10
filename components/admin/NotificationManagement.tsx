import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, Button, LoadingSpinner, EmptyState } from '../ui';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'class' | 'content' | 'exam';
  send_to: 'all' | 'batch';
  batch_id: string | null;
  created_at: string;
  created_by: string;
}

interface Batch {
  id: string;
  name: string;
}

const NotificationManagement: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as 'general' | 'class' | 'content' | 'exam',
    send_to: 'all' as 'all' | 'batch',
    batch_id: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchBatches();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSentNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleTemplateClick = (template: string) => {
    const templates = {
      'Class Reminder': {
        title: 'Upcoming Class Reminder',
        message: 'This is a reminder about your upcoming class. Please make sure to join on time.',
        type: 'class' as const
      },
      'New Content': {
        title: 'New Content Available',
        message: 'New learning content has been added to your dashboard. Check it out now!',
        type: 'content' as const
      },
      'Exam Notice': {
        title: 'Exam Notification',
        message: 'An exam has been scheduled. Please review the details and prepare accordingly.',
        type: 'exam' as const
      },
      'General Update': {
        title: 'General Update',
        message: 'We have an important update to share with you.',
        type: 'general' as const
      }
    };

    const selectedTemplate = templates[template as keyof typeof templates];
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        ...selectedTemplate
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const notificationData: any = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        send_to: formData.send_to,
        created_by: profile?.id
      };

      if (formData.send_to === 'batch' && formData.batch_id) {
        notificationData.batch_id = formData.batch_id;
      }

      const { error } = await supabase
        .from('notifications')
        .insert([notificationData]);

      if (error) throw error;

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'general',
        send_to: 'all',
        batch_id: ''
      });

      // Refresh notifications list
      await fetchNotifications();

      alert('Notification sent successfully!');
    } catch (error: any) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh notifications list
      await fetchNotifications();
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification: ' + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      content: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      exam: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Send Notification */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-1">Send Notification</h2>
        <p className="text-sm opacity-60 mb-6">Create and send notifications to students</p>

        {/* Quick Templates */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Quick Templates</label>
          <div className="flex flex-wrap gap-2">
            {['Class Reminder', 'New Content', 'Exam Notice', 'General Update'].map((template) => (
              <button
                key={template}
                onClick={() => handleTemplateClick(template)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Notification title"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your notification message here..."
              required
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Notification Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="general">General</option>
              <option value="class">Class</option>
              <option value="content">Content</option>
              <option value="exam">Exam</option>
            </select>
          </div>

          {/* Send To */}
          <div>
            <label className="block text-sm font-medium mb-2">Send To</label>
            <select
              value={formData.send_to}
              onChange={(e) => setFormData({ ...formData, send_to: e.target.value as any, batch_id: '' })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="all">All Students</option>
              <option value="batch">Specific Batch</option>
            </select>
          </div>

          {/* Batch Selection (conditional) */}
          {formData.send_to === 'batch' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Batch <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.batch_id}
                onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="">Select a batch...</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Sending...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                Send Notification
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Right Side - Sent Notifications */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-1">Sent Notifications</h2>
        <p className="text-sm opacity-60 mb-4">Recently sent notifications</p>

        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
          {sentNotifications.length === 0 ? (
            <EmptyState
              icon="notifications"
              title="No notifications sent yet"
              description="Sent notifications will appear here"
            />
          ) : (
            sentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 truncate">{notification.title}</h3>
                    <p className="text-xs opacity-70 line-clamp-2">{notification.message}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                    title="Delete notification"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 text-xs rounded font-medium ${getTypeColor(notification.type)}`}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700">
                    {notification.send_to === 'all' ? 'All Students' : 'Batch'}
                  </span>
                  <span className="text-xs opacity-50 ml-auto">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationManagement;
