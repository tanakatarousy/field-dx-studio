"use client";

import { useEffect } from "react";
import { getOrCreateVisitorId } from "@/lib/visitor-id";

function deviceType(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function browserName(): "edge" | "chrome" | "safari" | "firefox" | "other" {
  const userAgent = navigator.userAgent;
  if (/Edg\//.test(userAgent)) return "edge";
  if (/Firefox\//.test(userAgent)) return "firefox";
  if (/Chrome\//.test(userAgent)) return "chrome";
  if (/Safari\//.test(userAgent)) return "safari";
  return "other";
}

export function AnalyticsTracker() {
  useEffect(() => {
    const globalPrivacyControl = (
      navigator as Navigator & { globalPrivacyControl?: boolean }
    ).globalPrivacyControl;
    if (globalPrivacyControl === true) return;

    const visitorId = getOrCreateVisitorId();
    const query = new URLSearchParams(window.location.search);
    const basePayload = {
      visitorId,
      referrer: document.referrer,
      utmSource: query.get("utm_source") ?? "",
      utmMedium: query.get("utm_medium") ?? "",
      utmCampaign: query.get("utm_campaign") ?? "",
      device: deviceType(),
      browser: browserName(),
    };

    function record(path: string) {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, path }),
        keepalive: true,
      }).catch(() => undefined);
    }

    record(window.location.pathname);

    return undefined;
  }, []);

  return null;
}
