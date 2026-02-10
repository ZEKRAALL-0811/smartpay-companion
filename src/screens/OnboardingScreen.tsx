import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";
import {
  Phone,
  Mail,
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

type Step = "phone" | "otp" | "email" | "card" | "upi_pin" | "app_pin" | "done";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "phone", label: "Phone", icon: Phone },
  { id: "email", label: "Email", icon: Mail },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "upi_pin", label: "UPI PIN", icon: Lock },
  { id: "app_pin", label: "App PIN", icon: Shield },
];

const slideIn = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Phone & OTP
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Email & Password (for Supabase auth)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // UPI PIN
  const [upiPin, setUpiPin] = useState("");
  const [confirmUpiPin, setConfirmUpiPin] = useState("");

  // App PIN
  const [appPin, setAppPin] = useState("");
  const [confirmAppPin, setConfirmAppPin] = useState("");

  const currentStepIndex = STEPS.findIndex(
    (s) => s.id === step || (step === "otp" && s.id === "phone")
  );
  const progressPercent =
    step === "done" ? 100 : ((currentStepIndex + 1) / STEPS.length) * 100;

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  // ─── Step handlers ───

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { mobile },
      });
      if (error) throw error;
      setGeneratedOtp(data.demo_otp);
      toast.success(`OTP sent to +91 ${mobile}`);
      toast.info(`Demo OTP: ${data.demo_otp}`, { duration: 10000 });
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    if (otp !== generatedOtp) {
      toast.error("Invalid OTP. Please try again.");
      return;
    }
    toast.success("Phone verified! ✅");
    setStep("email");
  };

  const handleEmailNext = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      // Create Supabase account here
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name: email.split("@")[0] },
        },
      });
      if (error) throw error;
      setUserId(data.user?.id || null);
      toast.success("Account created! Continue setup...");
      setStep("card");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
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
    setStep("upi_pin");
  };

  const handleUpiPinNext = () => {
    if (upiPin.length !== 6) {
      toast.error("UPI PIN must be 6 digits");
      return;
    }
    if (upiPin !== confirmUpiPin) {
      toast.error("UPI PINs do not match");
      return;
    }
    setStep("app_pin");
  };

  const handleAppPinSubmit = async () => {
    if (appPin.length < 4 || appPin.length > 6) {
      toast.error("App PIN must be 4-6 digits");
      return;
    }
    if (appPin !== confirmAppPin) {
      toast.error("App PINs do not match");
      return;
    }

    setLoading(true);
    try {
      // Get current user from session (signed up at email step)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const digits = cardNumber.replace(/\s/g, "");
      const upiId = `${mobile}@smartpay`;

      // Generate and store device fingerprint for binding
      const fingerprint = await generateDeviceFingerprint();

      const { error } = await supabase.from("bank_accounts").insert({
        user_id: user.id,
        mobile_number: mobile,
        email,
        card_number_last4: digits.slice(-4),
        card_expiry: cardExpiry,
        account_balance: 50000,
        upi_pin_hash: btoa(upiPin),
        app_pin_hash: btoa(appPin),
        upi_id: upiId,
        is_setup_complete: true,
        device_fingerprint: fingerprint,
      });

      if (error) throw error;
      setStep("done");
    } catch (err: any) {
      toast.error(err.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    const map: Record<string, Step> = {
      otp: "phone",
      email: "otp",
      card: "email",
      upi_pin: "card",
      app_pin: "upi_pin",
    };
    if (map[step]) setStep(map[step]);
  };

  const handleDone = () => {
    // Navigate to home — session is already active from signup
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-2xl shadow-lg">
            🏦
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Set Up Your Account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === "done"
              ? "All done!"
              : `Step ${currentStepIndex + 1} of ${STEPS.length}`}
          </p>
        </div>

        {/* Progress bar */}
        {step !== "done" && (
          <div className="mb-6">
            <Progress value={progressPercent} className="h-2" />
            <div className="mt-3 flex justify-between">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                      i <= currentStepIndex
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {i < currentStepIndex ? "✓" : i + 1}
                  </div>
                  <span className="text-[9px] text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Phone ─── */}
          {step === "phone" && (
            <motion.div key="phone" {...slideIn}>
              <Card className="border-0 glow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Mobile Number
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll send an OTP to verify your number
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      +91
                    </span>
                    <Input
                      type="tel"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      className="h-12 pl-12 rounded-xl text-lg"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                  <Button
                    onClick={handleSendOtp}
                    disabled={mobile.length !== 10 || loading}
                    className="h-12 w-full rounded-xl gradient-primary font-display font-bold"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ─── STEP 1b: OTP Verification ─── */}
          {step === "otp" && (
            <motion.div key="otp" {...slideIn}>
              <Card className="border-0 glow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Verify OTP
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to +91 {mobile}
                  </p>
                  <Input
                    type="tel"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="h-12 rounded-xl text-center text-2xl tracking-[0.5em]"
                    placeholder="••••••"
                    maxLength={6}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={goBack}
                      className="h-12 flex-1 rounded-xl"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={otp.length !== 6}
                      className="h-12 flex-1 rounded-xl gradient-primary font-display font-bold"
                    >
                      Verify
                    </Button>
                  </div>
                  <button
                    onClick={handleSendOtp}
                    className="w-full text-center text-xs text-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ─── STEP 2: Email + Password ─── */}
          {step === "email" && (
            <motion.div key="email" {...slideIn}>
              <Card className="border-0 glow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Email & Password
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create your login credentials
                  </p>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl"
                      placeholder="Min 6 characters"
                      minLength={6}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={goBack}
                      className="h-12 flex-1 rounded-xl"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={handleEmailNext}
                      disabled={!email || password.length < 6 || loading}
                      className="h-12 flex-1 rounded-xl gradient-primary font-display font-bold"
                    >
                      {loading ? "Creating..." : "Continue"}
                      {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ─── STEP 3: Debit Card ─── */}
          {step === "card" && (
            <motion.div key="card" {...slideIn}>
              <Card className="border-0 glow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Debit Card Details
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your debit card info to verify your bank account
                  </p>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Card Number
                    </label>
                    <Input
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      className="h-12 rounded-xl font-mono"
                      placeholder="4321 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Expiry
                      </label>
                      <Input
                        value={cardExpiry}
                        onChange={(e) =>
                          setCardExpiry(formatExpiry(e.target.value))
                        }
                        className="h-12 rounded-xl"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        CVV
                      </label>
                      <Input
                        type="password"
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(
                            e.target.value.replace(/\D/g, "").slice(0, 3)
                          )
                        }
                        className="h-12 rounded-xl"
                        placeholder="•••"
                        maxLength={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={goBack}
                      className="h-12 flex-1 rounded-xl"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={handleCardNext}
                      className="h-12 flex-1 rounded-xl gradient-primary font-display font-bold"
                    >
                      Verify <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ─── STEP 4: UPI PIN ─── */}
          {step === "upi_pin" && (
            <motion.div key="upi_pin" {...slideIn}>
              <Card className="border-0 glow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Create UPI PIN
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    6-digit PIN to authorize transactions
                  </p>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      UPI PIN
                    </label>
                    <Input
                      type="password"
                      value={upiPin}
                      onChange={(e) =>
                        setUpiPin(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      className="h-12 rounded-xl text-center text-2xl tracking-[0.5em]"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Confirm UPI PIN
                    </label>
                    <Input
                      type="password"
                      value={confirmUpiPin}
                      onChange={(e) =>
                        setConfirmUpiPin(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      className="h-12 rounded-xl text-center text-2xl tracking-[0.5em]"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={goBack}
                      className="h-12 flex-1 rounded-xl"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={handleUpiPinNext}
                      disabled={upiPin.length !== 6}
                      className="h-12 flex-1 rounded-xl gradient-primary font-display font-bold"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ─── STEP 5: App PIN ─── */}
          {step === "app_pin" && (
            <motion.div key="app_pin" {...slideIn}>
              <Card className="border-0 glow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Create App PIN
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    4-6 digit PIN to unlock the app each time
                  </p>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      App PIN (4-6 digits)
                    </label>
                    <Input
                      type="password"
                      value={appPin}
                      onChange={(e) =>
                        setAppPin(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      className="h-12 rounded-xl text-center text-2xl tracking-[0.5em]"
                      placeholder="••••"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Confirm App PIN
                    </label>
                    <Input
                      type="password"
                      value={confirmAppPin}
                      onChange={(e) =>
                        setConfirmAppPin(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      className="h-12 rounded-xl text-center text-2xl tracking-[0.5em]"
                      placeholder="••••"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={goBack}
                      className="h-12 flex-1 rounded-xl"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={handleAppPinSubmit}
                      disabled={loading || appPin.length < 4}
                      className="h-12 flex-1 rounded-xl gradient-primary font-display font-bold"
                    >
                      {loading ? "Setting up..." : "Complete Setup"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ─── DONE ─── */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
              >
                <CheckCircle className="h-20 w-20 text-primary" />
              </motion.div>
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  You're All Set! 🎉
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your account is ready. Start making payments!
                </p>
                <p className="mt-1 text-xs text-primary font-medium">
                  UPI ID: {mobile}@smartpay
                </p>
              </div>
              <Button
                onClick={handleDone}
                className="h-12 w-full max-w-xs rounded-xl gradient-primary font-display font-bold"
              >
                Go to Home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
