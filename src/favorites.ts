import { readStorage, writeStorage } from "./storage";
import type { Artwork } from "./logic";

const STORAGE_KEY = "favoritos";
const TEXT_FIELDS = ["title", "artist", "date", "type", "technique", "department", "imageUrl"];

function isArtwork(value: unknown): value is Artwork{
     if(typeof value !== "object" || value === null) return false;
     const a = value as Record<string, unknown>;
     return typeof a.id === "number" && TEXT_FIELDS.every((field) => typeof a[field] === "string");
}

export function getFavorites(): Artwork[] {
     const saved = readStorage(STORAGE_KEY);
     return Array.isArray(saved) ? saved.filter(isArtwork) : [];
}

export function toggleFavorite(art: Artwork): void {
     const favorites = getFavorites();
     const exists = favorites.some((a) => a.id === art.id);
     const updated = exists ? favorites.filter((a) => a.id !== art.id) : [...favorites, art];
     writeStorage(STORAGE_KEY, updated);
}