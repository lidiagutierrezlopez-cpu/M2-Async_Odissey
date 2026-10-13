import "./style.css";
import { searchArtworks } from "./api";
import { toArtworks, summary } from "./logic";
import { showLoading, showError, showArtworks } from "./render";

const form = document.querySelector<HTMLFormElement>("#form")!;
const input = document.querySelector<HTMLInputElement>("#input")!;

async function load(query: string): Promise<void> {
     showLoading();
     try{
          const raw = await searchArtworks(query);
          const artworks = toArtworks(raw);
          showArtworks(artworks, summary(artworks));
     } catch (error){
          showError(error instanceof Error ? error.message : "Error desconocido");
     }
}

form.addEventListener("submit", (evento) => {
     evento.preventDefault();
     load(input.value.trim() || "monet");
});

load("monet");