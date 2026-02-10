import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QrCode, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { RequestMoneyDialog } from "@/components/RequestMoneyDialog";
import { CheckBalanceDialog } from "@/components/CheckBalanceDialog";
import { NotificationCenter } from "@/components/NotificationCenter";
import { QrScanner } from "@/components/QrScanner";
import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";
import { BudgetExceededOverlay } from "@/components/BudgetExceededOverlay";
import { toast } from "sonner";
import type { TabId } from "@/components/BottomNav";

const DAILY_QUOTES = [
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
  "Do not save what is left after spending, but spend what is left after saving. — Warren Buffett",
  "A budget is telling your money where to go instead of wondering where it went. — Dave Ramsey",
  "Financial freedom is available to those who learn about it and work for it. — Robert Kiyosaki",
  "The habit of saving is itself an education; it fosters every virtue. — T.T. Munger",
  "Beware of little expenses; a small leak will sink a great ship. — Benjamin Franklin",
  "Money is a terrible master but an excellent servant. — P.T. Barnum",
  "It's not your salary that makes you rich, it's your spending habits. — Charles A. Jaffe",
  "Wealth consists not in having great possessions, but in having few wants. — Epictetus",
  "An investment in knowledge pays the best interest. — Benjamin Franklin",
  "The art is not in making money, but in keeping it. — Proverb",
  "Don't tell me where your priorities are. Show me where you spend your money. — James W. Frick",
  "Every morning brings new potential, but if you dwell on the misfortunes of the day before, you tend to overlook tremendous opportunities. — Harvey Mackay",
  "Rich people stay rich by living like they're broke. Broke people stay broke by living like they're rich.",
  "The secret to getting ahead is getting started. — Mark Twain",
  "Small daily improvements over time lead to stunning results. — Robin Sharma",
  "Money grows on the tree of persistence. — Japanese Proverb",
  "You must gain control over your money or the lack of it will forever control you. — Dave Ramsey",
  "Save a little money each month and at the end of the year you'll be surprised at how little you have. — Ernest Haskins",
  "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
  "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
  "Your future is created by what you do today, not tomorrow. — Robert Kiyosaki",
  "A penny saved is a penny earned. — Benjamin Franklin",
  "Motivation is what gets you started. Habit is what keeps you going. — Jim Ryun",
  "Opportunities don't happen. You create them. — Chris Grosser",
  "The journey of a thousand miles begins with one step. — Lao Tzu",
  "It always seems impossible until it's done. — Nelson Mandela",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "Dream big, start small, act now. — Robin Sharma",
  "Your limitation — it's only your imagination.",
];

