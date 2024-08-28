class SongCart extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
    <div class="song-playing">
      <picture class="song-image"></picture>
      <div class="song-text">
        <p>Mardy Bum</p>
        <span>Arctic Monkeys</span>
      </div>
    </div>
    `;  // content component
	};
};
customElements.define('song-cart-item', SongCart);

