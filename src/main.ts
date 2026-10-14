import "./style.css";
import { searchArtworks, PAGE_SIZE } from "./api";
import { toArtworks, summary, getTypes, filterByType, sortArtworks } from "./logic";
import type { Artwork } from "./logic";
import { showLoading, showError, showWarning, showArtworks, fillTypeOptions, setMoreButton, renderRooms } from "./render";
import type { Room } from "./render";
import { getFavorites, toggleFavorite } from "./favorites";

const form = document.querySelector<HTMLFormElement>("#form")!;
const input = document.querySelector<HTMLInputElement>("#input")!;

const sortSelect = document.querySelector<HTMLSelectElement>("#sort")!;
const typeSelect = document.querySelector<HTMLSelectElement>("#type")!;
const moreButton = document.querySelector<HTMLButtonElement>("#more")!;
const collectionButton = document.querySelector<HTMLButtonElement>("#collection")!;

const ROOMS: Room[] = [
     { label: "Monet", query: "monet"},
     { label: "Impresionismo", query: "impressionism" },
     { label: "Paisajes", query: "landscape" },
     { label: "Retratos", query: "portrait" },
     { label: "Japón", query: "japan" },
     { label: "Egipto", query: "egypt" },
];

let currentQuery = "";
let currentArtworks: Artwork[] = [];
let nextSkip = 0;
let viewingCollection = false;

function update(): void {
     const filtered = filterByType(currentArtworks, typeSelect.value);
     const sorted = sortArtworks(filtered, sortSelect.value);
     const favoriteIds = new Set(getFavorites().map((a) => a.id));
     const emptyText = viewingCollection ? "Tu colección está vacía. Pulsa 🤍 en una obra para guardarla." : "No hay obras para esta búsqueda.";
     showArtworks(sorted, summary(sorted), favoriteIds, onToggleFavorite, emptyText);
}

function onToggleFavorite(art: Artwork): void {
     toggleFavorite(art);
     if (viewingCollection) currentArtworks = getFavorites();
     update();
}

function showCollection(): void {
     viewingCollection = true;
     currentQuery = "";
     currentArtworks = getFavorites();
     input.value = "";
     typeSelect.value = "all";
     renderRooms(ROOMS, "", pickRoom);
     setMoreButton("hidden");
     fillTypeOptions(getTypes(currentArtworks));
     update();
}

function errorMessage(error: unknown): string{
     return error instanceof Error ? error.message: "Error desconocido";
}

function pickRoom(query: string): void {
     input.value = query;
     load(query);
}

async function load(query: string): Promise<void> {
     viewingCollection = false;
     currentQuery = query;
     renderRooms(ROOMS, query, pickRoom);
     currentArtworks = [];
     nextSkip = 0;
     typeSelect.value = "all";
     showLoading();
     setMoreButton("hidden");

     try{
          const raw = await searchArtworks(query, 0);
          if (query !== currentQuery) return;
          nextSkip = raw.length;
          currentArtworks = toArtworks(raw);
          fillTypeOptions(getTypes(currentArtworks));
          update();
          setMoreButton(raw.length < PAGE_SIZE ? "hidden" : "ready");
     } catch (error){
          if(query !== currentQuery) return;
          showError(errorMessage(error), () => load(query));
     }
}

async function loadMore(): Promise<void> {
     const query = currentQuery;
     setMoreButton("loading");

     try {
          const raw = await searchArtworks(query, nextSkip);
          if (query !== currentQuery) return;

          nextSkip += raw.length;
          currentArtworks = [...currentArtworks, ...toArtworks(raw)];
          fillTypeOptions(getTypes(currentArtworks));
          update();
          setMoreButton(raw.length < PAGE_SIZE ? "hidden" : "ready");
     } catch (error) {
          if (query !== currentQuery) return;
          showWarning(`No se pudieron cargar más obras. ${errorMessage(error)}`);
          setMoreButton("ready");
     }
}

form.addEventListener("submit", (evento) => {
     evento.preventDefault();
     const query = input.value.trim();

     if(query === ""){
          showWarning("Escribe algo para buscar.");
          input.focus();
          return;
     }

     load(query);
});

sortSelect.addEventListener("change", update);
typeSelect.addEventListener("change", update);
moreButton.addEventListener("click", loadMore);
collectionButton.addEventListener("click", showCollection);

load("monet");