"use client";

import { healthResponseSchema } from "@repairflow/contracts";
import { useEffect, useState } from "react";

async function fetchApiStatus(): Promise<string> {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) return "unavailable";
    return healthResponseSchema.parse(await response.json()).status;
  } catch {
    return "unavailable";
  }
}

export function ApiStatus() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    void fetchApiStatus().then(setStatus);
  }, []);

  return <p role="status">API: {status}</p>;
}