function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen({ onNavigate, onOpenProfile }: { onNavigate: (tab: TabId) => void; onOpenProfile?: () => void }) {
  const { user } = useAuth();
  const [requestOpen, setRequestOpen] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  useBudgetAlerts();

  const dailyQuote = getDailyQuote();

  // Fetch budgets + this month's transactions for the overlay
  const { data: budgets } = useQuery({
    queryKey: ["budgets-home", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("budgets").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: monthTx } = useQuery({
    queryKey: ["month-tx-home", user?.id],
    queryFn: async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data } = await supabase
        .from("transactions")
        .select("category, amount")
        .eq("user_id", user!.id)
        .gte("created_at", monthStart);
      return data || [];
    },
    enabled: !!user,
  });

  const budgetAlerts = useMemo(() => {
    if (!budgets || !monthTx) return [];
    const catSpend: Record<string, number> = {};
    monthTx.forEach((t) => {
      catSpend[t.category] = (catSpend[t.category] || 0) + Math.abs(Number(t.amount));
    });
    const emojiMap: Record<string, string> = { Food: "🍔", Travel: "🚗", Shopping: "🛍️", Bills: "📱", Entertainment: "🎬", Health: "💊", Clothing: "👕", Accessories: "⌚", General: "💰" };
    return budgets
      .filter((b) => (catSpend[b.category] || 0) > Number(b.budget_limit))
      .map((b) => ({
        category: b.category,
        emoji: b.emoji || emojiMap[b.category] || "💰",
        spent: catSpend[b.category] || 0,
        limit: Number(b.budget_limit),
      }));
  }, [budgets, monthTx]);

  const handleQrScan = useCallback((data: string) => {
    toast.success("QR scanned: " + data);
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["recent-transactions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!user,
  });

  const todaySpend = transactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;
  const animatedSpend = useAnimatedCounter(todaySpend);

  const userName = profile?.name || user?.email?.split("@")[0] || "there";
  const avatar = userName.charAt(0).toUpperCase();

  const catMap: Record<string, { amount: number; emoji: string }> = {};
  const emojiMap: Record<string, string> = { Food: "🍔", Travel: "🚗", Shopping: "🛍️", Bills: "📱", Entertainment: "🎬", Health: "💊", Clothing: "👕", Accessories: "⌚", General: "💰" };
  transactions?.forEach((t) => {
    if (!catMap[t.category]) catMap[t.category] = { amount: 0, emoji: emojiMap[t.category] || "💰" };
    catMap[t.category].amount += Math.abs(Number(t.amount));
  });
  const categorySnapshot = Object.entries(catMap).slice(0, 3).map(([label, v]) => ({ label, ...v }));

  const quickActions = [
    { icon: QrCode, label: "Scan Pay", action: () => setScannerOpen(true), color: "gradient-primary" },
    { icon: ArrowDownLeft, label: "Request", action: () => setRequestOpen(true), color: "bg-accent" },
    { icon: Wallet, label: "Balance", action: () => setBalanceOpen(true), color: "bg-accent" },
    { icon: ArrowUpRight, label: "History", action: () => onNavigate("insights"), color: "bg-accent" },
  ];

  return (
    <>
      <motion.div className="space-y-5 px-4 pb-24 pt-6" variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
           <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {getGreeting()}, {userName} ☀️
            </h1>
            <p className="mt-1 text-xs italic text-muted-foreground leading-relaxed">"{dailyQuote}"</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <button onClick={onOpenProfile} className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-primary-foreground font-display font-bold text-lg shadow-lg transition-all active:scale-95 hover:glow-blue">
              {avatar}
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden border-0 glow-card">
            <div className="gradient-spend p-6">
              <p className="text-sm font-medium text-muted-foreground">Today's Spending</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-10 w-32" />
              ) : (
                <p className="mt-1 font-display text-4xl font-bold text-foreground animate-count-up">
                  ₹{animatedSpend.toLocaleString("en-IN")}
                </p>
              )}
              <div className="mt-4 flex gap-3 flex-wrap">
                {categorySnapshot.map((cat) => (
                  <div key={cat.label} className="flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                    <span>{cat.emoji}</span>
                    <span className="text-muted-foreground">{cat.label}</span>
                    <span className="font-semibold text-foreground">₹{cat.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3">
          {quickActions.map((item) => (
            <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 glow-card transition-all active:scale-95 hover:bg-secondary">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color} text-primary-foreground`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={fadeUp}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent Transactions</h2>
            <button onClick={() => onNavigate("insights")} className="text-xs font-medium text-primary">See all</button>
          </div>
          <Card className="glow-card">
            <CardContent className="divide-y divide-border p-0">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))
              ) : transactions && transactions.length > 0 ? (
                transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xl">{tx.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{tx.merchant}</p>
                      <p className="text-xs text-muted-foreground">{tx.time} • {tx.category}</p>
                    </div>
                    <p className={`text-sm font-semibold ${Number(tx.amount) < 0 ? "text-destructive" : "text-primary"}`}>
                      {Number(tx.amount) < 0 ? "-" : "+"}₹{Math.abs(Number(tx.amount))}
                    </p>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No transactions yet. Make a payment to get started!</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <QrScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleQrScan} />
      <RequestMoneyDialog open={requestOpen} onClose={() => setRequestOpen(false)} />
      <CheckBalanceDialog open={balanceOpen} onClose={() => setBalanceOpen(false)} />
      <BudgetExceededOverlay alerts={budgetAlerts} />
    </>
  );
}
