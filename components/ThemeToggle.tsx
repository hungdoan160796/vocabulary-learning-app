"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      className="rounded-md border px-4 py-2 m-4 absolute top-0 right-0"
    >
      Toggle Theme
    </button>
  );
}