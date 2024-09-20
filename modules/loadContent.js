export async function loadContent(data, containerSelector, itemTemplate) {
  const fragment = document.createDocumentFragment();
  data.forEach(item => {
    const html = itemTemplate(item);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    fragment.appendChild(tempDiv.firstElementChild);
  });
  document.querySelector(containerSelector).appendChild(fragment);
};