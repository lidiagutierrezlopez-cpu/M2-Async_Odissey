import { getCache, setCache } from "./cache";

// CONFIGURACIÓN
const BASE_URL = "https://openaccess-api.clevelandart.org/api/artworks/";
export const PAGE_SIZE = 20;



// DATOS QUE DEVUELVE LA API
export interface RawArtwork{
     id: number;
     title: string | null;
     type: string | null;
     creators: { description: string | null}[] | null;
     creation_date: string | null;
     creation_date_earliest: number | null;
     technique: string | null;
     department: string | null;
     images: { web?: { url: string } } | null;
     
     wall_description: string | null;
     digital_description: string | null;
     fun_fact: string | null;
     description: string | null;
     did_you_know: string | null;
}



// PETICIÓN
export async function searchArtworks(query: string, skip: number): Promise<RawArtwork[]> {
     const cacheKey = `busqueda:${query.toLowerCase()}:${skip}`;
     const cached = getCache<RawArtwork[]>(cacheKey);
     if (cached) return cached;

     const params = new URLSearchParams({q: query, has_image: "1", limit: String(PAGE_SIZE), skip: String(skip)});
     
     const response = await fetch(`${BASE_URL}?${params}`);
     if (!response.ok) throw new Error(`Error del servidor (HTTP ${response.status})`);

     const json = await response.json();
     const data: RawArtwork[] = Array.isArray(json.data) ? json.data : [];
     
     setCache(cacheKey, data);
     return data;
}