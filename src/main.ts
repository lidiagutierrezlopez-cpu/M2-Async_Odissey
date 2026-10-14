import "./style.css";
import { searchArtworks } from "./api";
import { toArtworks, summary, getTypes, filterByType, sortArtworks } from "./logic";
import type { Artwork } from "./logic";
import { showLoading, showError, showWarning, showArtworks, fillTypeOptions } from "./render";

const form = document.querySelector<HTMLFormElement>("#form")!;
const input = document.querySelector<HTMLInputElement>("#input")!;

const sortSelect = document.querySelector<HTMLSelectElement>("#sort")!;
const typeSelect = document.querySelector<HTMLSelectElement>("#type")!;

let currentArtworks: Artwork[] = [];

function update(): void {
     const filtered = filterByType(currentArtworks, typeSelect.value);
     const sorted = sortArtworks(filtered, sortSelect.value);
     showArtworks(sorted, summary(sorted));
}

async function load(query: string): Promise<void> {
     showLoading();
     try{
          const raw = await searchArtworks(query);
          currentArtworks = toArtworks(raw);
          fillTypeOptions(getTypes(currentArtworks));
          update();
     } catch (error){
          const message = error instanceof Error ? error.message : "Error desconocido";
          showError(message, () => load(query));
     }
}

sortSelect.addEventListener("change", update);
typeSelect.addEventListener("change", update);

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

load("monet");