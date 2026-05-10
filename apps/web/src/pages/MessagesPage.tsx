import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  Truck,
} from 'lucide-react';

interface Message {
  id: string;
  from: 'me' | 'other';
  name: string;
  text: string;
  time: string;
  read: boolean;
  attachment?: string;
}

interface Thread {
  id: string;
  name: string;
  role: string;
  loadRef?: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

const demoThreads: Thread[] = [
  {
    id: 'thr-1',
    name: 'Marcus T.',
    role: 'Dispatcher',
    loadRef: 'IF-20491',
    avatar: 'M',
    lastMessage: 'Driver checked in, running on schedule. ETA confirmed for 6:30 PM.',
    lastTime: '2:15 PM',
    unread: 2,
    messages: [
      { id: 'm1', from: 'other', name: 'Marcus T.', text: 'Hey, your load IF-20491 is confirmed. Pickup at 1200 S Ashland Ave, dock 4. Get there by 8 AM.', time: '8:30 AM', read: true },
      { id: 'm2', from: 'me', name: 'You', text: 'Copy that, en route now. Should be there in 20.', time: '8:35 AM', read: true },
      { id: 'm3', from: 'other', name: 'Marcus T.', text: 'Shipper says dock 4 is clear, you should be able to back in immediately.', time: '8:52 AM', read: true },
      { id: 'm4', from: 'me', name: 'You', text: 'Loaded and sealed. Heading out now.', time: '10:15 AM', read: true },
      { id: 'm5', from: 'other', name: 'Marcus T.', text: 'Driver checked in, running on schedule. ETA confirmed for 6:30 PM.', time: '2:15 PM', read: false },
      { id: 'm6', from: 'other', name: 'Marcus T.', text: 'Customer wants a check-call when you hit Oklahoma City. Just a quick heads up.', time: '2:16 PM', read: false },
    ],
  },
  {
    id: 'thr-2',
    name: 'Summit Retail Group',
    role: 'Shipper',
    loadRef: 'IF-20491',
    avatar: 'S',
    lastMessage: 'Thanks for the update. Looking forward to the delivery.',
    lastTime: '1:00 PM',
    unread: 0,
    messages: [
      { id: 'm7', from: 'other', name: 'Summit Retail', text: 'Hi, can you confirm pickup was completed for IF-20491?', time: '10:30 AM', read: true },
      { id: 'm8', from: 'me', name: 'You', text: 'Yes, picked up at 10:15 AM. 24 pallets loaded, sealed and heading to Dallas.', time: '10:45 AM', read: true },
      { id: 'm9', from: 'other', name: 'Summit Retail', text: 'Thanks for the update. Looking forward to the delivery.', time: '1:00 PM', read: true },
    ],
  },
  {
    id: 'thr-3',
    name: 'Ops Support',
    role: 'Support',
    avatar: 'O',
    lastMessage: 'Your insurance documents have been verified and approved.',
    lastTime: 'Yesterday',
    unread: 1,
    messages: [
      { id: 'm10', from: 'other', name: 'Ops Support', text: 'Your insurance documents have been verified and approved. You are cleared for all load types.', time: 'Yesterday', read: false },
    ],
  },
];

const MessagesPage: React.FC = () => {
  const [threads] = useState<Thread[]>(demoThreads);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.loadRef && t.loadRef.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0);

  const handleSend = () => {
    if (!messageInput.trim() || !activeThread) return;
    setMessageInput('');
  };

  if (activeThread) {
    return (
      <div className="flex h-full flex-col bg-infamous-dark text-[#F5E8E8]">
        {/* Thread Header */}
        <header className="flex items-center gap-3 border-b border-infamous-border bg-infamous-card px-4 py-3">
          <button
            onClick={() => setActiveThread(null)}
            className="rounded-lg p-1.5 text-infamous-muted transition hover:bg-infamous-panel hover:text-[#F5E8E8]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-[#F5E8E8] ${
            activeThread.role === 'Dispatcher' ? 'bg-infamous-red' :
            activeThread.role === 'Shipper' ? 'bg-emerald-600' : 'bg-infamous-ember'
          }`}>
            {activeThread.avatar}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">{activeThread.name}</p>
            <p className="text-xs text-infamous-muted">
              {activeThread.role}
              {activeThread.loadRef && <span> · {activeThread.loadRef}</span>}
            </p>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeThread.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.from === 'me'
                  ? 'bg-infamous-red text-[#F5E8E8] rounded-br-md'
                  : 'bg-infamous-card border border-infamous-border text-gray-200 rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.attachment && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 text-xs">
                    <Paperclip size={12} />
                    {msg.attachment}
                  </div>
                )}
                <div className={`mt-1 flex items-center gap-1 text-[10px] ${
                  msg.from === 'me' ? 'justify-end text-blue-200' : 'text-infamous-muted'
                }`}>
                  <span>{msg.time}</span>
                  {msg.from === 'me' && (msg.read ? <CheckCheck size={12} /> : <Check size={12} />)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-infamous-border bg-infamous-card p-3">
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-infamous-muted transition hover:bg-infamous-panel hover:text-[#F5E8E8]">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 rounded-xl border border-infamous-border bg-infamous-panel px-4 py-2.5 text-sm text-[#F5E8E8] placeholder-[#B88989]/60 focus:outline-none focus:ring-1 focus:ring-infamous-red/30"
            />
            <button
              onClick={handleSend}
              disabled={!messageInput.trim()}
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
      {/* Header */}
      <header className="border-b border-infamous-border bg-infamous-card px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <MessageSquare size={22} className="text-infamous-red-light" />
              Messages
            </h1>
            {totalUnread > 0 && (
              <p className="mt-1 text-sm text-infamous-muted">
                {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-infamous-border bg-infamous-panel px-3 py-2">
          <Search size={16} className="text-infamous-muted" />
          <input
            type="text"
            placeholder="Search messages or load numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#F5E8E8] placeholder-[#B88989]/60 focus:outline-none"
          />
        </div>
      </header>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto divide-y divide-infamous-border">
        {filteredThreads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => setActiveThread(thread)}
            className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-infamous-card/50"
          >
            <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#F5E8E8] ${
              thread.role === 'Dispatcher' ? 'bg-infamous-red' :
              thread.role === 'Shipper' ? 'bg-emerald-600' : 'bg-infamous-ember'
            }`}>
              {thread.avatar}
              {thread.unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-infamous-red text-[10px] font-bold text-[#F5E8E8]">
                  {thread.unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-semibold truncate ${thread.unread > 0 ? 'text-[#F5E8E8]' : 'text-[#F5E8E8]/80'}`}>
                  {thread.name}
                </p>
                <span className="shrink-0 text-xs text-infamous-muted">{thread.lastTime}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {thread.loadRef && (
                  <span className="flex items-center gap-1 text-[10px] text-infamous-red-light">
                    <Truck size={10} /> {thread.loadRef}
                  </span>
                )}
                <span className="text-xs text-infamous-muted">{thread.role}</span>
              </div>
              <p className={`mt-1 text-xs truncate ${thread.unread > 0 ? 'text-[#F5E8E8]/80 font-medium' : 'text-[#B88989]/70'}`}>
                {thread.lastMessage}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessagesPage;
