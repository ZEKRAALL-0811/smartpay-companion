import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { insightData, budgets } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const periods = ["today", "week", "month"] as const;
const periodLabels = { today: "Today", week: "This Week", month: "This Month" };

export function InsightsScreen() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("today");
  const [loading, setLoading] = useState(false);
  const data = insightData[period];
  const total = useAnimatedCounter(data.total, 800);

  const handlePeriodChange = (p: typeof period) => {
    setLoading(true);
    setPeriod(p);
  };

  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <div className="space-y-5 px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Insights 📊</h1>

      {/* Time Filters */}
      <div className="relative flex rounded-2xl bg-secondary p-1">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className="relative z-10 flex-1 py-2 text-sm font-medium transition-colors"
          >
            <span className={period === p ? "text-primary-foreground" : "text-muted-foreground"}>
              {periodLabels[p]}
            </span>
            {period === p && (
              <motion.div
                layoutId="period-pill"
                className="absolute inset-0 rounded-xl gradient-primary"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </motion.div>
        ) : (
          <motion.div key={period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Donut Chart */}
            <Card className="border-0 shadow-lg glow-primary">
              <CardContent className="p-4">
                <div className="relative mx-auto h-48 w-48">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={data.categories}
                        dataKey="amount"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        strokeWidth={0}
                      >
                        {data.categories.map((c, i) => (
                          <Cell key={i} fill={c.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-display text-xl font-bold text-foreground">₹{total.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {data.categories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{cat.name}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">₹{cat.amount.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Budget Progress */}
            <div>
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Budgets</h2>
              <div className="space-y-3">
                {budgets.map((b) => {
                  const pct = Math.round((b.spent / b.limit) * 100);
                  const status = pct > 100 ? "destructive" : pct > 80 ? "warning" : "success";
                  return (
                    <Card key={b.category}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {b.emoji} {b.category}
                          </span>
                          <span className="text-muted-foreground">
                            ₹{b.spent.toLocaleString("en-IN")} / ₹{b.limit.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(pct, 100)}
                          className={`mt-2 h-2 ${status === "destructive" ? "bg-destructive/20" : status === "warning" ? "bg-warning/20" : "bg-success/20"}`}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Spending Trend */}
            <Card className="border-0 shadow-lg glow-primary">
              <CardContent className="p-4">
                <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Spending Trend</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={data.daily}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(210 90% 60%)" />
                        <stop offset="100%" stopColor="hsl(280 80% 55%)" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Spent"]}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="url(#barGradient)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
