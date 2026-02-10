import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav, type TabId } from "@/components/BottomNav";
import { HomeScreen } from "@/screens/HomeScreen";
import { PayScreen } from "@/screens/PayScreen";
import { InsightsScreen } from "@/screens/InsightsScreen";
import { CoachScreen } from "@/screens/CoachScreen";
import { HubScreen } from "@/screens/HubScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const screens: Record<TabId, React.ComponentType<{ onNavigate: (tab: TabId) => void }>> = {
  home: HomeScreen,
  pay: PayScreen as any,
  insights: InsightsScreen as any,
  coach: CoachScreen as any,
  hub: HubScreen as any,
};

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [showProfile, setShowProfile] = useState(false);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  // Check if UPI setup is complete
  const { data: bankAccount, isLoading } = useQuery({
    queryKey: ["bank-account", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bank_accounts")
        .select("is_setup_complete")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isSetupDone = bankAccount?.is_setup_complete === true;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Show UPI setup if not complete
  if (!isSetupDone && setupComplete !== true) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-background">
        <OnboardingScreen onComplete={() => setSetupComplete(true)} />
      </div>
    );
  }

  const Screen = screens[activeTab];

  if (showProfile) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ProfileScreen onBack={() => setShowProfile(false)} />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "home" ? (
            <HomeScreen onNavigate={setActiveTab} onOpenProfile={() => setShowProfile(true)} />
          ) : (
            <Screen onNavigate={setActiveTab} />
          )}
        </motion.div>
      </AnimatePresence>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;
