import { getCache, setCache } from "./cache";
import type { Artwork } from "./logic";

const STORAGE_KEY = "favoritos";

export function getFavorites(): Artwork[] {
     const saved = getCache<Artwork[]>(STORAGE_KEY);
     return Array.isArray(saved) ? saved : [];
}

export function toggleFavorite(art: Artwork): void {
     const favorites = getFavorites();
     const exists = favorites.some((a) => a.id === art.id);
     const updated = exists ? favorites.filter((a) => a.id !== art.id) : [...favorites, art];
     setCache(STORAGE_KEY, updated);
}