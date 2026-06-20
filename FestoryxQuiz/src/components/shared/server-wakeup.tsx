"use client";

import { useEffect } from "react";

export function ServerWakeup() {
  useEffect(() => {
    // Silent background ping to warm up or trigger health endpoint of the socket server via proxy
    fetch("/api/socket-health")
      .then((res) => {
        if (res.ok) {
          console.log("⚡ [Socket Health] Connection established successfully.");
        }
      })
      .catch((err) => {
        console.warn("⚠️ [Socket Health] Server ping failed or server is offline:", err.message);
      });
  }, []);

  return null;
}
