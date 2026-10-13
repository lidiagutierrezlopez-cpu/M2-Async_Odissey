import type { RawArtwork } from "./api";

export interface Artwork{
     id: number;
     title: string;
     artist: string;
     date: string;
     imageUrl: string;
}

export function toArtworks(raw: RawArtwork[]): Artwork[] {
     return raw.filter((a) => a.images?.web?.url)
               .map((a) => ({
                    id: a.id,
                    title: a.title ?? "Sin titulo",
                    artist: a.creators?.[0]?.description ?? "Artista desconocido",
                    date: a.creation_date ?? "Fecha desconocida",
                    imageUrl: a.images?.web?.url ?? "",
               }));
}

export function summary(list: Artwork[]): string {
     const artists = list.reduce((set, acc) => set.add(acc.artist), new Set<string>());
     return `${list.length} obras de ${artists.size} artistas`;
}