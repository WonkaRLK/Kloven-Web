"use client";

import { useEffect } from "react";

export default function ThemeToggle() {
  useEffect(() => {
    // Force dark mode always — remove any saved light mode preference
    localStorage.removeItem("kloven-theme");
    document.documentElement.removeAttribute("data-theme");
  }, []);

  return null;
}
