import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Mail, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  { q: "How do I reset my UPI PIN?", a: "Go to Security settings and tap 'UPI PIN'. You'll be asked to verify your identity before resetting." },
  { q: "How do I link a new bank account?", a: "Go to Linked Accounts in your profile and tap 'Link another account'." },
  { q: "Are my transactions secure?", a: "Yes. All transactions are encrypted and protected by multi-factor authentication including device binding." },
  { q: "How do budget alerts work?", a: "When your spending in a category exceeds its budget limit, you'll receive an instant notification." },
];

export function HelpSupportSheet({ onBack }: { onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground active:scale-95">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">Help & Support</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="glow-card">
          <CardContent className="flex flex-col items-center gap-2 p-4">
            <MessageCircle className="h-6 w-6 text-primary" />
            <p className="text-xs font-medium text-foreground">Live Chat</p>
          </CardContent>
        </Card>
        <Card className="glow-card">
          <CardContent className="flex flex-col items-center gap-2 p-4">
            <Mail className="h-6 w-6 text-primary" />
            <p className="text-xs font-medium text-foreground">Email Support</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">FAQs</h2>
        <Card className="glow-card">
          <CardContent className="divide-y divide-border p-0">
            {faqs.map((faq, i) => (
              <details key={i} className="group px-4 py-3">
                <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground list-none">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{faq.q}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-2 pl-6 text-xs text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
