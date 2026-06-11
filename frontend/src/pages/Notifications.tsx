<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> testing
import { useStore } from '../store/useStore';
import { Bell, Check, Trash2, Calendar, ShieldAlert, Sparkles, Clipboard } from 'lucide-react';

export const Notifications: React.FC = () => {
<<<<<<< HEAD
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useStore();
=======
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, fetchNotifications } = useStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
>>>>>>> testing
  const [activeTab, setActiveTab] = useState<string>('All');

  const filteredNotifications = activeTab === 'All'
    ? notifications
    : notifications.filter(n => n.category === activeTab);

  const getNotifIcon = (category: string) => {
    switch (category) {
      case 'Risk':
        return <ShieldAlert className="h-5 w-5 text-error" />;
      case 'Assessment':
        return <Clipboard className="h-5 w-5 text-primary dark:text-[#4F46E5]" />;
      case 'Recommendation':
        return <Sparkles className="h-5 w-5 text-secondary" />;
      default:
        return <Bell className="h-5 w-5 text-neutral-outline dark:text-[#CBD5E1]" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Risk':
        return 'bg-error/10 text-error border-error/20';
      case 'Assessment':
        return 'bg-primary/10 text-primary border-primary/20 dark:border-[#4F46E5]/30';
      case 'Recommendation':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      default:
        return 'bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155]';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Block */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">Notification Center</h1>
            <p className="text-xs text-neutral-outline dark:text-[#CBD5E1]">Stay updated with your assessment schedules, wellness flags, and self-care recommendations.</p>
          </div>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-semibold text-primary dark:text-[#4F46E5] hover:underline flex items-center space-x-1"
          >
            <Check className="h-4 w-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Tabs / Filters */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-100 dark:border-[#334155]">
        {['All', 'Assessment', 'Risk', 'Recommendation', 'Mood'].map((tab) => {
          const count = tab === 'All' 
            ? notifications.length 
            : notifications.filter(n => n.category === tab).length;
          
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
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white dark:bg-[#1E293B] rounded-xl border p-5 shadow-sm flex items-start gap-4 transition-all hover:shadow-md dark:hover:shadow-xl ${
                !n.read 
                  ? 'border-primary/20 dark:border-[#4F46E5]/30 bg-primary/5 dark:bg-[#4F46E5]/5' 
                  : 'border-slate-100 dark:border-[#334155]'
              }`}
            >
              {/* Category Icon */}
              <div className="p-2 bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-[#334155] rounded-lg shrink-0">
                {getNotifIcon(n.category)}
              </div>

              {/* Message Details */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center space-x-2.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(n.category)}`}>
                    {n.category}
                  </span>
                  <span className="text-[9px] text-neutral-outline dark:text-[#CBD5E1] font-semibold flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {n.date}
                  </span>
                </div>
                
                <p className={`text-xs text-neutral-slate dark:text-[#F8FAFC] leading-relaxed ${!n.read ? 'font-semibold' : ''}`}>
                  {n.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 shrink-0 ml-2">
                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="p-1.5 text-success hover:bg-success/5 dark:hover:bg-success/10 rounded-md transition-colors"
                    title="Mark as Read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1.5 text-neutral-outline dark:text-[#CBD5E1] hover:text-error hover:bg-error/5 dark:hover:bg-error/10 rounded-md transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
