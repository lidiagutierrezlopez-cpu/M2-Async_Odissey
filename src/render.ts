import type { Artwork } from "./logic";

const gallery = document.querySelector<HTMLDivElement>("#gallery")!;
const info = document.querySelector<HTMLParagraphElement>("#info")!;
const typeSelect = document.querySelector<HTMLSelectElement>("#type")!;

export function fillTypeOptions(types: string[]): void {
     const options = ["all", ...types].map((type) => {
          const option = document.createElement("option");
          option.value = type;
          option.textContent = type === "all" ? "Todos" : type;
          return option;
     });
     typeSelect.replaceChildren(...options);
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
     const img = createImage(art.imageUrl, art.title);
     const title = document.createElement("h3");
     const meta = document.createElement("p");
     
     img.loading = "lazy";
     title.textContent = art.title;
     meta.textContent = `${art.artist} · ${art.date}`;

     card.append(img, title, meta);
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

const modal = document.querySelector<HTMLDialogElement>("#modal")!;

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