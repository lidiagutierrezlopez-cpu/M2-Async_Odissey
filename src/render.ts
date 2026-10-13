import type { Artwork } from "./logic";

const gallery = document.querySelector<HTMLDivElement>("#gallery")!;
const info = document.querySelector<HTMLParagraphElement>("#info")!;

export function showLoading(): void {
     info.textContent = "Cargando obras...";
     gallery.replaceChildren();
}

export function showError(message: string): void {
     info.textContent = `ERROR: ${message}`
     gallery.replaceChildren();
}

export function showArtworks(list: Artwork[], text: string): void {
     if (list.length === 0){
          info.textContent = "No hay obras para esta búsqueda.";
          gallery.replaceChildren();
          return;
     }
     info.textContent = text;
     gallery.replaceChildren(...list.map(createCard));
}

function createCard(art: Artwork): HTMLElement {
     const card = document.createElement("article");
     const img = document.createElement("img");
     const title = document.createElement("h3");
     const meta = document.createElement("p");

     img.src = art.imageUrl;
     img.alt = art.title;
     img.loading = "lazy";
     img.referrerPolicy = "no-referrer";
     title.textContent = art.title;
     meta.textContent = `${art.artist} · ${art.date}`;

     card.append(img, title, meta);
     return card;
}
