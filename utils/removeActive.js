export function removeActive(items) {
  document.querySelectorAll(`.${items}`).forEach(element => element.classList.remove('active'));
}

// ELEMENTS LIKE 'Item' and the id in play by ID
export function includeActive(elements, id) {
  document.querySelectorAll(`.${elements}`).forEach(element => {
    const attribute = element.getAttribute('data-id');
    if (attribute === id) {
      element.classList.add('active');
    }
  })
}