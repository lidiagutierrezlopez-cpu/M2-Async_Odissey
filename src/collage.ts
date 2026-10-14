import type { Artwork } from "./logic";

let topZ = 1;

export function renderCollage(artworks: Artwork[]): void {
     const board = document.querySelector<HTMLDivElement>("#collage #board");
     if (!board) throw new Error("No encuentro #board dentro de #collage en index.html");

     if(artworks.length === 0){
          const empty = document.createElement("p");
          empty.className = "collage-empty";
          empty.textContent = "Aún no tienes favoritos. Pulsa 🤍 en algunas obras para crear tu collage.";
          board.replaceChildren(empty);
          return;
     }
     board.replaceChildren(...artworks.map(createPiece));
}

function createPiece(art: Artwork, index: number): HTMLElement {
     const piece = document.createElement("div");
     piece.className = "piece";

     piece.style.left = `${40 + (index % 5) * 170}px`;
     piece.style.top = `${40 + Math.floor(index/5) * 210}px`;

     const img = document.createElement("img");
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
          }

          piece.addEventListener("pointermove", onMove);
          piece.addEventListener("pointerup", onUp);
     });
}