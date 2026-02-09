import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { quickPrompts } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm animate-float">🤖</div>
      <div className="ml-2 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-dot" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
      </div>
    </div>
  );
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "Hey! 👋 I'm your SmartPay Assistant. Ask me anything about your spending, savings tips, or budgeting advice!" },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendMessage = async (text: string) => {
    const userMsg: Message = { id: nextId.current++, role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    let assistantContent = "";
    const assistantId = nextId.current++;

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (resp.status === 429) {
        toast.error("Rate limit reached. Please wait a moment and try again.");
        setIsStreaming(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Add credits in Settings.");
        setIsStreaming(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === assistantId) {
                  return prev.map((m) => m.id === assistantId ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { id: assistantId, role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: assistantContent } : m));
            }
          } catch { /* ignore */ }
        }
      }

      // Ensure at least empty assistant message exists
      if (!assistantContent) {
        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "I'm here to help! Could you rephrase your question? 🤔" }]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "Sorry, I encountered an error. Please try again! 🙏" }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-lg animate-float">🤖</div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">SmartPay Assistant</h1>
          <p className="text-xs text-success font-medium">● Online</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 scrollbar-themed">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-primary text-xs">🤖</div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-card text-foreground shadow-sm rounded-bl-md"}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && <TypingIndicator />}
      </div>

      <div className="flex flex-wrap gap-2 px-4 py-3">
        {quickPrompts.map((p) => (
          <button key={p} onClick={() => !isStreaming && sendMessage(p)} className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-all active:scale-95 hover:bg-accent/80 disabled:opacity-50">
            {p}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-4 pb-24">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && input.trim() && !isStreaming && sendMessage(input)} placeholder="Ask your coach..." className="h-12 rounded-2xl" disabled={isStreaming} />
        <Button onClick={() => input.trim() && !isStreaming && sendMessage(input)} className="h-12 w-12 rounded-2xl gradient-primary shrink-0" size="icon" disabled={isStreaming}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
