import { getCache, setCache } from "./cache";

const STORAGE_KEY = "dark-mode";

export function initTheme(button: HTMLButtonElement): void {
     const saved = getCache<unknown>(STORAGE_KEY);
     applyTheme(button, typeof saved === "boolean" ? saved : false);

     button.addEventListener("click", () => {
          const dark = !document.documentElement.classList.contains("dark");
          applyTheme(button, dark);
          setCache(STORAGE_KEY, dark);
     })
}

function applyTheme(button: HTMLButtonElement, dark: boolean): void {
     document.documentElement.classList.toggle("dark", dark);
     button.textContent = dark ? "🌙" : "☀️";
     button.setAttribute("aria-label", dark ? "Activar modo claro" : "Activar modo oscuro");
}