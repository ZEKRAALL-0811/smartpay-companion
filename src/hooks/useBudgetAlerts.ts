import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const MOTIVATIONAL_MESSAGES = [
  { title: "Keep it up! 💪", message: "Every rupee tracked is a step toward financial freedom. You're doing great!" },
  { title: "Smart money move! 🧠", message: "Tracking expenses regularly puts you ahead of 80% of people. Stay consistent!" },
  { title: "Financial hero! 🦸", message: "Small savings today lead to big achievements tomorrow. Keep tracking!" },
  { title: "You're on track! 🎯", message: "Consistency is the key to financial success. Check your budgets today!" },
  { title: "Money wisdom! 💡", message: "A budget tells your money where to go instead of wondering where it went." },
];

export function useBudgetAlerts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const lastAlertRef = useRef<Set<string>>(new Set());
  const motivationalSentRef = useRef(false);

  const { data: budgets } = useQuery({
    queryKey: ["budgets-alert", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("budgets").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Fetch this month's transactions to compute actual spend per category
  const { data: monthTransactions } = useQuery({
    queryKey: ["month-transactions-alert", user?.id],
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
    refetchInterval: 15000, // check every 15s for new transactions
  });

  // Check for budget overages using real transaction data
  useEffect(() => {
    if (!budgets || !monthTransactions || !user) return;

    // Compute actual spent per category from transactions
    const catSpend: Record<string, number> = {};
    monthTransactions.forEach((t) => {
      catSpend[t.category] = (catSpend[t.category] || 0) + Math.abs(Number(t.amount));
    });

    budgets.forEach((b) => {
      const actualSpent = catSpend[b.category] || 0;
      const limit = Number(b.budget_limit);
      if (limit <= 0) return;

      const pct = (actualSpent / limit) * 100;
      const alertKey = `${b.id}-${pct > 100 ? "over" : "warn"}`;

      if (pct > 100 && !lastAlertRef.current.has(alertKey)) {
        lastAlertRef.current.add(alertKey);
        const overAmount = actualSpent - limit;

        toast.error(`${b.emoji} Budget exceeded: ${b.category}`, {
          description: `You've overspent by ₹${overAmount.toLocaleString("en-IN")} (${Math.round(pct)}% of ₹${limit.toLocaleString("en-IN")} budget)`,
          duration: 6000,
        });

        // Store as notification
        supabase.from("notifications").insert({
          user_id: user.id,
          type: "budget_alert",
          title: `${b.emoji} ${b.category} budget exceeded!`,
          message: `You've spent ₹${actualSpent.toLocaleString("en-IN")} of your ₹${limit.toLocaleString("en-IN")} budget — ₹${overAmount.toLocaleString("en-IN")} over limit.`,
          category: b.category,
        }).then(() => qc.invalidateQueries({ queryKey: ["notifications"] }));
      } else if (pct > 80 && pct <= 100 && !lastAlertRef.current.has(alertKey)) {
        lastAlertRef.current.add(alertKey);
        toast.warning(`${b.emoji} Approaching ${b.category} limit`, {
          description: `You've used ${Math.round(pct)}% of your ₹${limit.toLocaleString("en-IN")} ${b.category} budget`,
          duration: 5000,
        });

        supabase.from("notifications").insert({
          user_id: user.id,
          type: "budget_warning",
          title: `${b.emoji} ${b.category} budget at ${Math.round(pct)}%`,
          message: `You've used ₹${actualSpent.toLocaleString("en-IN")} of your ₹${limit.toLocaleString("en-IN")} ${b.category} budget.`,
          category: b.category,
        }).then(() => qc.invalidateQueries({ queryKey: ["notifications"] }));
      }
    });
  }, [budgets, monthTransactions, user, qc]);

  // Send a motivational message once per session
  useEffect(() => {
    if (!user || motivationalSentRef.current) return;
    motivationalSentRef.current = true;

    const timer = setTimeout(() => {
      const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      toast(msg.title, { description: msg.message, duration: 5000 });

      supabase.from("notifications").insert({
        user_id: user.id,
        type: "motivational",
        title: msg.title,
        message: msg.message,
      }).then(() => qc.invalidateQueries({ queryKey: ["notifications"] }));
    }, 8000);

    return () => clearTimeout(timer);
  }, [user, qc]);
}
