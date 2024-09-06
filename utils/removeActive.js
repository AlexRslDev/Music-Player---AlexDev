export function removeActive(items) {
  document.querySelectorAll(`.${items}`).forEach(element => element.classList.remove('active'));
}