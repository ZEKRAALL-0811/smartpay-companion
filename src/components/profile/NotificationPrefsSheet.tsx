import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const prefs = [
  { key: "budget_alerts", icon: AlertTriangle, label: "Budget Alerts", desc: "Get notified when you exceed category budgets", default: true },
  { key: "motivational", icon: Sparkles, label: "Motivational Messages", desc: "Receive daily encouragement to track expenses", default: true },
  { key: "transaction", icon: TrendingUp, label: "Transaction Updates", desc: "Notifications for every payment and receipt", default: true },
  { key: "push", icon: Bell, label: "Push Notifications", desc: "Allow push notifications on this device", default: false },
];

export function NotificationPrefsSheet({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(prefs.map((p) => [p.key, p.default]))
  );

  const toggle = (key: string) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
    toast.success("Preference updated");
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground active:scale-95">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
      </div>

      <Card className="glow-card">
        <CardContent className="divide-y divide-border p-0">
          {prefs.map((pref) => (
            <div key={pref.key} className="flex items-center gap-3 px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <pref.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{pref.label}</p>
                <p className="text-xs text-muted-foreground">{pref.desc}</p>
              </div>
              <Switch checked={settings[pref.key]} onCheckedChange={() => toggle(pref.key)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
