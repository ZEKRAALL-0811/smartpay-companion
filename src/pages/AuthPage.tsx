import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { OnboardingScreen } from "@/screens/OnboardingScreen";

export default function AuthPage() {
  const [mode, setMode] = useState<"choose" | "login" | "signup">("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "signup") {
    return <OnboardingScreen onComplete={() => {}} />;
  }

  if (mode === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-3xl shadow-lg">
              💰
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">SmartPay</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome back</p>
          </div>
          <Card className="border-0 glow-card">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 rounded-xl" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-xl" minLength={6} />
                </div>
                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl gradient-primary text-base font-display font-bold">
                  {loading ? "Please wait..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button onClick={() => setMode("choose")} className="text-sm text-primary hover:underline">← Back</button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Choose mode
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-3xl shadow-lg">
            💰
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">SmartPay</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your smart payment companion</p>
        </div>
        <div className="space-y-3">
          <Button onClick={() => setMode("signup")} className="h-14 w-full rounded-xl gradient-primary text-base font-display font-bold">
            Create New Account
          </Button>
          <Button onClick={() => setMode("login")} variant="outline" className="h-14 w-full rounded-xl text-base font-display font-bold">
            I Already Have an Account
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
