import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDownLeft, Send } from "lucide-react";

interface RequestMoneyDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RequestMoneyDialog({ open, onClose }: RequestMoneyDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("name").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const handleRequest = async () => {
    if (!amount || !upiId || !user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("money_requests").insert({
        requester_id: user.id,
        requester_name: profile?.name || user.email?.split("@")[0] || "User",
        requested_from: upiId,
        amount: parseInt(amount),
        note: note || null,
      });
      if (error) throw error;
      toast.success(`Request for ₹${parseInt(amount).toLocaleString("en-IN")} sent!`);
      queryClient.invalidateQueries({ queryKey: ["money-requests"] });
      setUpiId("");
      setAmount("");
      setNote("");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl border-0 bg-card">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ArrowDownLeft className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-display">Request Money</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">UPI ID / Mobile</label>
            <Input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="h-12 rounded-xl"
              placeholder="name@upi or 9876543210"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-display font-bold text-muted-foreground">₹</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 pl-10 text-2xl font-display font-bold rounded-xl"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Note (optional)</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-12 rounded-xl"
              placeholder="Dinner split, rent, etc."
            />
          </div>
          <Button
            onClick={handleRequest}
            disabled={loading || !amount || !upiId}
            className="h-12 w-full rounded-xl gradient-primary font-display font-bold"
          >
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
