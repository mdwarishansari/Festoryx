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
      
      // Ping route handler (proxied)
      fetch("/api/socket-health")
        .then((res) => {
          if (res.ok) {
            console.log(`⚡ [Socket Health] Proxied connection established on attempt ${attempts}.`);
          }
        })
        .catch(() => {});

      // Ping direct socket endpoint (bypasses serverless functions)
      const directUrl = (window as any).__SOCKET_URL__ || "https://festoryx-socket.onrender.com";
      fetch(`${directUrl}/health`, { mode: "cors" })
        .then((res) => {
          if (res.ok) {
            console.log(`⚡ [Socket Health] Direct connection established on attempt ${attempts}.`);
          } else {
            scheduleRetry();
          }
        })
        .catch((err) => {
          console.warn(`⚠️ [Socket Health] Direct ping failed on attempt ${attempts}:`, err.message);
          scheduleRetry();
        });
    };

    const scheduleRetry = () => {
      if (attempts < maxAttempts) {
        console.log(`🔄 [Socket Health] Retrying wakeup in ${intervalMs / 1000}s (Attempt ${attempts + 1}/${maxAttempts})...`);
        timerId = setTimeout(pingServer, intervalMs);
      } else {
        console.error(`❌ [Socket Health] Max wakeup attempts (${maxAttempts}) reached. Server may be offline.`);
      }
    };

    pingServer();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  return null;
}
