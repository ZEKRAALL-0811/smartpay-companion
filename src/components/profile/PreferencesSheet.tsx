import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Palette, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function PreferencesSheet({ onBack }: { onBack: () => void }) {
  const [lang, setLang] = useState("English");
  const [currency, setCurrency] = useState("INR (₹)");

  const languages = ["English", "Hindi", "Tamil", "Telugu", "Kannada"];
  const currencies = ["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)"];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground active:scale-95">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">Preferences</h1>
      </div>

      <Card className="glow-card">
        <CardContent className="space-y-4 p-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Language</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); toast.success(`Language set to ${l}`); }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${l === lang ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Currency</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {currencies.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCurrency(c); toast.success(`Currency set to ${c}`); }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${c === currency ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Theme</p>
            </div>
            <div className="flex gap-2">
              <button className="gradient-primary rounded-xl px-3 py-1.5 text-xs font-medium text-primary-foreground">Dark</button>
              <button className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">Light</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
