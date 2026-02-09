import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface QrScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function QrScanner({ open, onClose, onScan }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          scanner.stop().catch(() => {});
          onClose();
        },
        () => {} // ignore scan failures
      )
      .catch((err) => {
        setError("Could not access camera. Please allow camera permissions.");
        console.error("QR scanner error:", err);
      });

    return () => {
      scanner.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, [open, onScan, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Scan QR Code
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
