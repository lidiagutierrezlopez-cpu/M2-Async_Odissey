import "./style.css";
import { searchArtworks, PAGE_SIZE } from "./api";
import type { SearchResult } from "./api";
import { toArtworks, summary, getTypes, filterByType, sortArtworks } from "./logic";
import type { Artwork } from "./logic";
import { showLoading, showError, showWarning, showArtworks, fillTypeOptions, setMoreButton, renderRooms } from "./render";
import type { Room } from "./render";
import { getFavorites, toggleFavorite } from "./favorites";
import { renderCollage, saveCollage } from "./collage";
import { getElement } from "./dom";
import { initRender } from "./render";
import { initTheme } from "./theme";

// CONFIGURACIÓN
const DEFAULT_QUERY = "monet";

const ROOMS: Room[] = [
     { label: "Monet", query: "monet"},
     { label: "Impresionismo", query: "impressionism" },
     { label: "Paisajes", query: "landscape" },
     { label: "Retratos", query: "portrait" },
     { label: "Japón", query: "japan" },
     { label: "Egipto", query: "egypt" },
];



// ELEMENTOS DE LA PÁGINA
const form = getElement<HTMLFormElement>("#form");
const input = getElement<HTMLInputElement>("#input");
const sortSelect = getElement<HTMLSelectElement>("#sort");
const typeSelect = getElement<HTMLSelectElement>("#type");
const moreButton = getElement<HTMLButtonElement>("#more");
const collectionButton = getElement<HTMLButtonElement>("#collection");
const collageDialog = getElement<HTMLDialogElement>("#collage");
const openCollageButton = getElement<HTMLButtonElement>("#open-collage");
const closeCollageButton = getElement<HTMLButtonElement>("#close-collage");



// ESTADO DE LA APP
let currentQuery = "";
let currentArtworks: Artwork[] = [];
let nextSkip = 0;
let viewingCollection = false;
let controller = new AbortController();
let fromCache = false;



// PINTAR
function update(): void {
     const filtered = filterByType(currentArtworks, typeSelect.value);
     const sorted = sortArtworks(filtered, sortSelect.value);
     const favoriteIds = new Set(getFavorites().map((a) => a.id));
     const emptyText = viewingCollection ? "Tu colección está vacía. Pulsa 🤍 en una obra para guardarla." : "No hay obras para esta búsqueda.";
     const text = summary(sorted) + (fromCache && !viewingCollection ? " · desde caché": "");
     showArtworks(sorted, text, favoriteIds, onToggleFavorite, emptyText);
}

function resetView(query: string, collection: boolean): void {
     controller.abort();
     viewingCollection = collection;
     currentQuery = query;
     currentArtworks = [];
     nextSkip = 0;
     typeSelect.value = "all";
     fromCache = false;
     renderRooms(ROOMS, query, pickRoom);
     setMoreButton("hidden");
}

function addResults(result: SearchResult): void {
     fromCache = result.fromCache;
     nextSkip += result.artworks.length;
     const existingIds = new Set(currentArtworks.map((a) => a.id));
     const newArtworks = toArtworks(result.artworks).filter((a) => !existingIds.has(a.id));
     currentArtworks = [...currentArtworks, ...newArtworks];
     fillTypeOptions(getTypes(currentArtworks));
     update();
     setMoreButton(result.artworks.length < PAGE_SIZE ? "hidden" : "ready");
}



// BÚSQUEDA
async function load(query: string): Promise<void> {
     resetView(query, false);
     showLoading();

     try{
          controller = new AbortController();
          const result = await searchArtworks(query, 0, controller.signal);
          if (query !== currentQuery) return;
          addResults(result);
     } catch (error){
          if(isAbortError(error) || query !== currentQuery) return;
          showError(errorMessage(error), () => load(query));
     }
}

async function loadMore(): Promise<void> {
     const query = currentQuery;
     setMoreButton("loading");

     try {
          controller.abort();
          controller = new AbortController();
          const result = await searchArtworks(query, nextSkip, controller.signal);
          if (query !== currentQuery) return;
          addResults(result);
     } catch (error) {
          if(isAbortError(error) || query !== currentQuery) return;
          showWarning(`No se pudieron cargar más obras. ${errorMessage(error)}`);
          setMoreButton("ready");
     }
}

function onSubmit(evento: SubmitEvent): void {
     evento.preventDefault();
     const query = input.value.trim();

     if (query === ""){
          showWarning("Escribe algo para buscar.");
          input.focus();
          return;
     }
     load(query);
}

function pickRoom(query: string): void {
     input.value = query;
     load(query);
}



// FAVORITOS
function showCollection(): void {
     resetView("", true);
     input.value = "";
     currentArtworks = getFavorites();
     fillTypeOptions(getTypes(currentArtworks));
     update();     
}

function onToggleFavorite(art: Artwork): void {
     toggleFavorite(art);
     if (viewingCollection) currentArtworks = getFavorites();
     update();
}



// COLLAGE
function openCollage(): void {
     renderCollage(getFavorites());
     collageDialog.showModal();
}



// UTILIDADES
function errorMessage(error: unknown): string {
     return error instanceof Error ? error.message: "Error desconocido";
}

function isAbortError(error: unknown): boolean {
     return error instanceof DOMException && error.name === "AbortError";
}



// EVENTOS
form.addEventListener("submit", onSubmit);
sortSelect.addEventListener("change", update);
typeSelect.addEventListener("change", update);
moreButton.addEventListener("click", loadMore);
collectionButton.addEventListener("click", showCollection);
openCollageButton.addEventListener("click", openCollage);
closeCollageButton.addEventListener("click", () => collageDialog.close())
collageDialog.addEventListener("close", saveCollage);

initRender();
initTheme(getElement<HTMLButtonElement>("#theme"));
load(DEFAULT_QUERY);