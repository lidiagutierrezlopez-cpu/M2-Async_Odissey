import type { Artwork } from "./logic";
import { getCache, setCache } from "./cache";

interface PieceLayout {
     left: number;
     top: number;
     width: number;
     z: number;
}
type Layout = Record<string, PieceLayout>;

const KEY = "collage";
let topZ = 1;

function getBoard(): HTMLDivElement {
     const board = document.querySelector<HTMLDivElement>("#collage #board");
     if (!board) throw new Error("No encuentro #board dentro de #collage en index.html");
     return board;
}

function getLayout(): Layout{
     const saved = getCache<Layout>(KEY);
     return saved !== null && typeof saved === "object" ? saved : {};
}

export function renderCollage(artworks: Artwork[]): void {
     const board = getBoard();

     if(artworks.length === 0){
          const empty = document.createElement("p");
          empty.className = "collage-empty";
          empty.textContent = "Aún no tienes favoritos. Pulsa 🤍 en algunas obras para crear tu collage.";
          board.replaceChildren(empty);
          return;
     }
     const layout = getLayout();

     topZ = Object.values(layout).reduce((max, piece) => Math.max(max, piece.z), 1);
     board.replaceChildren(...artworks.map((art, index) => createPiece(art, index, layout[art.id])));
}

function px(value: string, fallback: number): number {
     const number = parseFloat(value);
     return Number.isFinite(number) ? number : fallback;
}

export function saveCollage(): void {
     const pieces = [...getBoard().querySelectorAll<HTMLElement>(".piece")];
     const layout: Layout = Object.fromEntries(pieces.map((piece) => [piece.dataset.id ?? "", {
          left: px(piece.style.left, 0),
          top: px(piece.style.top, 0),
          width: px(piece.style.width, 150),
          z: Number(piece.style.zIndex) || 1,
     }]));
     setCache(KEY, layout);
}

function createPiece(art: Artwork, index: number, saved?: PieceLayout): HTMLElement {
     const piece = document.createElement("div");
     piece.className = "piece";
     piece.dataset.id = String(art.id);

     if(saved){
          piece.style.left = `${saved.left}px`;
          piece.style.top = `${saved.top}px`;
          piece.style.width = `${saved.width}px`;
          piece.style.zIndex = String(saved.z);   
     } else{
          piece.style.left = `${40 + (index % 5) * 170}px`;
          piece.style.top = `${40 + Math.floor(index/5) * 210}px`;
     }
     
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

function makeDraggable(piece: HTMLElement): void {
     piece.addEventListener("pointerdown", (evento) => {
          const rect = piece.getBoundingClientRect();
          if (evento.clientX > rect.right - 20 && evento.clientY > rect.bottom - 20) return;

          piece.style.zIndex = String(++topZ);
          const offsetX = evento.clientX - piece.offsetLeft;
          const offsetY = evento.clientY - piece.offsetTop;
          piece.setPointerCapture(evento.pointerId);

          const onMove = (e: PointerEvent) => {
               piece.style.left = `${e.clientX - offsetX}px`;
               piece.style.top = `${e.clientY - offsetY}px`;
          };
          const onUp = () => {
               piece.removeEventListener("pointermove", onMove);
               piece.removeEventListener("pointerup", onUp);
               saveCollage();
          }

          piece.addEventListener("pointermove", onMove);
          piece.addEventListener("pointerup", onUp);
     });
}