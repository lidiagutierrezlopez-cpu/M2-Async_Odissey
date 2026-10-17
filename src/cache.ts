import { readStorage, writeStorage } from "./storage";

interface Entry<T> {
     savedAt: number;
     value: T;
}

export function getCache<T>(key: string, maxAgeMs: number): T | null {
     const entry = readStorage(key) as Entry<T> | null;
     
     if (typeof entry?.savedAt !== "number" || !("value" in entry)) return null;
     if (Date.now() - entry.savedAt > maxAgeMs) return null;
     
     return entry.value;
}

export function setCache<T>(key: string, value: T): void {
     writeStorage(key, { savedAt: Date.now(), value });
}