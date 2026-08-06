"use client";
import { useEffect } from "react";

export default function FounderFinalStyle() {
  useEffect(() => {
    const id = "lexia-founder-final-style";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "/_next/static/css/founder-final-loader.css";
    document.head.appendChild(link);
    return () => link.remove();
  }, []);
  return null;
}
