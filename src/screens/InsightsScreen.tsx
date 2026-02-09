import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const periods = ["today", "week", "month"] as const;
const periodLabels = { today: "Today", week: "This Week", month: "This Month" };

export function InsightsScreen() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<(typeof periods)[number]>("today");

  const { data, isLoading } = useQuery({
    queryKey: ["insights", user?.id, period],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          ...(user ? { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {}),
        },
        body: JSON.stringify({ period }),
      });
      if (!resp.ok) throw new Error("Failed to fetch insights");
      return resp.json();
    },
    enabled: !!user,
  });

  const total = useAnimatedCounter(data?.total || 0, 800);
  const categories = data?.categories || [];
  const daily = data?.daily || [];
  const budgets = data?.budgets || [];

  return (
    <div className="space-y-5 px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Insights 📊</h1>

      <div className="relative flex rounded-2xl bg-secondary p-1">
        {periods.map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className="relative z-10 flex-1 py-2 text-sm font-medium transition-colors">
            <span className={period === p ? "text-primary-foreground" : "text-muted-foreground"}>{periodLabels[p]}</span>
            {period === p && (
              <motion.div layoutId="period-pill" className="absolute inset-0 rounded-xl gradient-primary" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </motion.div>
        ) : (
          <motion.div key={period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Donut Chart */}
            {categories.length > 0 ? (
              <Card className="border-0 glow-blue">
                <CardContent className="p-4">
                  <div className="relative mx-auto h-48 w-48">
                    <ResponsiveContainer>
                      <PieChart>
                        <defs>
                          {categories.map((c: any, i: number) => (
                            <linearGradient key={i} id={`pie-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={c.color} stopOpacity={1} />
                              <stop offset="100%" stopColor={c.color} stopOpacity={0.6} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie data={categories} dataKey="amount" innerRadius={55} outerRadius={80} paddingAngle={4} strokeWidth={0}>
                          {categories.map((_: any, i: number) => (
                            <Cell key={i} fill={`url(#pie-grad-${i})`} />
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
            ) : (
              <Card className="border-0 glow-blue">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No spending data for this period yet</p>
                </CardContent>
              </Card>
            )}

            {/* Category Breakdown */}
            {categories.length > 0 && (
              <Card>
                <CardContent className="divide-y divide-border p-0">
                  {categories.map((cat: any) => (
                    <div key={cat.name} className="flex items-center gap-3 px-4 py-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <div className="flex-1"><p className="text-sm font-medium text-foreground">{cat.name}</p></div>
                      <p className="text-sm font-semibold text-foreground">₹{cat.amount.toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Budget Progress */}
            {budgets.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Budgets</h2>
                <div className="space-y-3">
                  {budgets.map((b: any) => {
                    const pct = Math.round((b.spent / b.limit) * 100);
                    const status = pct > 100 ? "destructive" : pct > 80 ? "warning" : "success";
                    return (
                      <Card key={b.category}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>{b.emoji} {b.category}</span>
                            <span className="text-muted-foreground">₹{b.spent.toLocaleString("en-IN")} / ₹{b.limit.toLocaleString("en-IN")}</span>
                          </div>
                          <Progress value={Math.min(pct, 100)} className={`mt-2 h-2 ${status === "destructive" ? "bg-destructive/20" : status === "warning" ? "bg-warning/20" : "bg-success/20"}`} />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Spending Trend */}
            {daily.length > 0 && (
              <Card className="border-0 glow-purple">
                <CardContent className="p-4">
                  <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Spending Trend</h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={daily}>
                      <defs>
                        <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(145, 65%, 46%)" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="hsl(145, 65%, 46%)" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(220 10% 46%)" }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", background: "hsl(200, 12%, 10%)", boxShadow: "0 0 20px hsl(145, 65%, 46%, 0.3)" }} labelStyle={{ color: "hsl(220, 20%, 88%)" }} itemStyle={{ color: "hsl(220, 20%, 88%)" }} cursor={false} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Spent"]} />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="url(#barGlow)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
