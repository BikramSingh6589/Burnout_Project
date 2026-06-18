import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { useStore } from '../store/useStore';
import { MessageSquare, X, Send, Bot, Trash2 } from 'lucide-react';

export const AIWidget: React.FC = () => {
  const { isAuthenticated, user, chatMessages, sendChatMessage, trackerHistory, fetchAIHistory, fetchNotifications, clearAIHistory } = useStore();
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchAIHistory();
    }
  }, [isOpen, isAuthenticated, fetchAIHistory]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  // Auto-fade toast notifications
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // If not authenticated or not a student, do not render the AI Widget
  if (!isAuthenticated || user?.role !== 'student') return null;

  // Calculate current risk level from the most recent score in trackerHistory
  const latestTracker = trackerHistory.length > 0 ? trackerHistory[trackerHistory.length - 1] : null;
  const currentScore = latestTracker ? latestTracker.burnoutScore : 0;
  
  const getRiskBadgeColor = (score: number) => {
    if (score >= 70) return 'bg-error/10 text-error border-error/20';
    if (score >= 40) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-success/10 text-success border-success/20';
  };

  const getRiskLabel = (score: number) => {
    if (!latestTracker) return 'Not Screened';
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Moderate Risk';
    return 'Low Risk';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const text = inputMsg.trim();
    setInputMsg('');
    setIsTyping(true);
    try {
      await sendChatMessage(text);
    } finally {
      setIsTyping(false);
      fetchNotifications();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:relative sm:w-[440px] sm:h-[550px] w-full h-full sm:mb-5 bg-surface backdrop-blur-xl sm:rounded-2xl border border-border/60 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Toast Notification */}
          {toast && (
            <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-semibold shadow-md z-20 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
              toast.type === 'success' ? 'bg-success text-white' : 'bg-error text-white'
            }`}>
              {toast.message}
            </div>
          )}

          {/* Confirmation Dialog Overlay */}
          {showClearConfirm && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 z-10 animate-in fade-in duration-200">
              <div className="bg-surface-elevated border border-border/80 rounded-2xl p-5 max-w-[85%] space-y-4 shadow-xl text-center">
                <h5 className="font-bold text-sm text-text-primary">Clear Chat History</h5>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Are you sure you want to delete all chat messages? This action cannot be undone.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface border border-border text-text-primary hover:bg-surface-elevated/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setShowClearConfirm(false);
                      setIsClearing(true);
                      try {
                        await clearAIHistory();
                        setToast({ type: 'success', message: 'Chat history cleared successfully.' });
                      } catch (err) {
                        setToast({ type: 'error', message: 'Unable to clear chat history. Please try again.' });
                      } finally {
                        setIsClearing(false);
                      }
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-error text-white hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="bg-background-secondary/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-border/60">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm tracking-tight text-text-primary">Wellness Assistant</h4>
                <p className="text-[10px] text-text-secondary mt-0.5">Continuous Emotional Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md tracking-wide uppercase border ${getRiskBadgeColor(currentScore)}`}>
                {getRiskLabel(currentScore)}
              </span>
              <button
                onClick={() => setShowClearConfirm(true)}
                title="Clear Chat"
                className="p-1.5 rounded-lg hover:bg-error/10 text-error hover:text-red-700 transition-colors"
                disabled={isClearing}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-elevated/50 text-text-secondary hover:text-text-primary dark:hover:text-[#F8FAFC] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-transparent">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all ${
                    msg.sender === 'user'
                      ? 'bg-primary  text-white rounded-br-sm'
                      : 'bg-surface-elevated text-text-primary border border-border/50 rounded-bl-sm'
                  }`}
                >
                  <div className="text-[13px] leading-relaxed tracking-tight break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                      components={{
                        code({ inline, className, children, ...props }: any) {
                          return (
                            <code
                              className={`${className ?? ''} ${inline ? 'px-1 py-[0.15rem] rounded bg-surface border border-border/50 text-[12px] font-mono' : 'block rounded-xl bg-surface-elevated border border-border/50 p-3 text-[12px] font-mono overflow-x-auto'}`}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  <span
                    className={`block text-[9px] text-right mt-2 ${
                      msg.sender === 'user' ? 'text-white/70' : 'text-text-secondary'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[65%] p-3.5 rounded-2xl bg-surface-elevated text-text-primary border border-border/50 rounded-bl-sm">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-text-secondary animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-text-secondary animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-text-secondary animate-pulse" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-border/60 bg-background-secondary/50 flex space-x-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask about your wellness..."
              className="flex-1 border border-border/80 bg-surface rounded-xl px-4 py-2.5 text-[13px] text-text-primary placeholder:text-text-secondary dark:placeholder:text-[#CBD5E1] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="bg-primary  text-white p-2.5 rounded-xl hover:bg-primary/95  disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-sm flex items-center justify-center shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Collapsed Float Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-primary text-white p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 relative flex items-center justify-center ${
          isOpen ? 'bg-secondary hover:shadow-[0_8px_30px_rgb(45,212,191,0.3)]' : ''
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 animate-in spin-in-90 duration-200" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6 animate-in zoom-in duration-200" />
            {trackerHistory.length > 0 && currentScore >= 70 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-error items-center justify-center text-[8px] font-bold text-white">
                  !
                </span>
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};
