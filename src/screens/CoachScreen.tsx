import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { coachMessages, quickPrompts, coachResponses } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Message {
  id: number;
  type: "bot" | "user";
  text: string;
  hasChart?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm animate-float">
        🤖
      </div>
      <div className="ml-2 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>(coachMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(coachMessages.length + 1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    const userMsg: Message = { id: nextId.current++, type: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const cleanText = text.replace(/\s+/g, " ").trim();
    const response =
      Object.entries(coachResponses).find(([key]) => cleanText.includes(key.replace(/[^\w\s]/g, "").trim()))?.[1] ||
      coachResponses[Object.keys(coachResponses).find((k) => cleanText.toLowerCase().includes(k.split(" ")[0].toLowerCase())) || ""] ||
      "That's a great question! 🤔 Based on your spending patterns, I'd recommend reviewing your weekly budget goals. Want me to break down your categories?";

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: nextId.current++, type: "bot", text: response }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-lg animate-float">
          🤖
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">AI Coach</h1>
          <p className="text-xs text-success font-medium">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.type === "bot" && (
                <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-primary text-xs">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.type === "user"
                    ? "gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-card text-foreground shadow-sm rounded-bl-md"
                }`}
              >
                {msg.text}
                {msg.hasChart && (
                  <Card className="mt-3 border-0 bg-accent/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Travel trend</span>
                        <span className="font-medium text-success">↓ 5%</span>
                      </div>
                      <div className="mt-2 flex items-end gap-1 h-8">
                        {[60, 45, 70, 35, 55, 40, 30].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t bg-primary/30"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && <TypingIndicator />}
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {quickPrompts.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            className="whitespace-nowrap rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-all active:scale-95 hover:bg-accent/80"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 pb-24">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && input.trim() && sendMessage(input)}
          placeholder="Ask your coach..."
          className="h-12 rounded-2xl"
        />
        <Button
          onClick={() => input.trim() && sendMessage(input)}
          className="h-12 w-12 rounded-2xl gradient-primary shrink-0"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
