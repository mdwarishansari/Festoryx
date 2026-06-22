"use client";

import { useEffect } from "react";

export function ServerWakeup() {
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;
    const intervalMs = 3000;
    let timerId: NodeJS.Timeout;

    const pingServer = () => {
      attempts++;
      fetch("/api/socket-health")
        .then((res) => {
          if (res.ok) {
            console.log(`⚡ [Socket Health] Connection established successfully on attempt ${attempts}.`);
          } else {
            console.warn(`⚠️ [Socket Health] Server returned status ${res.status} on attempt ${attempts}.`);
            scheduleRetry();
          }
        })
        .catch((err) => {
          console.warn(`⚠️ [Socket Health] Server ping failed on attempt ${attempts}:`, err.message);
          scheduleRetry();
        });
    };

    const scheduleRetry = () => {
      if (attempts < maxAttempts) {
        timerId = setTimeout(pingServer, intervalMs);
      }
    };

    pingServer();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  return null;
}
