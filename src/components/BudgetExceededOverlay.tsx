import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface BudgetAlert {
  category: string;
  emoji: string;
  spent: number;
  limit: number;
}

// Track globally so it only fires once per browser session
const shownThisSession = { value: false };

export function BudgetExceededOverlay({ alerts }: { alerts: BudgetAlert[] }) {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const triggered = useRef(false);

  const activeAlerts = alerts.filter((a) => a.spent > a.limit);

  useEffect(() => {
    if (activeAlerts.length > 0 && !shownThisSession.value && !triggered.current) {
      triggered.current = true;
      shownThisSession.value = true;
      setVisible(true);
      setCountdown(5);
    }
  }, [activeAlerts.length]);

  useEffect(() => {
    if (!visible) return;
    if (countdown <= 0) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [visible, countdown]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md"
          style={{ pointerEvents: "all" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.1, type: "spring", damping: 20 }}
            className="mx-6 max-w-sm w-full rounded-3xl border border-destructive/30 bg-card p-8 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="font-display text-2xl font-bold text-destructive mb-2">
              Budget Exceeded!
            </h2>
            <div className="space-y-3 mb-6">
              {activeAlerts.map((a) => (
                <div
                  key={a.category}
                  className="rounded-xl bg-destructive/10 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {a.emoji} {a.category}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Spent ₹{a.spent.toLocaleString("en-IN")} of ₹
                    {a.limit.toLocaleString("en-IN")} — ₹
                    {(a.spent - a.limit).toLocaleString("en-IN")} over
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Returning to dashboard in{" "}
              <span className="font-bold text-foreground">{countdown}s</span>
            </p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-destructive"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
