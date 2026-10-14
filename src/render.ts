import type { Artwork } from "./logic";
import { getElement } from "./dom";

// TIPOS
export interface Room {
     label: string;
     query: string;
}

type OnToggleFavorite = (art: Artwork) => void;



// ELEMENTOS DE LA PÁGINA
const info = getElement<HTMLParagraphElement>("#info");
const gallery = getElement<HTMLDivElement>("#gallery");
const typeSelect = getElement<HTMLSelectElement>("#type");
const roomsNav = getElement<HTMLElement>("#rooms");
const moreButton = getElement<HTMLButtonElement>("#more");
const modal = getElement<HTMLDialogElement>("#modal");



// ESTADOS DE CARGAR, ERROR Y AVISO
export function showLoading(): void {
     info.textContent = "Cargando obras...";
     gallery.replaceChildren();
}

export function showError(message: string, onRetry: () => void): void {
     const retry = create("button", "Reintentar");
     retry.type = "button";
     retry.addEventListener("click", onRetry);
     
     info.textContent = `⚠️ ${message}`;
     info.append(retry)
     gallery.replaceChildren();
}

export function showWarning(message: string): void{
     info.textContent = message;
}



// GALERÍA
export function showArtworks(
     list: Artwork[],
     text: string,
     favoriteIds: Set<number>,
     onToggleFavorite: OnToggleFavorite,
     emptyText = "No hay obras para esta búsqueda.",
): void {
     if (list.length === 0){
          info.textContent = emptyText;
          gallery.replaceChildren();
          return;
     }
     info.textContent = text;
     gallery.replaceChildren(...list.map((art) => createCard(art, favoriteIds.has(art.id), onToggleFavorite)));
}

function createCard(art: Artwork, isFavorite: boolean, onToggleFavorite: OnToggleFavorite): HTMLElement {
     const img = createImage(art.imageUrl, art.title);
     img.loading = "lazy";

     const heart = create("button", isFavorite ? "❤️" : "🤍", "heart");
     heart.type = "button";
     heart.setAttribute("aria-label", isFavorite ? "Quitar de favoritos" : "Añadir a favoritos");
     heart.addEventListener("click", (evento) => {
          evento.stopPropagation();
          onToggleFavorite(art);
     });

     const card = create("article");
     card.append(heart, img, create("h3", art.title), create("p", `${art.artist} · ${art.date}`));
     card.addEventListener("click", () => openModal(art));
     return card;
}

function createImage(url: string, alt: string): HTMLImageElement {
     const img = create("img");
     img.src = url;
     img.alt = alt;
     img.addEventListener("error", () => {
          img.replaceWith(create("div", "Imagen no disponible", "img-fallback"));
     }, { once: true });
     return img;
}



// FICHA DE LA OBRA
modal.addEventListener("click", (evento) => {
     if (evento.target === modal) modal.close();
})

function openModal(art: Artwork): void {
     const close = create("button", "Cerrar");
     close.type = "button";
     close.addEventListener("click", () => modal.close());

     const content = create("div", "", "modal-content");
     content.append(
          createImage(art.imageUrl, art.title),
          create("h2", art.title),
          create("p", `${art.artist} · ${art.date}`),
          create("p", `${art.type} · ${art.technique} · ${art.department}`),
          create("p", art.description ?? "Esta obra no tiene descripción.", "description"),
          close,
     );

     modal.replaceChildren(content);
     modal.showModal();
}



// CONTROLES
export function renderRooms(rooms: Room[], activeQuery: string, onPick: (query: string) => void): void {
     const buttons = rooms.map((room) => {
          const button = create("button", room.label, "room");
          button.type = "button";
          button.setAttribute("aria-pressed", String(room.query === activeQuery.toLowerCase()));
          button.addEventListener("click", () => onPick(room.query));
          return button;
     });
     roomsNav.replaceChildren(...buttons);
}

export function fillTypeOptions(types: string[]): void {
     const selected = typeSelect.value;
     const options = ["all", ...types].map((type) => {
          const option = create("option", type === "all" ? "Todos" : type);
          option.value = type;
          return option;
     });
     typeSelect.replaceChildren(...options);
     if (types.includes(selected)) typeSelect.value = selected;
}

export function setMoreButton(state: "hidden" | "ready" | "loading"): void {
     moreButton.hidden = state === "hidden";
     moreButton.disabled = state === "loading";
     moreButton.textContent = state === "loading" ? "Cargando..." : "Cargar más";
}



// UTILIDADES
function create<K extends keyof HTMLElementTagNameMap>(tag: K, text = "", className = ""): HTMLElementTagNameMap[K] {
     const element = document.createElement(tag);
     if (text) element.textContent = text;
     if (className) element.className = className;
     return element;
}