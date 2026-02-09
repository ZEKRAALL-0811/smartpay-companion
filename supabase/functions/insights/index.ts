import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { period = "month" } = await req.json().catch(() => ({}));

    const now = new Date();
    let startDate: Date;
    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    const { data: budgets } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id);

    const txs = transactions || [];
    const total = txs.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const catMap: Record<string, number> = {};
    txs.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + Math.abs(Number(t.amount));
    });

    const colorMap: Record<string, string> = {
      Food: "hsl(42 80% 50%)",
      Travel: "hsl(145 65% 46%)",
      Shopping: "hsl(180 50% 42%)",
      Bills: "hsl(100 45% 42%)",
      Entertainment: "hsl(60 50% 45%)",
      Health: "hsl(280 60% 55%)",
      General: "hsl(200 50% 50%)",
    };

    const categories = Object.entries(catMap).map(([name, amount]) => ({
      name,
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      trend: 0,
      color: colorMap[name] || "hsl(200 50% 50%)",
    }));

    const dailyMap: Record<string, number> = {};
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    txs.forEach((t) => {
      const d = new Date(t.created_at);
      const label = period === "month" ? `W${Math.ceil(d.getDate() / 7)}` : dayLabels[d.getDay()];
      dailyMap[label] = (dailyMap[label] || 0) + Math.abs(Number(t.amount));
    });

    const daily = Object.entries(dailyMap).map(([day, amount]) => ({ day, amount }));

    const budgetData = (budgets || []).map((b) => ({
      category: b.category,
      spent: Number(b.spent),
      limit: Number(b.budget_limit),
      emoji: b.emoji,
    }));

    return new Response(
      JSON.stringify({ total, categories, daily, budgets: budgetData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("insights error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
