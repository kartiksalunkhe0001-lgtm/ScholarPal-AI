import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';
import { StudentProfile, ScholarshipDetailsData, SupportTicket } from '../types/index.ts';
import { storage } from '../utils/storage.ts';

interface ChatbotWidgetProps {
  studentProfile: StudentProfile | null;
  currentScholarship?: ScholarshipDetailsData | null;
  onOpenComplaints?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  ticketId?: string;
  sources?: { title: string; url: string }[];
  error?: string;
  failedPrompt?: string;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  studentProfile,
  currentScholarship,
  onOpenComplaints,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedErrorMsgs, setExpandedErrorMsgs] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! 🙏 I am your 24/7 ScholarPal AI guide. Ask me anything about Indian scholarships, eligibility rules, required documents, or exam preparation tips.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Fast Streaming via SSE (Requirement A5)
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          studentProfile,
          currentScholarship,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Streaming not available, switching to fallback');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botText = '';
      const botMsgId = `bot_${Date.now()}`;

      // Insert initial streaming message
      let messageInserted = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                botText += parsed.chunk;
                if (!messageInserted) {
                  messageInserted = true;
                  setLoading(false); // Stop typing indicator as soon as first chunk renders
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: botMsgId,
                      sender: 'bot',
                      text: botText,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) => (m.id === botMsgId ? { ...m, text: botText } : m))
                  );
                }
              }
            } catch (e) {
              // Ignore non-json chunk
            }
          }
        }
      }

      if (!messageInserted && botText.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: botMsgId,
            sender: 'bot',
            text: botText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (streamErr) {
      // Fallback to standard chat endpoint if streaming fails
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            studentProfile,
            currentScholarship,
          }),
        });

        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Here is the verified information for your request.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ticketId: data.ticketId,
          sources: data.sources,
        };

        setMessages((prev) => [...prev, botMsg]);

        if (data.ticketId) {
          const ticket: SupportTicket = {
            id: data.ticketId,
            category: 'App problem',
            message: textToSend,
            userId: 'user_active',
            userName: 'ScholarPal Student',
            userPhoneOrEmail: 'Registered Student',
            createdAt: new Date().toISOString(),
            status: 'Open',
            scholarshipName: currentScholarship?.name,
            officialHelpdeskUrl: 'https://scholarships.gov.in',
          };
          storage.saveTicket(ticket);
        }
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_err_${Date.now()}`,
            sender: 'bot',
            text: 'I encountered a connection difficulty reaching the scholarship guidance service. You can retry sending your question.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            error: err?.message || 'Network request failed. Please check your connection.',
            failedPrompt: textToSend,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    handleSendText(input.trim());
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-extrabold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all focus:outline-hidden"
            aria-label="Open 24/7 ScholarPal AI Chatbot"
          >
            <div className="relative">
              <Bot className="w-5 h-5" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 absolute -top-1 -right-1 ring-2 ring-emerald-700" />
            </div>
            <span className="text-sm tracking-wide">ScholarPal 24/7 AI</span>
          </button>
        )}
      </div>

      {/* Chat Window Overlay / Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  ScholarPal AI Guide
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-200/80 line-clamp-1">
                  {currentScholarship ? `Context: ${currentScholarship.name}` : 'Multilingual • Grounded Fact Checks'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onOpenComplaints && (
                <button
                  onClick={onOpenComplaints}
                  title="View Grievance Tickets"
                  className="p-1.5 rounded-lg text-emerald-300 hover:bg-white/10 text-xs flex items-center gap-1"
                >
                  <LifeBuoy className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Chat Window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick prompts bar */}
          <div className="bg-slate-50 border-b border-slate-100 p-2 flex gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-600">
            <button
              onClick={() =>
                setInput('What are the key documents needed for the scholarship?')
              }
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-400 whitespace-nowrap shadow-2xs"
            >
              Documents Needed?
            </button>
            <button
              onClick={() =>
                setInput('How do I apply on the official National Scholarship Portal?')
              }
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-400 whitespace-nowrap shadow-2xs"
            >
              How to Apply?
            </button>
            <button
              onClick={() => setInput('I have an issue with my application / portal error')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-400 whitespace-nowrap shadow-2xs text-rose-700"
            >
              Log a Complaint
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Sources if present */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                      <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Official Grounded Sources:
                      </p>
                      <div className="space-y-1">
                        {m.sources.map((s, sIdx) => (
                          <a
                            key={sIdx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>{s.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grievance Ticket Badge */}
                  {m.ticketId && (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                      <span className="font-bold">Formal Grievance Registered:</span>
                      <p className="font-mono font-bold mt-0.5 text-slate-900">{m.ticketId}</p>
                      <p className="text-[10px] text-amber-800 mt-1">
                        Our support team will review this shortly.
                      </p>
                    </div>
                  )}

                  {/* Error Retry & Show details (Requirement 8) */}
                  {m.error && (
                    <div className="mt-2.5 pt-2 border-t border-rose-200">
                      <div className="flex items-center justify-between gap-2">
                        {m.failedPrompt && (
                          <button
                            type="button"
                            onClick={() => handleSendText(m.failedPrompt!)}
                            disabled={loading}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            Retry Question
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedErrorMsgs((prev) => ({ ...prev, [m.id]: !prev[m.id] }))
                          }
                          className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer ml-auto"
                        >
                          {expandedErrorMsgs[m.id] ? 'Hide details' : 'Show details'}
                        </button>
                      </div>

                      {expandedErrorMsgs[m.id] && (
                        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] font-mono text-rose-900 overflow-x-auto">
                          {m.error}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 'Tell me more' prompt action (Requirement A5) */}
                  {m.sender === 'bot' && m.id !== 'welcome' && !m.error && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSendText('Please tell me more in-depth details, official step-by-step guidance, and exact criteria.')}
                        disabled={loading}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Tell me more</span>
                      </button>
                    </div>
                  )}

                  <span
                    className={`text-[9px] block text-right mt-1 font-mono ${
                      m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-100 p-2.5 rounded-2xl border border-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[11px] text-slate-600 font-medium">Checking verified sources...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Privacy Note */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            ScholarPal AI will never request your Aadhaar, bank details, or passwords.
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your question or complaint in any Indian language..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[42px]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors shadow-xs"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
