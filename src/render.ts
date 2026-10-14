import type { Artwork } from "./logic";

const gallery = document.querySelector<HTMLDivElement>("#gallery")!;
const info = document.querySelector<HTMLParagraphElement>("#info")!;
const typeSelect = document.querySelector<HTMLSelectElement>("#type")!;
const moreButton = document.querySelector<HTMLButtonElement>("#more")!;
const modal = document.querySelector<HTMLDialogElement>("#modal")!;
const roomsNav = document.querySelector<HTMLElement>("#rooms");

export interface Room {
     label: string;
     query: string;
}

export function fillTypeOptions(types: string[]): void {
     const selected = typeSelect.value;
     const options = ["all", ...types].map((type) => {
          const option = document.createElement("option");
          option.value = type;
          option.textContent = type === "all" ? "Todos" : type;
          return option;
     });
     typeSelect.replaceChildren(...options);
     if (types.includes(selected)) typeSelect.value = selected;
}

export function showLoading(): void {
     info.textContent = "Cargando obras...";
     gallery.replaceChildren();
}

export function showError(message: string, onRetry: () => void): void {
     info.textContent = `⚠️ ${message}`;

     const button = document.createElement("button");
     button.textContent = "Reintentar";
     button.addEventListener("click", onRetry);
     info.append(button)

     gallery.replaceChildren();
}

export function showWarning(message: string): void{
     info.textContent = message;
}

export function showArtworks(list: Artwork[], text: string, favoriteIds: Set<number>, onToggleFavorite: (art: Artwork) => void, emptyText = "Ho hay obras para esta búsqueda."): void {
     if (list.length === 0){
          info.textContent = emptyText;
          gallery.replaceChildren();
          return;
     }
     info.textContent = text;
     gallery.replaceChildren(...list.map((art) => createCard(art, favoriteIds.has(art.id), onToggleFavorite)));
}

function createCard(art: Artwork, isFavorite: boolean, onToggleFavorite: (art: Artwork) => void): HTMLElement {
     const card = document.createElement("article");
     const img = createImage(art.imageUrl, art.title);
     const title = document.createElement("h3");
     const meta = document.createElement("p");
     const heart = document.createElement("button");

     img.loading = "lazy";
     title.textContent = art.title;
     meta.textContent = `${art.artist} · ${art.date}`;
     
     heart.type = "button";
     heart.className = "heart";
     heart.textContent = isFavorite ? "❤️" : "🤍";
     heart.setAttribute("aria-label", isFavorite ? "Quitar de favoritos" : "Añadir a favoritos");
     heart.addEventListener("click", (evento) => {
          evento.stopPropagation();
          onToggleFavorite(art);
     })

     card.append(heart, img, title, meta);
     card.addEventListener("click", () => openModal(art));

     return card;
}

function createImage(url: string, alt: string): HTMLImageElement {
     const img = document.createElement("img");
     img.src = url;
     img.alt = alt;
     img.addEventListener(
          "error",
          () => {
               const fallback = document.createElement("div");
               fallback.className = "img-fallback";
               fallback.textContent = "Imagen no disponible";
               img.replaceWith(fallback);
          },
          { once: true },
     );
     return img;
}

export function renderRooms(rooms: Room[], activeQuery: string, onPick: (query: string) => void): void {
     const buttons = rooms.map((room) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "room";
          button.textContent = room.label;
          button.setAttribute("aria-pressed", String(room.query === activeQuery.toLowerCase()));
          button.addEventListener("click", () => onPick(room.query));
          return button;
     });
     roomsNav?.replaceChildren(...buttons);
}

modal.addEventListener("click", (evento) => {
     if (evento.target === modal) modal.close();
})

function openModal(art: Artwork): void {
     const content = document.createElement("div");
     content.className = "modal-content";

     const title = document.createElement("h2");
     title.textContent = art.title;

     const meta = document.createElement("p");
     meta.textContent = `${art.artist} · ${art.date}`;

     const details = document.createElement("p");
     details.textContent = `${art.type} · ${art.technique} · ${art.department}`;

     const description = document.createElement("p");
     description.className = "description";
     description.textContent = art.description ?? "Esta obra no tiene descripción.";

     const close = document.createElement("button");
     close.textContent = "Cerrar";
     close.addEventListener("click", () => modal.close());

     content.append(createImage(art.imageUrl, art.title), title, meta, details, description, close);
     modal.replaceChildren(content);
     modal.showModal();
}

export function setMoreButton(state: "hidden" | "ready" | "loading"): void {
     moreButton.hidden = state === "hidden";
     moreButton.disabled = state === "loading";
     moreButton.textContent = state === "loading" ? "Cargando..." : "Cargar más";
}