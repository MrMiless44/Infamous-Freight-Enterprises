import { useState, useEffect, useRef } from 'react';
import api from '@/api-client/client';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  Truck,
  Plus,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '@/components/ui/EmptyState';
import type { ChatThread, ChatMessage } from '@/types';
import { useAppStore } from '@/store/app-store';

const MessagesPage: React.FC = () => {
  const { user } = useAppStore();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const data = await api.getThreads();
      setThreads(data.threads || []);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      setMessagesLoading(true);
      const data = await api.getMessages(threadId);
      setMessages(data.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => { fetchThreads(); }, []);

  useEffect(() => {
    if (activeThread) fetchMessages(activeThread.id);
  }, [activeThread?.id]);

  const handleSend = async () => {
    if (!messageInput.trim() || !activeThread || sending) return;
    const body = messageInput.trim();
    setMessageInput('');
    setSending(true);
    try {
      await api.sendMessage(activeThread.id, body);
      await fetchMessages(activeThread.id);
      await fetchThreads();
    } catch {
      toast.error('Failed to send message');
      setMessageInput(body);
    } finally {
      setSending(false);
    }
  };

  const handleOpenThread = (thread: ChatThread) => {
    setActiveThread(thread);
    setMessages([]);
  };

  const filteredThreads = threads.filter(
    (t) =>
      (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.creatorName && t.creatorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.loadId && t.loadId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (activeThread) {
    return (
      <div className="flex h-full flex-col bg-infamous-dark text-[#F5E8E8]">
        <header className="flex items-center gap-3 border-b border-infamous-border bg-infamous-card px-4 py-3">
          <button
            onClick={() => { setActiveThread(null); setMessages([]); }}
            className="rounded-lg p-1.5 text-infamous-muted transition hover:bg-infamous-panel hover:text-[#F5E8E8]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-infamous-red text-sm font-bold text-[#F5E8E8]">
            {(activeThread.subject || activeThread.creatorName || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">{activeThread.subject || 'Conversation'}</p>
            <p className="text-xs text-infamous-muted">
              {activeThread.creatorName || 'Unknown'}
              {activeThread.loadId && <span> · {activeThread.loadId}</span>}
            </p>
          </div>
          <button onClick={() => fetchMessages(activeThread.id)} className="rounded-lg p-1.5 text-infamous-muted hover:text-[#F5E8E8]">
            <RefreshCw size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-infamous-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-[#B88989]/60 text-sm">No messages yet. Start the conversation.</div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? 'bg-infamous-red text-[#F5E8E8] rounded-br-md'
                      : 'bg-infamous-card border border-infamous-border text-gray-200 rounded-bl-md'
                  }`}>
                    {!isMe && msg.senderName && (
                      <p className="text-[10px] font-semibold text-[#B88989] mb-1">{msg.senderName}</p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.body}</p>
                    <div className={`mt-1 flex items-center gap-1 text-[10px] ${
                      isMe ? 'justify-end text-blue-200' : 'text-infamous-muted'
                    }`}>
                      <span>{formatTime(msg.createdAt)}</span>
                      {isMe && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-infamous-border bg-infamous-card p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 rounded-xl border border-infamous-border bg-infamous-panel px-4 py-2.5 text-sm text-[#F5E8E8] placeholder-[#B88989]/60 focus:outline-none focus:ring-1 focus:ring-infamous-red/30"
            />
            <button
              onClick={handleSend}
              disabled={!messageInput.trim() || sending}
              className="rounded-xl bg-infamous-red p-2.5 text-[#F5E8E8] transition hover:bg-infamous-red-light disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-infamous-dark text-[#F5E8E8]">
      <header className="border-b border-infamous-border bg-infamous-card px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <MessageSquare size={22} className="text-infamous-red-light" />
              Messages
            </h1>
            {threads.length > 0 && (
              <p className="mt-1 text-sm text-infamous-muted">
                {threads.length} conversation{threads.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button onClick={fetchThreads} className="rounded-lg p-2 text-infamous-muted hover:text-[#F5E8E8]">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-infamous-border bg-infamous-panel px-3 py-2">
          <Search size={16} className="text-infamous-muted" />
          <input
            type="text"
            placeholder="Search conversations or load numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#F5E8E8] placeholder-[#B88989]/60 focus:outline-none"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto divide-y divide-infamous-border">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-infamous-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredThreads.length === 0 ? (
          <EmptyState
            title="No conversations"
            description="Conversations will appear here when messages are exchanged with dispatchers, drivers, or carriers."
          />
        ) : (
          filteredThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => handleOpenThread(thread)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-infamous-card/50"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-infamous-red text-sm font-bold text-[#F5E8E8]">
                {(thread.subject || thread.creatorName || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate text-[#F5E8E8]">
                    {thread.subject || thread.creatorName || 'Conversation'}
                  </p>
                  <span className="shrink-0 text-xs text-infamous-muted">
                    {thread.lastMessage ? formatTime(thread.lastMessage.createdAt) : formatTime(thread.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {thread.loadId && (
                    <span className="flex items-center gap-1 text-[10px] text-infamous-red-light">
                      <Truck size={10} /> {thread.loadId}
                    </span>
                  )}
                  {thread.creatorName && (
                    <span className="text-xs text-infamous-muted">{thread.creatorName}</span>
                  )}
                </div>
                {thread.lastMessage && (
                  <p className="mt-1 text-xs truncate text-[#B88989]/70">
                    {thread.lastMessage.body}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
