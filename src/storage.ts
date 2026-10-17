export function readStorage(key: string): unknown {
     try {
          const saved = localStorage.getItem(key);
          return saved === null ? null : JSON.parse(saved);
     } catch {
          return null;
     }
}

export function writeStorage(key: string, value: unknown): void {
     try {
          localStorage.setItem(key, JSON.stringify(value));
     } catch {
          // localStorage lleno o bloqueado
     }
}