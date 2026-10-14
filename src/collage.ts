import type { Artwork } from "./logic";
import { getCache, setCache } from "./cache";

// TIPOS Y CONSTANTES
interface PieceLayout {
     left: number;
     top: number;
     width: number;
     z: number;
}
type Layout = Record<string, PieceLayout>;

const STORAGE_KEY = "collage";
const DEFAULT_WIDTH = 150;
const RESIZE_CORNER = 20;

let topZ = 1;



// FUNCIONES QUE USA main.ts
export function renderCollage(artworks: Artwork[]): void {
     const board = getBoard();

     if(artworks.length === 0){
          board.replaceChildren(createEmptyMessage());
          return;
     }

     const layout = getCache<Layout>(STORAGE_KEY) ?? {};
     topZ = Object.values(layout).reduce((max, piece) => Math.max(max, piece.z), 1);
     board.replaceChildren(...artworks.map((art, index) => createPiece(art, layout[art.id] ?? defaultLayout(index))));
}

export function saveCollage(): void {
     const pieces = [...getBoard().querySelectorAll<HTMLElement>(".piece")];
     const layout: Layout = Object.fromEntries(pieces.map((piece) => [piece.dataset.id ?? "", readLayout(piece)]));
     setCache(STORAGE_KEY, layout);
}



// CREAR ELEMENTOS
function createPiece(art: Artwork, layout: PieceLayout): HTMLElement {
     const piece = document.createElement("div");
     piece.className = "piece";
     piece.dataset.id = String(art.id);
     applyLayout(piece, layout);

     const img = document.createElement("img");
     img.addEventListener("load", () => {
          piece.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
     }, { once: true });
     img.src = art.imageUrl;
     img.alt = art.title;
     img.draggable = false;

     piece.append(img);
     makeDraggable(piece);
     return piece;
}

function createEmptyMessage(): HTMLElement {
     const empty = document.createElement("p");
     empty.className = "collage-empty";
     empty.textContent = "Aún no tienes favoritos. Pulsa 🤍 en algunas obras para crear tu collage.";
     return empty;
}



// POSICIÓN Y TAMAÑO
function defaultLayout(index: number): PieceLayout {
     return {
          left: 40 + (index % 5) * 170,
          top: 40 + Math.floor(index / 5) * 210,
          width: DEFAULT_WIDTH,
          z: 1,
     };
}

function applyLayout(piece: HTMLElement, {left, top, width, z}: PieceLayout): void {
     piece.style.left = `${left}px`;
     piece.style.top = `${top}px`;
     piece.style.width = `${width}px`;
     piece.style.zIndex = String(z);
}

function readLayout(piece: HTMLElement): PieceLayout {
     return {
          left: parseFloat(piece.style.left) || 0,
          top: parseFloat(piece.style.top) || 0,
          width: parseFloat(piece.style.width) || DEFAULT_WIDTH,
          z: Number(piece.style.zIndex) || 1,
     };
}

// ARRASTRAR
function makeDraggable(piece: HTMLElement): void {
     piece.addEventListener("pointerdown", (evento) => {
          if (isOnResizeCorner(piece, evento)) return;

          piece.style.zIndex = String(++topZ);
          piece.setPointerCapture(evento.pointerId);
          const offsetX = evento.clientX - piece.offsetLeft;
          const offsetY = evento.clientY - piece.offsetTop;

          const onMove = (e: PointerEvent) => {
               piece.style.left = `${e.clientX - offsetX}px`;
               piece.style.top = `${e.clientY - offsetY}px`;
          };

          piece.addEventListener("pointermove", onMove);
          piece.addEventListener("pointerup", () => {
               piece.removeEventListener("pointermove", onMove);
               saveCollage();
          }, { once: true });          
     });
}

function isOnResizeCorner(piece: HTMLElement, evento: PointerEvent): boolean {
     const rect = piece.getBoundingClientRect();
     return evento.clientX > rect.right - RESIZE_CORNER && evento.clientY > rect.bottom - RESIZE_CORNER;
}


// UTILIDADES
function getBoard(): HTMLDivElement {
     const board = document.querySelector<HTMLDivElement>("#collage #board");
     if (!board) throw new Error("No encuentro #board dentro de #collage en index.html");
     return board;
}




