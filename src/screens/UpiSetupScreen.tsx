import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Phone, CreditCard, Lock, CheckCircle, ArrowRight } from "lucide-react";

type Step = "mobile" | "card" | "pin" | "done";

export function UpiSetupScreen({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleMobileNext = () => {
    if (mobile.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setStep("card");
  };

  const handleCardNext = () => {
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length !== 16) {
      toast.error("Enter a valid 16-digit card number");
      return;
    }
    if (cardExpiry.length !== 5) {
      toast.error("Enter a valid expiry (MM/YY)");
      return;
    }
    if (cardCvv.length !== 3) {
      toast.error("Enter a valid 3-digit CVV");
      return;
    }
    setStep("pin");
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 6) {
      toast.error("UPI PIN must be 6 digits");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const digits = cardNumber.replace(/\s/g, "");
      const upiId = `${mobile}@smartpay`;

      const { error } = await supabase.from("bank_accounts").insert({
        user_id: user.id,
        mobile_number: mobile,
        card_number_last4: digits.slice(-4),
        card_expiry: cardExpiry,
        account_balance: 50000,
        upi_pin_hash: btoa(pin), // Simple encoding for demo (not production-grade)
        upi_id: upiId,
        is_setup_complete: true,
      });

      if (error) throw error;
      setStep("done");
    } catch (err: any) {
      toast.error(err.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: "mobile", label: "Mobile", icon: Phone },
    { id: "card", label: "Card", icon: CreditCard },
    { id: "pin", label: "UPI PIN", icon: Lock },
  ];

  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-3xl shadow-lg">
            🏦
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Set Up UPI</h1>
          <p className="mt-1 text-sm text-muted-foreground">Link your bank account to start paying</p>
        </div>

        {/* Progress */}
        {step !== "done" && (
          <div className="mb-6 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i <= currentIndex ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {i < currentIndex ? "✓" : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-8 rounded transition-all ${i < currentIndex ? "bg-primary" : "bg-secondary"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "mobile" && (
            <motion.div key="mobile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-0 glow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">Mobile Number</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Enter your registered mobile number</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">+91</span>
                    <Input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="h-12 pl-12 rounded-xl text-lg"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                  <Button onClick={handleMobileNext} disabled={mobile.length !== 10} className="h-12 w-full rounded-xl gradient-primary font-display font-bold">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "card" && (
            <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-0 glow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">Debit Card Details</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Enter your debit card info to verify your account</p>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Card Number</label>
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="h-12 rounded-xl font-mono"
                      placeholder="4321 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Expiry</label>
                      <Input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        className="h-12 rounded-xl"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">CVV</label>
                      <Input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        className="h-12 rounded-xl"
                        placeholder="•••"
                        maxLength={3}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCardNext} className="h-12 w-full rounded-xl gradient-primary font-display font-bold">
                    Verify Card <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "pin" && (
            <motion.div key="pin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-0 glow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">Create UPI PIN</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Create a 6-digit PIN to authorize transactions</p>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">UPI PIN</label>
                    <Input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-12 rounded-xl text-center text-2xl tracking-[0.5em]"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Confirm UPI PIN</label>
                    <Input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-12 rounded-xl text-center text-2xl tracking-[0.5em]"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={handlePinSubmit} disabled={loading || pin.length !== 6} className="h-12 w-full rounded-xl gradient-primary font-display font-bold">
                    {loading ? "Setting up..." : "Set UPI PIN"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}>
                <CheckCircle className="h-20 w-20 text-primary" />
              </motion.div>
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold text-foreground">You're All Set! 🎉</h2>
                <p className="mt-2 text-sm text-muted-foreground">Your UPI account is ready. Start making payments!</p>
                <p className="mt-1 text-xs text-primary font-medium">UPI ID: {mobile}@smartpay</p>
              </div>
              <Button onClick={onComplete} className="h-12 w-full max-w-xs rounded-xl gradient-primary font-display font-bold">
                Go to Home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
