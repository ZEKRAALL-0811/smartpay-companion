import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav, type TabId } from "@/components/BottomNav";
import { HomeScreen } from "@/screens/HomeScreen";
import { PayScreen } from "@/screens/PayScreen";
import { InsightsScreen } from "@/screens/InsightsScreen";
import { CoachScreen } from "@/screens/CoachScreen";
import { HubScreen } from "@/screens/HubScreen";

const screens: Record<TabId, React.ComponentType<{ onNavigate: (tab: TabId) => void }>> = {
  home: HomeScreen,
  pay: PayScreen as any,
  insights: InsightsScreen as any,
  coach: CoachScreen as any,
  hub: HubScreen as any,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const Screen = screens[activeTab];

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
          <Screen onNavigate={setActiveTab} />
        </motion.div>
      </AnimatePresence>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;
