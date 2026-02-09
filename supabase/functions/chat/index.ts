import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "update_profile",
      description: "Update the user's profile name or avatar URL. Only call when the user explicitly asks to change their profile.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "New display name" },
          avatar_url: { type: "string", description: "New avatar URL" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_budget",
      description: "Create or update a budget limit for a spending category. Only call when the user explicitly asks to set or change a budget.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Budget category (e.g. Food, Travel, Bills)" },
          emoji: { type: "string", description: "Emoji for the category" },
          budget_limit: { type: "number", description: "Monthly budget limit in INR" },
        },
        required: ["category", "budget_limit"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reset_upi_pin",
      description: "Reset the user's UPI PIN by clearing it so they must set up a new one. Only call when the user explicitly asks to reset their PIN.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_account_info",
      description: "Retrieve the user's account balance and UPI ID. Only call when the user explicitly asks for their account details.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_spending_summary",
      description: "Get the user's spending breakdown by category. Only call when the user explicitly asks for a spending summary.",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["week", "month", "all"], description: "Time period for the summary" },
        },
        additionalProperties: false,
      },
    },
  },
];

async function executeTool(toolName: string, args: Record<string, unknown>, userId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceKey);

  switch (toolName) {
    case "update_profile": {
      const updates: Record<string, string> = {};
      if (args.name) updates.name = args.name as string;
      if (args.avatar_url) updates.avatar_url = args.avatar_url as string;
      if (Object.keys(updates).length === 0) return { success: false, message: "No fields to update" };
      const { error } = await sb.from("profiles").update(updates).eq("id", userId);
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Profile updated: ${Object.keys(updates).join(", ")} changed.` };
    }

    case "update_budget": {
      const category = args.category as string;
      const limit = args.budget_limit as number;
      const emoji = (args.emoji as string) || "📊";
      // Upsert: update if category exists, else insert
      const { data: existing } = await sb.from("budgets").select("id").eq("user_id", userId).eq("category", category).maybeSingle();
      if (existing) {
        const { error } = await sb.from("budgets").update({ budget_limit: limit, emoji }).eq("id", existing.id);
        if (error) return { success: false, message: error.message };
        return { success: true, message: `Budget for ${category} updated to ₹${limit}.` };
      } else {
        const { error } = await sb.from("budgets").insert({ user_id: userId, category, emoji, budget_limit: limit, spent: 0, period: "monthly" });
        if (error) return { success: false, message: error.message };
        return { success: true, message: `Budget for ${category} created at ₹${limit}/month.` };
      }
    }

    case "reset_upi_pin": {
      const { error } = await sb.from("bank_accounts").update({ upi_pin_hash: null, is_setup_complete: false }).eq("user_id", userId);
      if (error) return { success: false, message: error.message };
      return { success: true, message: "UPI PIN has been reset. You'll need to set up a new PIN on next use." };
    }

    case "get_account_info": {
      const { data, error } = await sb.from("bank_accounts").select("account_balance, upi_id, mobile_number").eq("user_id", userId).maybeSingle();
      if (error || !data) return { success: false, message: "Could not retrieve account info." };
      return { success: true, balance: data.account_balance, upi_id: data.upi_id, mobile: data.mobile_number };
    }

    case "get_spending_summary": {
      let query = sb.from("transactions").select("category, amount").eq("user_id", userId);
      const period = args.period as string;
      if (period === "week") {
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        query = query.gte("created_at", weekAgo);
      } else if (period === "month") {
        const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        query = query.gte("created_at", monthAgo);
      }
      const { data, error } = await query;
      if (error) return { success: false, message: error.message };
      const summary: Record<string, number> = {};
      let total = 0;
      for (const tx of data || []) {
        summary[tx.category] = (summary[tx.category] || 0) + Math.abs(tx.amount);
        total += Math.abs(tx.amount);
      }
      return { success: true, summary, total, period: period || "all" };
    }

    default:
      return { success: false, message: `Unknown tool: ${toolName}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    // Extract user ID from auth token
    const authHeader = req.headers.get("Authorization") || "";
    let userId: string | null = null;
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
      const sb = createClient(supabaseUrl, anonKey);
      const { data } = await sb.auth.getUser(token);
      userId = data?.user?.id || null;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are SmartPay Assistant, a friendly and knowledgeable personal finance coach for Indian users. You help users understand their spending patterns, suggest ways to save money, and provide budgeting advice. Keep responses concise (2-4 sentences), use relevant emojis, and reference Indian Rupees (₹). Be encouraging and actionable. If asked about investments, give general educational info only — not specific financial advice.

IMPORTANT: You have access to tools that can change the user's settings, view their account info, and manage their budgets. ONLY use these tools when the user EXPLICITLY asks you to perform an action. For example:
- "Change my name to Rahul" → use update_profile
- "Set my food budget to 5000" → use update_budget  
- "Reset my UPI PIN" → use reset_upi_pin
- "Show my balance" → use get_account_info
- "How much did I spend this month?" → use get_spending_summary

NEVER call tools proactively or without explicit user instruction. If unsure, ASK the user to confirm before taking action.`;

    // First AI call - may include tool calls
    const aiPayload = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      tools,
      stream: false, // Use non-streaming for tool calls
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiPayload),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const choice = result.choices?.[0];

    // Check if the model wants to call tools
    if (choice?.finish_reason === "tool_calls" || choice?.message?.tool_calls?.length) {
      const toolCalls = choice.message.tool_calls || [];
      const toolResults: Array<{ role: string; tool_call_id: string; content: string }> = [];
      const actionsTaken: string[] = [];

      for (const tc of toolCalls) {
        const fnName = tc.function.name;
        let fnArgs: Record<string, unknown> = {};
        try { fnArgs = JSON.parse(tc.function.arguments || "{}"); } catch { /* empty */ }

        if (!userId) {
          toolResults.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify({ success: false, message: "User not authenticated. Please log in first." }),
          });
          continue;
        }

        const toolResult = await executeTool(fnName, fnArgs, userId);
        actionsTaken.push(`${fnName}: ${toolResult.success ? "✅" : "❌"} ${toolResult.message || ""}`);
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(toolResult),
        });
      }

      // Second AI call with tool results to get final response - stream this one
      const followUp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            choice.message,
            ...toolResults,
          ],
          stream: true,
        }),
      });

      if (!followUp.ok) {
        // Return a simple text response with action summary
        const summary = actionsTaken.join("\n");
        return new Response(JSON.stringify({
          choices: [{ message: { role: "assistant", content: `Done! Here's what I did:\n${summary}` } }],
          actions: actionsTaken,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(followUp.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls - stream the response directly
    // Re-do the call with streaming enabled
    const streamResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...aiPayload,
        stream: true,
      }),
    });

    if (!streamResp.ok) {
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(streamResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
