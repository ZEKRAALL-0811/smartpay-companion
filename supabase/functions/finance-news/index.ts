import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const today = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a financial news aggregator. Return ONLY a valid JSON array of 8 current, real finance news articles relevant to Indian markets and personal finance as of ${today}. Each article must have: title, description (1-2 sentences), url (real source URL), source (publisher name), publishedAt (ISO date string for today), category (one of: Markets, Crypto, Tax Tips, Savings, Investing, Personal Finance). Make the news realistic, current, and diverse across categories. Do NOT wrap in markdown code blocks — return raw JSON array only.`,
          },
          {
            role: "user",
            content: `Give me the latest 8 Indian finance news headlines for ${today}. Include a mix of stock market updates, RBI policy, mutual funds, crypto, tax, and personal finance topics. Return only the JSON array.`,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "[]";

    // Parse the AI response - strip any markdown wrapping
    let articles = [];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      articles = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", parseErr, content);
      articles = [];
    }

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("finance-news error:", error);
    return new Response(
      JSON.stringify({ articles: [], error: "Failed to fetch news" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
