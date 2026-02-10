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
  const lastAlertRef = useRef<string>("");
  const motivationalSentRef = useRef(false);

  const { data: budgets } = useQuery({
    queryKey: ["budgets-alert", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("budgets").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  // Check for budget overages
  useEffect(() => {
    if (!budgets || !user) return;

    budgets.forEach((b) => {
      const pct = (Number(b.spent) / Number(b.budget_limit)) * 100;
      const alertKey = `${b.id}-${Math.floor(pct / 10)}`;

      if (pct > 100 && alertKey !== lastAlertRef.current) {
        lastAlertRef.current = alertKey;
        const overAmount = Number(b.spent) - Number(b.budget_limit);

        toast.error(`${b.emoji} Budget exceeded: ${b.category}`, {
          description: `You've overspent by ₹${overAmount.toLocaleString("en-IN")} (${Math.round(pct)}% of budget)`,
          duration: 6000,
        });

        // Store as notification
        supabase.from("notifications").insert({
          user_id: user.id,
          type: "budget_alert",
          title: `${b.emoji} ${b.category} budget exceeded!`,
          message: `You've spent ₹${Number(b.spent).toLocaleString("en-IN")} of your ₹${Number(b.budget_limit).toLocaleString("en-IN")} budget — ₹${overAmount.toLocaleString("en-IN")} over limit.`,
          category: b.category,
        }).then(() => qc.invalidateQueries({ queryKey: ["notifications"] }));
      } else if (pct > 80 && pct <= 100 && alertKey !== lastAlertRef.current) {
        lastAlertRef.current = alertKey;
        toast.warning(`${b.emoji} Approaching ${b.category} limit`, {
          description: `You've used ${Math.round(pct)}% of your ${b.category} budget`,
          duration: 5000,
        });
      }
    });
  }, [budgets, user, qc]);

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
    }, 8000); // show 8s after login

    return () => clearTimeout(timer);
  }, [user, qc]);
}
