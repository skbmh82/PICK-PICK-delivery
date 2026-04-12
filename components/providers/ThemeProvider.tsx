"use client";

import { useEffect } from "react";

/* 첫 렌더 전에 dark 클래스를 적용해 깜빡임(flash) 방지 */
const ANTI_FLASH_SCRIPT = `
(function(){
  try {
    var s = localStorage.getItem('pick-theme');
    var p = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var t = s || p;
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: ANTI_FLASH_SCRIPT }}
      suppressHydrationWarning
    />
  );
}

/* 앱 마운트 후 테마 동기화 (SSR 불일치 해결) */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("pick-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const theme = saved ?? preferred;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return <>{children}</>;
}
