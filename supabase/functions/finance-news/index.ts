import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Curated finance news (since we don't have a news API key, we provide quality mock live data)
const financeNews = [
  {
    title: "RBI Cuts Repo Rate by 25 bps to 6.25% — EMIs Set to Fall",
    description: "The Reserve Bank of India has reduced the repo rate, signaling cheaper home and auto loans for borrowers.",
    url: "https://rbi.org.in",
    source: "RBI",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Sensex Crosses 80,000 Mark for First Time in History",
    description: "Indian stock markets hit a new milestone as foreign and domestic investors pour money into equities.",
    url: "https://www.bseindia.com",
    source: "BSE India",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    title: "Gold Prices Surge Past ₹75,000 Per 10 Grams",
    description: "Gold continues its upward trend amid global uncertainties and central bank buying.",
    url: "https://www.mcxindia.com",
    source: "MCX",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    title: "UPI Transactions Hit 16 Billion in January 2026",
    description: "Digital payments continue explosive growth with UPI processing record volumes month over month.",
    url: "https://www.npci.org.in",
    source: "NPCI",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    title: "New Tax Slabs Under Budget 2026 — What Changes for You",
    description: "Finance Minister announces revised income tax slabs with higher exemption limits for middle-class taxpayers.",
    url: "https://www.incometax.gov.in",
    source: "Income Tax Dept",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    title: "Mutual Fund SIP Inflows Cross ₹25,000 Crore Monthly",
    description: "Systematic Investment Plans continue to attract retail investors with consistent monthly contributions.",
    url: "https://www.amfiindia.com",
    source: "AMFI",
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    title: "Rupee Strengthens to 82.50 Against US Dollar",
    description: "Indian rupee gains ground as FII inflows increase and crude oil prices moderate globally.",
    url: "https://www.rbi.org.in",
    source: "Forex Markets",
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    title: "SEBI Introduces New Rules for F&O Trading — Key Changes",
    description: "Securities regulator tightens derivatives trading norms to protect retail investors from excessive speculation.",
    url: "https://www.sebi.gov.in",
    source: "SEBI",
    publishedAt: new Date(Date.now() - 25200000).toISOString(),
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return new Response(JSON.stringify({ articles: financeNews }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ articles: [], error: "Failed to fetch news" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
