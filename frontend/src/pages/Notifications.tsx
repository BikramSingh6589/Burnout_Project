import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Bell, Check, Trash2, Calendar, ShieldAlert, Sparkles, Clipboard, Bot } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { 
    notifications, 
    unreadNotificationCount, 
    markNotificationRead, 
    markAllNotificationsRead, 
    deleteNotification, 
    deleteAllNotifications, 
    fetchNotifications 
  } = useStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const [activeTab, setActiveTab] = useState<string>('All');

  const getTabType = (tab: string) => {
    switch (tab) {
      case 'Assessment': return 'assessment_reminder';
      case 'Risk': return 'risk_alert';
      case 'Recommendation': return 'recommendation';
      case 'AI Alert': return 'ai_alert';
      case 'System': return 'system';
      default: return '';
    }
  };

  const filteredNotifications = activeTab === 'All'
    ? notifications
    : notifications.filter(n => n.type === getTabType(activeTab));

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'risk_alert':
        return <ShieldAlert className="h-5 w-5 text-error" />;
      case 'assessment_reminder':
        return <Clipboard className="h-5 w-5 text-primary dark:text-[#4F46E5]" />;
      case 'recommendation':
        return <Sparkles className="h-5 w-5 text-secondary" />;
      case 'ai_alert':
        return <Bot className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-neutral-outline dark:text-[#CBD5E1]" />;
    }
  };

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case 'risk_alert':
        return 'bg-error/10 text-error border-error/20';
      case 'assessment_reminder':
        return 'bg-primary/10 text-primary border-primary/20 dark:border-[#4F46E5]/30';
      case 'recommendation':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'ai_alert':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      default:
        return 'bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155]';
    }
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'assessment_reminder': return 'Assessment';
      case 'risk_alert': return 'Risk';
      case 'recommendation': return 'Recommendation';
      case 'ai_alert': return 'AI Alert';
      default: return 'System';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Block */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl relative">
            <Bell className="h-6 w-6" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-error items-center justify-center text-[8px] font-bold text-white">
                  {unreadNotificationCount}
                </span>
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC] flex items-center gap-2">
              Notification Center
              {unreadNotificationCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-error/15 text-error border border-error/20 rounded-full">
                  {unreadNotificationCount} unread
                </span>
              )}
            </h1>
            <p className="text-xs text-neutral-outline dark:text-[#CBD5E1]">Stay updated with your assessment schedules, wellness flags, and self-care recommendations.</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center space-x-4">
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-semibold text-primary dark:text-[#4F46E5] hover:underline flex items-center space-x-1"
              >
                <Check className="h-4 w-4" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={deleteAllNotifications}
              className="text-xs font-semibold text-error hover:underline flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete all</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs / Filters */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-100 dark:border-[#334155]">
        {['All', 'Assessment', 'Risk', 'Recommendation', 'AI Alert', 'System'].map((tab) => {
          const count = tab === 'All' 
            ? notifications.length 
            : notifications.filter(n => n.type === getTabType(tab)).length;
          
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-primary dark:bg-[#4F46E5] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1E293B] text-neutral-slate/75 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#273449] border border-slate-100 dark:border-[#334155]'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* List content */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-[#334155] py-12 text-center text-xs text-neutral-outline dark:text-[#CBD5E1]">
            No notifications found in this category.
          </div>
        ) : (
          [...filteredNotifications].map((n) => {
            const formattedDate = new Date(n.createdAt).toLocaleDateString() + ' ' + new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div
                key={n._id}
                className={`bg-white dark:bg-[#1E293B] rounded-xl border p-5 shadow-sm flex items-start gap-4 transition-all hover:shadow-md dark:hover:shadow-xl ${
                  !n.isRead 
                    ? 'border-primary/20 dark:border-[#4F46E5]/30 bg-primary/5 dark:bg-[#4F46E5]/5' 
                    : 'border-slate-100 dark:border-[#334155]'
                }`}
              >
                {/* Category Icon */}
                <div className="p-2 bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-[#334155] rounded-lg shrink-0">
                  {getNotifIcon(n.type)}
                </div>

                {/* Message Details */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center space-x-2.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(n.type)}`}>
                      {getCategoryLabel(n.type)}
                    </span>
                    <span className="text-[9px] text-neutral-outline dark:text-[#CBD5E1] font-semibold flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formattedDate}
                    </span>
                  </div>
                  
                  <h4 className={`text-sm text-neutral-slate dark:text-[#F8FAFC] font-bold ${!n.isRead ? 'text-primary dark:text-[#4F46E5]' : ''}`}>
                    {n.title}
                  </h4>
                  <p className={`text-xs text-neutral-slate/80 dark:text-[#CBD5E1] leading-relaxed ${!n.isRead ? 'font-medium' : ''}`}>
                    {n.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  {!n.isRead && (
                    <button
                      onClick={() => markNotificationRead(n._id)}
                      className="p-1.5 text-success hover:bg-success/5 dark:hover:bg-success/10 rounded-md transition-colors"
                      title="Mark as Read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="p-1.5 text-neutral-outline dark:text-[#CBD5E1] hover:text-error hover:bg-error/5 dark:hover:bg-error/10 rounded-md transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
