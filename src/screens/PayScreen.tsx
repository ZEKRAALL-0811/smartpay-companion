import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QrCode, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { QrScanner } from "@/components/QrScanner";
import { UpiPinDialog } from "@/components/UpiPinDialog";
import { useNativeContacts } from "@/hooks/useNativeContacts";

type PayState = "form" | "pin" | "success";

const paymentCategories = [
  { emoji: "🍔", label: "Food" },
  { emoji: "👕", label: "Clothing" },
  { emoji: "⌚", label: "Accessories" },
  { emoji: "🚗", label: "Travel" },
  { emoji: "📱", label: "Bills" },
  { emoji: "🛍️", label: "Shopping" },
  { emoji: "🎬", label: "Entertainment" },
  { emoji: "💊", label: "Health" },
];

const BHARAT_CONTACT = {
  name: "Bharat",
  phone: "8124499897",
  avatar: "B",
  color: "hsl(245 58% 51%)",
};

export function PayScreen({ autoScan }: { autoScan?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<PayState>("form");
  const [amount, setAmount] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const { syncContacts, syncing } = useNativeContacts();

  const handleQrScan = useCallback((data: string) => {
    toast.success("QR scanned: " + data);
  }, []);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*").eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  // Auto-seed Bharat contact if not present
  useEffect(() => {
    if (!user || isLoading || !contacts) return;
    const hasBharat = contacts.some((c) => c.name === BHARAT_CONTACT.name && (c as any).phone === BHARAT_CONTACT.phone);
    if (!hasBharat) {
      supabase
        .from("contacts")
        .insert({
          user_id: user.id,
          name: BHARAT_CONTACT.name,
          phone: BHARAT_CONTACT.phone,
          avatar: BHARAT_CONTACT.avatar,
          color: BHARAT_CONTACT.color,
        } as any)
        .then(({ error }) => {
          if (!error) queryClient.invalidateQueries({ queryKey: ["contacts", user.id] });
        });
    }
  }, [user, contacts, isLoading, queryClient]);

  // Auto-open scanner when navigated with autoScan prop
  useEffect(() => {
    if (autoScan) setScannerOpen(true);
  }, [autoScan]);

  const contact = contacts?.find((c) => c.id === selectedContact);

  const handlePayClick = () => {
    if (!amount || !selectedContact || !selectedCategory) return;
    setPinOpen(true);
  };

  const handlePinVerified = async () => {
    setPinOpen(false);
    if (!amount || !selectedContact || !contact || !user) return;

    const emojiMap: Record<string, string> = { Food: "🍕", Travel: "🚕", Shopping: "🛒", Bills: "📱", Entertainment: "🎬", Health: "💊", Clothing: "👕", Accessories: "⌚" };
    const cat = selectedCategory || "General";
    const payAmount = parseInt(amount);

    const { data: account } = await supabase
      .from("bank_accounts")
      .select("account_balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (account && account.account_balance < payAmount) {
      toast.error("Insufficient balance!");
      return;
    }

    const { error: txError } = await supabase.from("transactions").insert({
      user_id: user.id,
      merchant: `Payment to ${contact.name}`,
      amount: -payAmount,
      category: cat,
      icon: emojiMap[cat] || "💸",
      time: "Just now",
    });

    if (txError) {
      toast.error("Payment failed: " + txError.message);
      return;
    }

    if (account) {
      await supabase
        .from("bank_accounts")
        .update({ account_balance: account.account_balance - payAmount })
        .eq("user_id", user.id);
    }

    queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
    setState("success");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleDone = () => {
    setState("form");
    setAmount("");
    setSelectedContact(null);
    setSelectedCategory(null);
  };

  const canPay = !!amount && !!selectedContact && !!selectedCategory;

  return (
    <div className="px-4 pb-24 pt-6">
      <AnimatePresence mode="wait">
        {state === "form" ? (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
            <h1 className="font-display text-2xl font-bold text-foreground">Pay 💸</h1>

            <Card className="border-dashed border-2 border-primary/20 bg-accent/30 cursor-pointer active:scale-95 transition-all" onClick={() => setScannerOpen(true)}>
              <CardContent className="flex flex-col items-center gap-2 p-8">
                <QrCode className="h-12 w-12 text-primary/40" />
                <p className="text-sm font-medium text-muted-foreground">Tap to Scan QR</p>
              </CardContent>
            </Card>

            <QrScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleQrScan} />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Pay to Contact</p>
                <Button variant="ghost" size="sm" onClick={() => user && syncContacts(user.id)} disabled={syncing} className="text-xs gap-1">
                  <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
                  Sync Contacts
                </Button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-themed">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))
                ) : (
                  contacts?.map((c) => (
                    <button key={c.id} onClick={() => setSelectedContact(c.id)} className="flex flex-col items-center gap-1.5 min-w-[60px]">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-primary-foreground transition-all ${selectedContact === c.id ? "ring-2 ring-primary ring-offset-2 scale-110" : ""}`}
                        style={{ backgroundColor: c.color }}
                      >
                        {c.avatar}
                      </div>
                      <span className="text-xs text-muted-foreground">{c.name}</span>
                      {(c as any).phone && (
                        <span className="text-[10px] text-muted-foreground/60">{(c as any).phone}</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Amount</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-display font-bold text-muted-foreground">₹</span>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-14 pl-10 text-2xl font-display font-bold rounded-2xl" placeholder="0" />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Select Category <span className="text-destructive">*</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {paymentCategories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === cat.label ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
              {!selectedCategory && amount && selectedContact && (
                <p className="mt-2 text-xs text-destructive">Please select a category to enable payment</p>
              )}
            </div>

            <Button
              onClick={handlePayClick}
              disabled={!canPay}
              className="h-14 w-full rounded-2xl gradient-primary text-lg font-display font-bold shadow-lg transition-all active:scale-95 disabled:opacity-40"
            >
              🔒 Pay {amount ? `₹${parseInt(amount).toLocaleString("en-IN")}` : ""}
            </Button>
            {!canPay && (
              <p className="text-center text-xs text-muted-foreground">
                {!selectedContact ? "Select a contact" : !selectedCategory ? "Select a category" : "Enter amount"} to continue
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }} className="flex h-24 w-24 items-center justify-center rounded-full gradient-success">
              <Check className="h-12 w-12 text-success-foreground" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Paid to</p>
              <p className="font-display text-xl font-bold text-foreground">{contact?.name}</p>
              <p className="mt-2 font-display text-4xl font-bold text-foreground">₹{parseInt(amount).toLocaleString("en-IN")}</p>
            </div>
            <Card className="w-full max-w-xs">
              <CardContent className="space-y-2 p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">To</span><span className="font-medium text-foreground">{contact?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium text-foreground">{selectedCategory || "General"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium text-foreground">Just now</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-primary">Completed ✅</span></div>
              </CardContent>
            </Card>
            <Button onClick={handleDone} className="h-12 w-full max-w-xs rounded-2xl" variant="outline">Done</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <UpiPinDialog
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onVerified={handlePinVerified}
        title="Authorize Payment"
        description={`Enter UPI PIN to pay ₹${amount ? parseInt(amount).toLocaleString("en-IN") : "0"}`}
      />
    </div>
  );
}
