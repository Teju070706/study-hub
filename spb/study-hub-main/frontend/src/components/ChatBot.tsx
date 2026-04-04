import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Find me calculus textbooks for beginners",
  "Recommend advanced ML papers",
  "Create a study plan for finals",
  "What's trending in Computer Science?",
];

const BOT_RESPONSES: Record<string, string> = {
  default: "I'd be happy to help you find educational resources! Try asking me about specific subjects, or I can recommend study materials based on your needs. What are you looking for?",
  calculus: "Great choice! I found several calculus resources:\n\n📘 **Introduction to Linear Algebra** - Dr. Sarah Mitchell (4.8★)\n📝 **Classical Mechanics Explained** - Prof. David Liu (4.7★)\n\nWould you like me to filter by difficulty level?",
  ml: "Here are top Machine Learning resources:\n\n🎬 **Machine Learning Fundamentals** - Dr. Alan Park (4.7★)\n📄 **Quantum Computing: A Modern Approach** - Prof. James Chen (4.6★)\n\nShall I recommend a learning path?",
  study: "Here's a suggested study plan:\n\n1. **Week 1-2:** Review core concepts\n2. **Week 3:** Practice problems\n3. **Week 4:** Mock exams\n4. **Daily:** 2-hour focused sessions\n\nWant me to find specific resources for each phase?",
  trending: "🔥 **Trending in CS this month:**\n\n1. AI & Large Language Models\n2. Quantum Computing\n3. Cybersecurity\n4. Edge Computing\n\nWant resources for any of these topics?",
};

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes('calculus') || lower.includes('math')) return BOT_RESPONSES.calculus;
  if (lower.includes('ml') || lower.includes('machine learning')) return BOT_RESPONSES.ml;
  if (lower.includes('study') || lower.includes('plan') || lower.includes('final')) return BOT_RESPONSES.study;
  if (lower.includes('trending') || lower.includes('popular')) return BOT_RESPONSES.trending;
  return BOT_RESPONSES.default;
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: "👋 Hi! I'm your EduVault Learning Assistant. How can I help you find the perfect study materials today?" },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(text);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-hero shadow-elevated flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageCircle className="w-6 h-6 text-primary-foreground" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[500px] rounded-2xl bg-card shadow-elevated border border-border/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 gradient-hero flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-primary-foreground text-sm">Learning Assistant</h3>
                <p className="text-xs text-primary-foreground/70">Always here to help</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-accent" />}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-secondary-foreground rounded-bl-sm'}`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border/50 flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask me anything..."
                className="text-sm h-9"
              />
              <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => sendMessage(input)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
