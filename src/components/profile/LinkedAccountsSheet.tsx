import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Plus, Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LinkedAccountsSheet({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();

  const { data: bankAccount, isLoading } = useQuery({
    queryKey: ["bank-account-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground active:scale-95">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">Linked Accounts</h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-2xl" />
      ) : bankAccount ? (
        <Card className="glow-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-foreground">Primary Bank Account</p>
                <p className="text-xs text-muted-foreground">UPI ID: {bankAccount.upi_id || "Not set"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-[10px] text-muted-foreground">Card ending</p>
                <p className="font-display font-bold text-foreground flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" /> •••• {bankAccount.card_number_last4}
                </p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-[10px] text-muted-foreground">Expires</p>
                <p className="font-display font-bold text-foreground">{bankAccount.card_expiry}</p>
              </div>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-[10px] text-muted-foreground">Mobile Number</p>
              <p className="text-sm font-medium text-foreground">{bankAccount.mobile_number}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glow-card">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <CreditCard className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No bank account linked yet</p>
          </CardContent>
        </Card>
      )}

      <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-medium text-muted-foreground transition-all active:scale-95 hover:border-primary hover:text-primary">
        <Plus className="h-4 w-4" />
        Link another account
      </button>
    </motion.div>
  );
}
