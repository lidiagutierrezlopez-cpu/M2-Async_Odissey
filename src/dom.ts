export function getElement<T extends HTMLElement>(selector: string): T {
     const element = document.querySelector<T>(selector);
     if (!element) throw new Error(`No encuentro ${selector} en index.html`);
     return element;
}