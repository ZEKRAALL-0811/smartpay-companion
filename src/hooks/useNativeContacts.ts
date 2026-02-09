import { useState, useCallback } from "react";
import { Contacts } from "@capacitor-community/contacts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COLORS = [
  "hsl(245 58% 51%)",
  "hsl(152 60% 42%)",
  "hsl(38 92% 50%)",
  "hsl(0 72% 51%)",
  "hsl(280 60% 55%)",
  "hsl(200 65% 48%)",
  "hsl(330 60% 50%)",
];

export function useNativeContacts() {
  const [syncing, setSyncing] = useState(false);

  const syncContacts = useCallback(async (userId: string) => {
    setSyncing(true);
    try {
      const permission = await Contacts.requestPermissions();
      if (permission.contacts !== "granted") {
        toast.error("Contact permission denied");
        return;
      }

      const result = await Contacts.getContacts({ projection: { name: true } });
      const deviceContacts = result.contacts
        .filter((c) => c.name?.display)
        .slice(0, 50); // limit to 50

      if (deviceContacts.length === 0) {
        toast("No contacts found on device");
        return;
      }

      // Get existing contacts to avoid duplicates
      const { data: existing } = await supabase
        .from("contacts")
        .select("name")
        .eq("user_id", userId);
      const existingNames = new Set(existing?.map((c) => c.name) || []);

      const newContacts = deviceContacts
        .filter((c) => !existingNames.has(c.name!.display!))
        .map((c, i) => ({
          user_id: userId,
          name: c.name!.display!,
          avatar: c.name!.display![0].toUpperCase(),
          color: COLORS[i % COLORS.length],
        }));

      if (newContacts.length === 0) {
        toast("All contacts already synced");
        return;
      }

      const { error } = await supabase.from("contacts").insert(newContacts);
      if (error) throw error;

      toast.success(`Synced ${newContacts.length} contacts`);
    } catch (err: any) {
      // If not running as native app, show helpful message
      if (err?.message?.includes("not implemented") || err?.code === "UNIMPLEMENTED") {
        toast.error("Contact sync requires the native app. Run via Capacitor on your device.");
      } else {
        toast.error("Failed to sync contacts: " + (err?.message || "Unknown error"));
      }
    } finally {
      setSyncing(false);
    }
  }, []);

  return { syncContacts, syncing };
}
