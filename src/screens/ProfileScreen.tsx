import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bell, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Settings } from "lucide-react";
import { toast } from "sonner";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const menuItems = [
  { icon: CreditCard, label: "Linked Accounts", subtitle: "2 bank accounts linked" },
  { icon: Bell, label: "Notifications", subtitle: "Push & email alerts" },
  { icon: Shield, label: "Security", subtitle: "Biometrics, PIN & password" },
  { icon: Settings, label: "Preferences", subtitle: "Language, currency, theme" },
  { icon: HelpCircle, label: "Help & Support", subtitle: "FAQs and contact us" },
];

export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const { user, signOut } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: txCount } = useQuery({
    queryKey: ["tx-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("transactions").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
  };

  const userName = profile?.name || user?.email?.split("@")[0] || "User";
  const avatar = userName.charAt(0).toUpperCase();

  return (
    <motion.div className="space-y-5 px-4 pb-24 pt-6 scrollbar-themed overflow-y-auto" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground transition-all active:scale-95 hover:bg-secondary/80">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-primary-foreground font-display font-bold text-3xl shadow-lg glow-blue">
          {avatar}
        </div>
        <div className="text-center">
          {isLoading ? (
            <>
              <Skeleton className="mx-auto h-6 w-32" />
              <Skeleton className="mx-auto mt-1 h-4 w-40" />
            </>
          ) : (
            <>
              <p className="font-display text-xl font-bold text-foreground">{userName}</p>
              <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
            </>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        {[
          { label: "Transactions", value: txCount?.toString() || "0" },
          { label: "This Month", value: "—" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 glow-card">
            <CardContent className="flex flex-col items-center p-3">
              <p className="font-display text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glow-card">
          <CardContent className="divide-y divide-border p-0">
            {menuItems.map((item) => (
              <button key={item.label} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/50 active:scale-[0.99]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 py-3.5 text-sm font-medium text-destructive transition-all active:scale-95 hover:bg-destructive/10">
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </motion.div>
    </motion.div>
  );
}
