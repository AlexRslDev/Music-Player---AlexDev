import { fetchSongs } from '../modules/fetching.js';

// ELEMENTS
const userSongs = document.querySelector('.userSongs');
const playerImg = document.getElementById('p-img'),
  playerTitle = document.getElementById('player-title'),
  playerArtist = document.getElementById('player-arts'),
  progress = document.getElementById('progress'),
  playerProgress = document.getElementById('time-lapse-container'),
  prevBtn = document.getElementById('prev'),
  nextBtn = document.getElementById('next'),
  playBtn = document.getElementById('play');

// Ruta de los iconos del player
const playIcon = 'assets/images/play-solid.svg';
const pauseIcon = 'assets/images/pause-solid.svg';


let currentAudio = null;

fetchSongs().then(songs => {
  // Include HTML on the container
  songs.forEach(song => returnSong(song));

  function returnSong(song) {
    // Generar HTML con la información de la canción y duración
    const songHTML = `
      <li data-id="${song.id}" id="userSong">
        <div id="left-song-item">
          <img src="assets/images/covers/${song.cover}" alt="">
          <div>
            <span>${song.name}</span>
            <p class="gray">${song.artist}</p>
          </div>
        </div>

        <div id="right-song-item">
          <img src="assets/images/heart-regular.svg" alt="">
          <div class="home-duration ">
            <p class="gray">${song.duration}</p>
            <img src="assets/images/ellipsis-solid.svg" alt="">
          </div>
        </div>
      </li>
    `;

    // agregar el HTML a la página
    userSongs.innerHTML += songHTML;
  };
});

function playSongById(id) {
  fetchSongs()
    .then(songs => {

      // Stop song if another song is playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reiniciar el tiempo para que comience desde el inicio si se vuelve a reproducir
      }

      // Buscar la canción por ID en el array de canciones
      const song = songs.find(song => song.id === id);

      if (song) {
        currentAudio = new Audio(song.path); // Crear un nuevo objeto Audio y asignarlo a currentAudio

        // hay que guardar la ultima imagen de la cancion que escucho el usuario.

        currentAudio.play()
          .then(() => {
            // Cambiar los datos del player cuando se reproduce una nueva cancion
            playerImg.src = `assets/images/covers/${song.cover}`;
            playerTitle.innerHTML = song.name;
            playerArtist.innerHTML = song.artist;

            // Actualizarla barra del player
            currentAudio.addEventListener('timeupdate', updateProgressBar);

            // Cambiar el icono del player
            playBtn.src = pauseIcon; // Cambia a la imagen de pausa

            console.log(`Reproduciendo: ${song.name} de ${song.artist}`);

            currentAudio.addEventListener('ended', () => {
              playBtn.src = playIcon;
            });

          })
          .catch(error => {
            console.error('Error al intentar reproducir la canción:', error);
            return;
          });
      } else {
        console.error('Canción no encontrada:', id);
      }

    });
};

// Añadir evento de clic a cada botón de reproducción
userSongs.addEventListener('dblclick', (event) => {
  // Busca el <li> más cercano al elemento clicado
  const liElement = event.target.closest('li');
  
  // Verifica si existe el <li> y si su id es 'song'
  if (liElement && liElement.id === 'userSong') {
    const id = liElement.getAttribute('data-id'); // Obtener el ID desde el data-attribute
    playSongById(id);
  }
});

// escuchar cuando el usuario le de click a la barra del player
playerProgress.addEventListener('click', setProgressBar);

function updateProgressBar() {
  const { duration, currentTime } = currentAudio;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
}

function setProgressBar(e) {
  console.log('user click player')
  const width = playerProgress.clientWidth;
  const clickX = e.offsetX;
  currentAudio.currentTime = (clickX / width) * currentAudio.duration;
}


// change icon

playBtn.addEventListener('click', changePlayerBtn);

function changePlayerBtn() {
  if (this.src.includes('play-solid.svg')) {
    this.src = pauseIcon; // Cambia a la imagen de pausa
    currentAudio.play();
  } else {
    this.src = playIcon; // Cambia a la imagen de play
    currentAudio.pause();
  }
};