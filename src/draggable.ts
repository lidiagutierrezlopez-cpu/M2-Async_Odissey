const RESIZE_CORNER = 20;
let topZ = 1;

export function setTopZ(z: number): void {
     topZ = z;
}

export function makeDraggable(elemento: HTMLElement, onDrop: () => void): void {
     elemento.addEventListener("pointerdown", (evento) => {
          if (isOnResizeCorner(elemento, evento)) return;

          elemento.style.zIndex = String(++topZ);
          elemento.setPointerCapture(evento.pointerId);
          const offsetX = evento.clientX - elemento.offsetLeft;
          const offsetY = evento.clientY - elemento.offsetTop;

          const onMove = (e: PointerEvent) => {
               elemento.style.left = `${e.clientX - offsetX}px`;
               elemento.style.top = `${e.clientY - offsetY}px`;
          }

          elemento.addEventListener("pointermove", onMove);
          elemento.addEventListener("pointerup", () => {
               elemento.removeEventListener("pointermove", onMove);
               onDrop();
          }, { once: true});
     });
}

function isOnResizeCorner(elemento: HTMLElement, evento: PointerEvent): boolean {
     const rect = elemento.getBoundingClientRect();
     return evento.clientX > rect.right - RESIZE_CORNER && evento.clientY > rect.bottom - RESIZE_CORNER;
}