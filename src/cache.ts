interface Entry<T> {
     savedAt: number;
     value: T;
}

export function getCache<T>(key: string, maxAgeMs = Infinity): T | null {
     try {
          const saved = localStorage.getItem(key);
          if (!saved) return null;

          const entry = JSON.parse(saved) as Entry<T>;
          if (typeof entry?.savedAt !== "number" || !("value" in entry)) return null;
          if (Date.now() - entry.savedAt > maxAgeMs) return null;

          return entry.value;
     } catch {
          return null;
     }
}

export function setCache<T>(key: string, value: T): void {
     try {
          const entry: Entry<T> = { savedAt: Date.now(), value };
          localStorage.setItem(key, JSON.stringify(entry));
     } catch {
          // localStorage lleno o bloqueado
     }
}