export function getCache<T>(key: string): T | null {
     try {
          const saved = localStorage.getItem(key);
          return saved ? (JSON.parse(saved) as T): null;
     } catch {
          return null;
     }
}

export function setCache<T>(key: string, value: T): void {
     try {
          localStorage.setItem(key, JSON.stringify(value));
     } catch {
          // localStorage lleno o bloqueado
     }
}