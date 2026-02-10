import { motion } from "framer-motion";
import { ArrowLeft, Shield, Fingerprint, KeyRound, Smartphone, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function SecuritySheet({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();

  const { data: bankAccount } = useQuery({
    queryKey: ["bank-security", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("bank_accounts").select("app_pin_hash, upi_pin_hash, device_fingerprint").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const securityItems = [
    { icon: KeyRound, label: "App PIN", desc: "4-6 digit lock for app access", active: !!bankAccount?.app_pin_hash },
    { icon: Shield, label: "UPI PIN", desc: "Secure PIN for payments", active: !!bankAccount?.upi_pin_hash },
    { icon: Smartphone, label: "Device Binding", desc: "Restrict access to this device", active: !!bankAccount?.device_fingerprint },
    { icon: Fingerprint, label: "Biometric Lock", desc: "Use fingerprint or face ID", active: false },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground active:scale-95">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">Security</h1>
      </div>

      <Card className="glow-card">
        <CardContent className="divide-y divide-border p-0">
          {securityItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              {item.active ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
              ) : (
                <span className="text-[10px] font-medium text-muted-foreground rounded-full bg-secondary px-2 py-0.5">Off</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="rounded-2xl bg-secondary/50 p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Security tip:</strong> Enable all security features for maximum protection of your financial data.
        </p>
      </div>
    </motion.div>
  );
}
