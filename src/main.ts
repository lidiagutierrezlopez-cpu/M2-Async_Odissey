import "./style.css";
import { searchArtworks, PAGE_SIZE } from "./api";
import { toArtworks, summary, getTypes, filterByType, sortArtworks } from "./logic";
import type { Artwork } from "./logic";
import { showLoading, showError, showWarning, showArtworks, fillTypeOptions, setMoreButton } from "./render";

const form = document.querySelector<HTMLFormElement>("#form")!;
const input = document.querySelector<HTMLInputElement>("#input")!;

const sortSelect = document.querySelector<HTMLSelectElement>("#sort")!;
const typeSelect = document.querySelector<HTMLSelectElement>("#type")!;
const moreButton = document.querySelector<HTMLButtonElement>("#more")!;

let currentQuery = "";
let currentArtworks: Artwork[] = [];
let nextSkip = 0;

function update(): void {
     const filtered = filterByType(currentArtworks, typeSelect.value);
     const sorted = sortArtworks(filtered, sortSelect.value);
     showArtworks(sorted, summary(sorted));
}

function errorMessage(error: unknown): string{
     return error instanceof Error ? error.message: "Error desconocido";
}

async function load(query: string): Promise<void> {
     currentQuery = query;
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

load("monet");