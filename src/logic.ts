import type { RawArtwork } from "./api";

export interface Artwork{
     id: number;
     title: string;
     artist: string;
     date: string;
     year: number | null;
     type: string;
     imageUrl: string;
     technique: string;
     department: string;
     description: string | null;
}

export function toArtworks(raw: RawArtwork[]): Artwork[] {
     return raw.filter((a) => a.images?.web?.url)
               .map((a) => ({
                    id: a.id,
                    title: a.title ?? "Sin titulo",
                    artist: a.creators?.[0]?.description ?? "Artista desconocido",
                    date: a.creation_date ?? "Fecha desconocida",
                    year: a.creation_date_earliest ?? null,
                    type: a.type ?? "Otros",
                    imageUrl: a.images?.web?.url ?? "",
                    technique: a.technique ?? "Técnica desconocida",
                    department: a.department ?? "Departamento desconocido",
                    description: toPlainText(a.description || a.wall_description || a.digital_description || a.did_you_know || a.fun_fact || null),
               }));
}

export function summary(list: Artwork[]): string {
     const artists = list.reduce((set, acc) => set.add(acc.artist), new Set<string>());
     return `${list.length} obras de ${artists.size} artistas`;
}

export function getTypes(list: Artwork[]): string[] {
     return [...new Set(list.map((a) => a.type))].toSorted();
}

export function filterByType(list: Artwork[], type: string): Artwork[] {
     return type === "all" ? list: list.filter((a) => a.type === type);
}

export function sortArtworks(list: Artwork[], order: string): Artwork[] {
     if (order === "title"){
          return list.toSorted((a,b) => a.title.localeCompare(b.title, "es"));
     }
     if (order === "date"){
          return list.toSorted((a,b) => (a.year ?? Infinity) - (b.year ?? Infinity))
     }
     return list;
}

function toPlainText(html: string | null): string | null {
     if (!html) return null;
     const withBreaks = html.replace(/<br\s*\/?>/gi, "\n");
     const doc = new DOMParser().parseFromString(withBreaks, "text/html");
     const text = doc.body.textContent?.trim() ?? "";
     return text || null;
}