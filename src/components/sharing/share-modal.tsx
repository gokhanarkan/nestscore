import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  type ShareData,
  generateShareUrl,
  encodeShareData,
  isDataTooLargeForQR,
} from "@/lib/sharing";
import { Link2, QrCode, Copy, Check, Download, AlertTriangle, ExternalLink } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareData: ShareData | null;
  title: string;
  description: string;
}

export function ShareModal({
  open,
  onOpenChange,
  shareData,
  title,
  description,
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"link" | "qr">("link");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!shareData) return null;

  const shareUrl = generateShareUrl(shareData);
  const encoded = encodeShareData(shareData);
  const isTooLarge = isDataTooLargeForQR(encoded);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);

      const link = document.createElement("a");
      link.download = `nestscore-${shareData.type}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={activeTab === "link" ? "default" : "outline"}
              onClick={() => setActiveTab("link")}
              className="gap-2"
            >
              <Link2 className="h-4 w-4" />
              Link
            </Button>
            <Button
              type="button"
              variant={activeTab === "qr" ? "default" : "outline"}
              onClick={() => setActiveTab("qr")}
              className="gap-2"
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </div>

          {/* Link Content */}
          {activeTab === "link" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <p className="break-all text-sm font-mono">{shareUrl}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => window.open(shareUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Link
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can import the{" "}
                {shareData.type === "settings"
                  ? "category weights"
                  : shareData.type === "property"
                    ? "property"
                    : "properties"}{" "}
                into their NestScore.
              </p>
            </div>
          )}

          {/* QR Code Content */}
          {activeTab === "qr" && (
            <div className="space-y-4">
              {isTooLarge ? (
                <div className="flex flex-col items-center rounded-lg bg-amber-500/10 p-6 text-center">
                  <AlertTriangle className="mb-2 h-8 w-8 text-amber-500" />
                  <p className="font-medium">Data too large for QR code</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The shared data is too large to fit in a QR code. Please use
                    the link instead.
                  </p>
                </div>
              ) : (
                <>
                  <div
                    ref={qrRef}
                    className="mx-auto flex items-center justify-center rounded-xl bg-white p-4"
                  >
                    <QRCodeSVG
                      value={shareUrl}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleDownloadQR}
                  >
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Size Info */}
          <p className="text-center text-xs text-muted-foreground">
            Share data size: {(encoded.length / 1024).toFixed(1)} KB
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
