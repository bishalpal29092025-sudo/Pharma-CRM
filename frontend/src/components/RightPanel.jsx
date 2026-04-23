import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store';
import { sendChat } from '../api';
import { cn } from '../lib/utils';
import { Send, Zap, Bot } from 'lucide-react';

const QUICK_PROMPTS = [
  { label: 'Log a visit', text: "Today I met Dr. Smith, a cardiologist at City General Hospital. We discussed CardioMax efficacy. Very positive sentiment. I shared brochures and provided samples. Follow-up needed next week." },
  { label: 'Edit field', text: "Actually the sentiment was negative and the name was Dr. John." },
  { label: 'Validate form', text: "Can you validate the form for completeness?" },
  { label: 'Summarize', text: "Summarize the current interaction." },
  { label: 'Clear all', text: "Clear everything and reset the form." },
];

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 px-3 py-2.5 bg-surface border border-white/[0.07] rounded-xl w-fit">
      {[0,1,2].map(i => (
        <div key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-muted" />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-2 items-start msg-enter', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0',
        isUser ? 'bg-surface2 text-muted2' : 'bg-accent/15 text-accent'
      )}>
        {isUser ? 'You' : <Bot size={14} />}
      </div>
      <div className={cn(
        'max-w-[76%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed',
        isUser
          ? 'bg-accent/15 border border-accent/20 text-white rounded-tr-sm'
          : 'bg-surface border border-white/[0.07] text-white/90 rounded-tl-sm'
      )}>
        <p className="whitespace-pre-wrap">{msg.content}</p>
        {msg.tool && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-black/20 border border-white/[0.08] rounded px-2 py-0.5 text-[10px] font-mono text-muted2">
            <Zap size={9} className="text-accent" />
            {msg.tool.replace(/_/g, ' ')}
          </div>
        )}
      </div>
    </div>
  );
}

export function RightPanel() {
  const {
    messages, isLoading, toolActive, form, chatHistory,
    addMessage, setLoading, setToolActive, updateForm, resetForm,
    setValidation, setSummary, pushHistory
  } = useStore();

  const [input, setInput] = useState('');
  const msgsRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }

    addMessage({ role: 'user', content: text });
    pushHistory('user', text);
    setLoading(true);
    setToolActive('Thinking…');

    try {
      const data = await sendChat({ message: text, history: chatHistory.slice(-10), currentForm: form });

      setToolActive(data.tool_used ? data.tool_used.replace(/_/g, ' ') : null);

      if (data.form_update) updateForm(data.form_update);
      if (data.action === 'clear_interaction') resetForm();
      if (data.validation_result) setValidation(data.validation_result);
      if (data.summary) setSummary(data.summary);

      addMessage({ role: 'assistant', content: data.reply, tool: data.tool_used });
      pushHistory('assistant', data.reply);
    } catch (e) {
      addMessage({ role: 'assistant', content: `⚠️ ${e.message}` });
    } finally {
      setLoading(false);
      setTimeout(() => setToolActive(null), 2000);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/30 to-accent2/30 border border-accent/20 flex items-center justify-center">
            <Bot size={15} className="text-accent" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Field Assistant</div>
            <div className="text-[10px] text-muted">LangGraph + Groq · llama-3.3-70b</div>
          </div>
        </div>
        <div className={cn(
          'flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all duration-300',
          toolActive
            ? 'border-accent/30 text-accent bg-accent/10 opacity-100'
            : 'opacity-0'
        )}>
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          {toolActive}
        </div>
      </div>

      {/* Messages */}
      <div ref={msgsRef} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 animate-[fadeIn_0.4s_ease-out]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent2/20 border border-accent/15 flex items-center justify-center mb-4">
              <span className="text-2xl">⚕️</span>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Pharma CRM Assistant</h3>
            <p className="text-xs text-muted max-w-[260px] leading-relaxed mb-5">
              Describe your HCP interaction. I'll extract the data and fill the form automatically — no typing required.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => { setInput(q.text); textareaRef.current?.focus(); }}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-white/[0.1] text-muted2 hover:border-accent/40 hover:text-accent hover:bg-accent/[0.06] transition-all duration-200"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {isLoading && (
          <div className="flex gap-2 items-start msg-enter">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/15 text-accent flex-shrink-0">
              <Bot size={14} />
            </div>
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-3 border-t border-white/[0.07] flex-shrink-0">
        <div className={cn(
          'flex items-end gap-2.5 bg-surface border rounded-xl px-4 py-3 transition-all duration-200',
          input ? 'border-accent/30 shadow-[0_0_0_3px_rgba(0,212,255,0.06)]' : 'border-white/[0.09]'
        )}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder="Describe your HCP interaction…"
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder-muted resize-none leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
              input.trim() && !isLoading
                ? 'bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30'
                : 'bg-surface2 border border-white/[0.06] text-muted cursor-not-allowed'
            )}
          >
            <Send size={13} />
          </button>
        </div>
        <p className="text-center text-[10px] text-muted mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
