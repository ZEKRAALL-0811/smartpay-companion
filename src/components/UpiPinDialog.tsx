import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UpiPinDialogProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  title?: string;
  description?: string;
}

export function UpiPinDialog({ open, onClose, onVerified, title = "Enter UPI PIN", description = "Enter your 6-digit UPI PIN to continue" }: UpiPinDialogProps) {
  const { user } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleVerify = async () => {
    if (pin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await supabase
        .from("bank_accounts")
        .select("upi_pin_hash")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        setError("No bank account found");
        return;
      }

      // Simple verification for demo
      if (btoa(pin) === data.upi_pin_hash) {
        setPin("");
        setAttempts(0);
        onVerified();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setError("Too many incorrect attempts. Please try again later.");
        } else {
          setError(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`);
        }
      }
    } catch {
      setError("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-xs rounded-2xl border-0 bg-card">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-display">{title}</DialogTitle>
          <p className="text-center text-xs text-muted-foreground">{description}</p>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            className="h-14 rounded-xl text-center text-2xl tracking-[0.5em]"
            placeholder="••••••"
            maxLength={6}
            autoFocus
          />
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
          )}
          <Button
            onClick={handleVerify}
            disabled={loading || pin.length !== 6 || attempts >= 3}
            className="h-12 w-full rounded-xl gradient-primary font-display font-bold"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
