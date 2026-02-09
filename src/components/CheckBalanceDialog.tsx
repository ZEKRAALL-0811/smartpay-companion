import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, Eye, EyeOff } from "lucide-react";
import { UpiPinDialog } from "./UpiPinDialog";

interface CheckBalanceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CheckBalanceDialog({ open, onClose }: CheckBalanceDialogProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [pinOpen, setPinOpen] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleOpen = () => {
    if (!verified) {
      setPinOpen(true);
    }
  };

  const handlePinVerified = async () => {
    setPinOpen(false);
    setVerified(true);
    if (!user) return;
    const { data } = await supabase
      .from("bank_accounts")
      .select("account_balance")
      .eq("user_id", user.id)
      .maybeSingle();
    setBalance(data?.account_balance ?? 0);
  };

  const handleClose = () => {
    setBalance(null);
    setVerified(false);
    setShowBalance(true);
    onClose();
  };

  // Auto-trigger PIN on open
  if (open && !verified && !pinOpen) {
    setPinOpen(true);
  }

  return (
    <>
      <UpiPinDialog
        open={pinOpen}
        onClose={() => { setPinOpen(false); if (!verified) handleClose(); }}
        onVerified={handlePinVerified}
        title="Check Balance"
        description="Enter UPI PIN to view your balance"
      />
      <Dialog open={open && verified} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="max-w-xs rounded-2xl border-0 bg-card">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center font-display">Account Balance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <p className="font-display text-4xl font-bold text-foreground">
                {showBalance ? `₹${(balance ?? 0).toLocaleString("en-IN")}` : "₹ •••••"}
              </p>
              <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground hover:text-foreground">
                {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Available Balance</p>
            <Button onClick={handleClose} variant="outline" className="h-10 w-full rounded-xl">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
