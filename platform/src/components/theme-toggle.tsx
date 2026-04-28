"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("karma-ego-theme");
    const initialTheme: Theme = saved === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  function applyTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    localStorage.setItem("karma-ego-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-[#d7c8ae] bg-[#fffdf8] p-1">
      <button
        type="button"
        onClick={() => applyTheme("light")}
        className={`rounded px-2 py-1 text-xs ${
          theme === "light"
            ? "bg-[#b13a2f] text-white"
            : "text-[#6c584d] hover:bg-[#f6ecde]"
        }`}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => applyTheme("dark")}
        className={`rounded px-2 py-1 text-xs ${
          theme === "dark"
            ? "bg-[#b13a2f] text-white"
            : "text-[#6c584d] hover:bg-[#f6ecde]"
        }`}
      >
        Dark
      </button>
    </div>
  );
}
