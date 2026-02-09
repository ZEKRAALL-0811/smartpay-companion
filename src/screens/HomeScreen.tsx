import { motion } from "framer-motion";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { user, todaySpend, categorySnapshot, smartAlert, recentTransactions } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QrCode, ArrowUpRight } from "lucide-react";
import type { TabId } from "@/components/BottomNav";

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
  const animatedSpend = useAnimatedCounter(todaySpend);

  return (
    <motion.div
      className="space-y-5 px-4 pb-24 pt-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Greeting */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {getGreeting()}, {user.name} ☀️
          </h1>
          <p className="text-sm text-muted-foreground">Here's your spending story today</p>
        </div>
        <button
          onClick={onOpenProfile}
          className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-primary-foreground font-display font-bold text-lg shadow-lg transition-all active:scale-95 hover:glow-blue"
        >
          {user.avatar}
        </button>
      </motion.div>

      {/* Today's Spend */}
      <motion.div variants={fadeUp}>
        <Card className="overflow-hidden border-0 glow-card">
          <div className="gradient-spend p-6">
            <p className="text-sm font-medium text-muted-foreground">Today's Spending</p>
            <p className="mt-1 font-display text-4xl font-bold text-foreground animate-count-up">
              ₹{animatedSpend.toLocaleString("en-IN")}
            </p>
            <div className="mt-4 flex gap-3">
              {categorySnapshot.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
                >
                  <span>{cat.emoji}</span>
                  <span className="text-muted-foreground">{cat.label}</span>
                  <span className="font-semibold text-foreground">₹{cat.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Smart Alert */}
      <motion.div variants={fadeUp}>
        <Card className="border-warning/15 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{smartAlert.message}</p>
                <div className="mt-2">
                  <Progress value={smartAlert.progress} className="h-2 bg-warning/15" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {smartAlert.progress}% of weekly {smartAlert.category.toLowerCase()} budget used
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        {[
          { icon: QrCode, label: "Scan", action: () => onNavigate("pay") },
          { icon: ArrowUpRight, label: "Request", action: () => {} },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 glow-card transition-all active:scale-95 hover:bg-secondary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
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
          <button className="text-xs font-medium text-primary">See all</button>
        </div>
        <Card className="glow-card">
          <CardContent className="divide-y divide-border p-0">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl">{tx.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{tx.merchant}</p>
                  <p className="text-xs text-muted-foreground">{tx.time}</p>
                </div>
                <p className="text-sm font-semibold text-destructive">
                  ₹{Math.abs(tx.amount)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
