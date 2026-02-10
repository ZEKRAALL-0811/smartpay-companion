import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield } from "lucide-react";
import { BottomNav, type TabId } from "@/components/BottomNav";
import { HomeScreen } from "@/screens/HomeScreen";
import { PayScreen } from "@/screens/PayScreen";
import { InsightsScreen } from "@/screens/InsightsScreen";
import { CoachScreen } from "@/screens/CoachScreen";
import { HubScreen } from "@/screens/HubScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { AppPinLockScreen } from "@/components/AppPinLockScreen";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";

const screens: Record<TabId, React.ComponentType<{ onNavigate: (tab: TabId) => void }>> = {
  home: HomeScreen,
  pay: PayScreen as any,
  insights: InsightsScreen as any,
  coach: CoachScreen as any,
  hub: HubScreen as any,
};

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [showProfile, setShowProfile] = useState(false);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [deviceTrusted, setDeviceTrusted] = useState<boolean | null>(null);

  // Check if UPI setup is complete
  const { data: bankAccount, isLoading } = useQuery({
    queryKey: ["bank-account", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bank_accounts")
        .select("is_setup_complete, device_fingerprint, app_pin_hash")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Verify device fingerprint (web-compatible SIM/device binding)
  useEffect(() => {
    if (!bankAccount?.device_fingerprint) {
      setDeviceTrusted(true); // No fingerprint stored yet, allow
      return;
    }
    generateDeviceFingerprint().then((currentFp) => {
      const trusted = currentFp === bankAccount.device_fingerprint;
      setDeviceTrusted(trusted);
    });
  }, [bankAccount?.device_fingerprint]);

  const isSetupDone = bankAccount?.is_setup_complete === true;
  const hasAppPin = !!bankAccount?.app_pin_hash;

  if (isLoading || deviceTrusted === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Show UPI setup if not complete
  // Block access if device fingerprint doesn't match (SIM/device binding)
  if (deviceTrusted === false) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xs text-center space-y-6"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Unrecognized Device</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This device does not match the one registered with your account. For your security, access is blocked.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Please log in from your registered device or contact support to update your device binding.
            </p>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="h-12 w-full rounded-xl font-display font-bold"
          >
            Sign Out
          </Button>
        </motion.div>
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

  // Show app PIN lock screen if PIN is set and not yet unlocked
  if (hasAppPin && !isUnlocked) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-background">
        <AppPinLockScreen onUnlocked={() => setIsUnlocked(true)} />
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
