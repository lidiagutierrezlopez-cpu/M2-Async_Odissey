import { getCache, setCache } from "./cache";

export interface RawArtwork{
     id: number;
     title: string | null;
     creation_date: string | null;
     creation_date_earliest: number | null;
     type: string | null;
     creators: { description: string | null}[] | null;
     images: { web?: { url: string } } | null;
     technique: string | null;
     department: string | null;
     wall_description: string | null;
}

const BASE_URL = "https://openaccess-api.clevelandart.org/api/artworks/";

export async function searchArtworks(query: string): Promise<RawArtwork[]> {
     const cacheKey = `busqueda:${query.toLowerCase()}`;
     const cached = getCache<RawArtwork[]>(cacheKey);
     if (cached) return cached;

     const params = new URLSearchParams({q: query, has_image: "1", limit: "20"});
     const response = await fetch(`${BASE_URL}?${params}`);
     if (!response.ok) throw new Error(`Error del servidor (HTTP ${response.status})`);

     const json = await response.json();
     const data: RawArtwork[] = Array.isArray(json.data) ? json.data : [];
     
     setCache(cacheKey, data);
     return Array.isArray(json.data) ? json.data : [];
}