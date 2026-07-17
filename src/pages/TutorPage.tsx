import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import type { View } from '../types/navigation';
import { Button } from '../components/ui/Button';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface TutorPageProps {
  onNavigate: (view: View) => void;
}

export default function TutorPage({ onNavigate }: TutorPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm your StudySpark AI Tutor. How can I help you with your studies today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleClear = () => {
    setMessages([{ role: 'model', content: "Hi! I'm your StudySpark AI Tutor. How can I help you with your studies today?" }]);
    setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-15) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to communicate with AI provider');
      }

      const data = await response.json();
      setIsLoading(false);
      setMessages((prev) => [...prev, { role: 'model', content: data.response }]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      // Remove the user message if it failed completely? Or leave it so they can read what they wrote.
      // We will leave it, the user can just resend.
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0 sm:h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4 py-3 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-purple text-purple-foreground">
            <Bot size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">AI Tutor</h1>
            <p className="text-xs text-muted">Powered by Gemini</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted hover:text-red-500" title="Clear chat">
          <Trash2 size={16} />
        </Button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex shrink-0 size-8 sm:size-10 items-center justify-center rounded-full border ${msg.role === 'user' ? 'border-border bg-card' : 'border-purple/20 bg-purple/10 text-purple'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
              </div>
              <div className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-foreground text-background' : 'border border-border bg-card'}`}>
                {msg.role === 'model' && (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
                {msg.role === 'user' && (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 sm:gap-4">
              <div className="flex shrink-0 size-8 sm:size-10 items-center justify-center rounded-full border border-purple/20 bg-purple/10 text-purple">
                <Bot size={18} />
              </div>
              <div className="flex items-center rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                <Loader2 size={18} className="animate-spin text-purple" />
                <span className="ml-2 text-sm text-muted">Tutor is typing...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-500 shadow-sm mx-auto w-fit">
              <AlertCircle size={16} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="sticky bottom-[4.5rem] sm:bottom-0 border-t border-border bg-background/95 backdrop-blur p-3 sm:p-4 pb-[env(safe-area-inset-bottom)] sm:pb-6 z-40">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-purple/50 focus-within:ring-1 focus-within:ring-purple/50 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your study material..."
              className="max-h-[150px] min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted"
              rows={1}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading}
              className="mb-0.5 shrink-0 h-9 w-9 p-0 rounded-xl bg-purple hover:bg-purple/90"
            >
              <Send size={16} />
            </Button>
          </div>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-muted">AI Tutor can make mistakes. Verify important information.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
