import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile } = await req.json();

    if (!mobile || mobile.length !== 10) {
      return new Response(JSON.stringify({ error: "Invalid mobile number" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Simulated OTP — in production, integrate Twilio/MSG91 here
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    console.log(`[SIMULATED OTP] Mobile: ${mobile}, OTP: ${otp}`);

    // Return the OTP directly for demo purposes
    // In production, send via SMS and don't return it
    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent successfully",
        // Remove this in production — only for demo
        demo_otp: otp,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
