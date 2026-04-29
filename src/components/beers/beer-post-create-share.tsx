"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Beer } from "@/types/beer";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BeerPostCreateShareProps = {
  beer: Pick<Beer, "_id" | "name">;
  sharePath: string;
  onCreateAnother?: () => void;
  className?: string;
};

export default function BeerPostCreateShare({
  beer,
  sharePath,
  onCreateAnother,
  className,
}: BeerPostCreateShareProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "error">(
    "idle"
  );

  useEffect(() => {
    if (!sharePath) {
      setShareUrl("");
      return;
    }

    setShareUrl(new URL(sharePath, window.location.origin).toString());
  }, [sharePath]);

  const canShare = useMemo(() => {
    return typeof navigator !== "undefined" && typeof navigator.share === "function";
  }, []);

  const copyLink = async () => {
    if (!shareUrl || !navigator?.clipboard?.writeText) {
      setStatus("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  const shareLink = async () => {
    if (!shareUrl || typeof navigator === "undefined" || !navigator.share) {
      return copyLink();
    }

    try {
      await navigator.share({
        title: beer.name,
        text: `Check out ${beer.name}`,
        url: shareUrl,
      });
      setStatus("shared");
    } catch {
      // The user may cancel the share sheet. Keep the UI quiet in that case.
    }
  };

  if (!sharePath) {
    return null;
  }

  return (
    <Card className={cn("border-dashed bg-muted/30", className)}>
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="h-4 w-4" />
          Beer created
        </CardTitle>
        <CardDescription>
          Share <span className="font-medium text-foreground">{beer.name}</span>
          with your team or open the detail page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={copyLink}>
            {status === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {status === "copied" ? "Copied" : "Copy link"}
          </Button>
          {canShare && (
            <Button type="button" variant="secondary" onClick={shareLink}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
          <Button asChild type="button" variant="default">
            <Link href={sharePath}>
              <ExternalLink className="h-4 w-4" />
              View beer
            </Link>
          </Button>
          {onCreateAnother && (
            <Button type="button" variant="ghost" onClick={onCreateAnother}>
              Create another
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {status === "copied" && "Beer link copied to your clipboard."}
          {status === "shared" && "Share sheet opened successfully."}
          {status === "error" &&
            "Unable to copy the link. Use View beer to open the beer page."}
          {status === "idle" && shareUrl}
        </p>
      </CardContent>
    </Card>
  );
}
