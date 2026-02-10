import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle, Fingerprint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AppPinLockScreenProps {
  onUnlocked: () => void;
}

export function AppPinLockScreen({ onUnlocked }: AppPinLockScreenProps) {
  const { user, signOut } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleVerify = async () => {
    if (pin.length < 4 || pin.length > 6) {
      setError("PIN must be 4-6 digits");
      return;
    }
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await supabase
        .from("bank_accounts")
        .select("app_pin_hash")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data?.app_pin_hash) {
        // No PIN set — allow through
        onUnlocked();
        return;
      }

      if (btoa(pin) === data.app_pin_hash) {
        setPin("");
        setAttempts(0);
        onUnlocked();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 5) {
          setError("Too many incorrect attempts. You've been signed out.");
          await signOut();
        } else {
          setError(`Incorrect PIN. ${5 - newAttempts} attempts remaining.`);
        }
      }
    } catch {
      setError("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length >= 4) {
      handleVerify();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xs text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
        >
          <Shield className="h-10 w-10 text-primary" />
        </motion.div>

        <h1 className="mb-1 font-display text-2xl font-bold text-foreground">
          Welcome Back
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Enter your App PIN to continue
        </p>

        <div className="space-y-4">
          <Input
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            onKeyDown={handleKeyDown}
            className="h-14 rounded-xl text-center text-2xl tracking-[0.5em] bg-card"
            placeholder="••••"
            maxLength={6}
            autoFocus
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-xs text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </motion.div>
          )}

          <Button
            onClick={handleVerify}
            disabled={loading || pin.length < 4 || attempts >= 5}
            className="h-12 w-full rounded-xl gradient-primary font-display font-bold"
          >
            {loading ? "Verifying..." : "Unlock"}
          </Button>

          <div className="flex items-center justify-center gap-1 pt-2 text-xs text-muted-foreground">
            <Fingerprint className="h-3 w-3" />
            <span>Secured with device binding</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
