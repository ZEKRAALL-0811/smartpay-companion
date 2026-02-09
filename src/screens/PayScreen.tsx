import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categories } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QrCode, Check } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

type PayState = "form" | "success";

export function PayScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<PayState>("form");
  const [amount, setAmount] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const contact = contacts?.find((c) => c.id === selectedContact);

  const handlePay = async () => {
    if (!amount || !selectedContact || !contact || !user) return;

    const emojiMap: Record<string, string> = { Food: "🍕", Travel: "🚕", Shopping: "🛒", Bills: "📱", Entertainment: "🎬", Health: "💊" };
    const cat = selectedCategory || "General";

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      merchant: `Payment to ${contact.name}`,
      amount: -parseInt(amount),
      category: cat,
      icon: emojiMap[cat] || "💸",
      time: "Just now",
    });

    if (error) {
      toast.error("Payment failed: " + error.message);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
    setState("success");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleDone = () => {
    setState("form");
    setAmount("");
    setSelectedContact(null);
    setSelectedCategory(null);
  };

  return (
    <div className="px-4 pb-24 pt-6">
      <AnimatePresence mode="wait">
        {state === "form" ? (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
            <h1 className="font-display text-2xl font-bold text-foreground">Pay 💸</h1>

            <Card className="border-dashed border-2 border-primary/20 bg-accent/30">
              <CardContent className="flex flex-col items-center gap-2 p-8">
                <QrCode className="h-12 w-12 text-primary/40" />
                <p className="text-sm font-medium text-muted-foreground">Scan to Pay</p>
              </CardContent>
            </Card>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground">Pay to Contact</p>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-themed">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))
                ) : (
                  contacts?.map((c) => (
                    <button key={c.id} onClick={() => setSelectedContact(c.id)} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-primary-foreground transition-all ${selectedContact === c.id ? "ring-2 ring-primary ring-offset-2 scale-110" : ""}`}
                        style={{ backgroundColor: c.color }}
                      >
                        {c.avatar}
                      </div>
                      <span className="text-xs text-muted-foreground">{c.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Amount</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-display font-bold text-muted-foreground">₹</span>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-14 pl-10 text-2xl font-display font-bold rounded-2xl" placeholder="0" />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-themed">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat.label ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            <Button onClick={handlePay} disabled={!amount || !selectedContact} className="h-14 w-full rounded-2xl gradient-primary text-lg font-display font-bold shadow-lg transition-all active:scale-95 disabled:opacity-40">
              Pay {amount ? `₹${parseInt(amount).toLocaleString("en-IN")}` : ""}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }} className="flex h-24 w-24 items-center justify-center rounded-full gradient-success">
              <Check className="h-12 w-12 text-success-foreground" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Paid to</p>
              <p className="font-display text-xl font-bold text-foreground">{contact?.name}</p>
              <p className="mt-2 font-display text-4xl font-bold text-foreground">₹{parseInt(amount).toLocaleString("en-IN")}</p>
            </div>
            <Card className="w-full max-w-xs">
              <CardContent className="space-y-2 p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">To</span><span className="font-medium text-foreground">{contact?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium text-foreground">{selectedCategory || "General"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium text-foreground">Just now</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-success">Completed ✅</span></div>
              </CardContent>
            </Card>
            <Button onClick={handleDone} className="h-12 w-full max-w-xs rounded-2xl" variant="outline">Done</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
