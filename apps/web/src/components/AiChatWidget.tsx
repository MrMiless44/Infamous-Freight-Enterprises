import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const STARTER_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: 'Ask about quotes, shipment tracking, carrier onboarding, driver applications, or Infamous Freight services.',
};

function parseServerSentEvents(buffer: string) {
  const events = buffer.split('\n\n');
  return {
    completeEvents: events.slice(0, -1),
    remainingBuffer: events[events.length - 1] ?? '',
  };
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([STARTER_MESSAGE]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const conversation = useMemo(
    () => messages.filter((message) => message !== STARTER_MESSAGE),
    [messages]
  );

  const submitMessage = async () => {
    const nextContent = input.trim();
    if (!nextContent || isStreaming) return;

    const outgoingMessages: ChatMessage[] = [...conversation, { role: 'user', content: nextContent }];
    setInput('');
    setIsStreaming(true);
    setMessages([...messages, { role: 'user', content: nextContent }, { role: 'assistant', content: '' }]);

    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: outgoingMessages }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Chat request failed.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { completeEvents, remainingBuffer } = parseServerSentEvents(buffer);
        buffer = remainingBuffer;

        for (const event of completeEvents) {
          const dataLine = event.split('\n').find((line) => line.startsWith('data: '));
          if (!dataLine) continue;

          const data = dataLine.slice(6);
          if (data === '[DONE]') continue;

          let parsed: { content?: string };
          try {
            parsed = JSON.parse(data) as { content?: string };
          } catch {
            continue;
          }
          if (!parsed.content) continue;

          setMessages((current) => {
            const updated = [...current];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + parsed.content };
            }
            return updated;
          });
        }
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        setMessages((current) => {
          const updated = [...current];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant' && !last.content) {
            updated[updated.length - 1] = {
              role: 'assistant',
              content: 'The assistant is unavailable right now. Please try again in a moment.',
            };
          }
          return updated;
        });
      }
    } finally {
      if (abortRef.current === abortController) {
        abortRef.current = null;
      }
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [isOpen, messages]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section className="mb-3 flex h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-infamous-border-light/70 bg-infamous-dark shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
          <header className="flex items-center justify-between border-b border-infamous-border bg-infamous-card px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#F5E8E8]">Infamous Freight Assistant</p>
              <p className="text-xs text-[#B88989]">Streaming support for freight questions</p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-infamous-border text-[#B88989] transition hover:border-infamous-border-light hover:text-[#F5E8E8]"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-infamous-red text-[#F5E8E8]'
                      : 'border border-infamous-border bg-infamous-panel text-[#F5E8E8]'
                  }`}
                >
                  {message.content || '...'}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="border-t border-infamous-border bg-infamous-card p-3" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="ai-chat-message">
              Message
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="ai-chat-message"
                className="min-h-11 max-h-28 flex-1 resize-none rounded-xl border border-infamous-border bg-infamous-panel px-3 py-2 text-sm leading-6 text-[#F5E8E8] outline-none transition placeholder:text-[#B88989]/70 focus:border-infamous-red"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a freight question..."
                rows={1}
              />
              <button
                type="submit"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-infamous-red text-[#F5E8E8] transition hover:bg-infamous-red-light disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isStreaming || !input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-infamous-red-light/50 bg-infamous-red text-[#F5E8E8] shadow-[0_0_30px_rgba(255,26,26,0.45)] transition hover:bg-infamous-red-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-infamous-red-light focus-visible:ring-offset-2 focus-visible:ring-offset-infamous-dark"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Hide chat' : 'Open chat'}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
