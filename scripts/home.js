import { fetchSongs } from '../modules/fetching.js';
import { getPlaysCount, updatePlayCount } from '../modules/playsCounter.js';
import { getFavoriteSong } from '../modules/favoriteSong.js';

// ELEMENTS
const userSongs = document.querySelector('.userSongs');
const playerImg = document.getElementById('p-img'),
  playerTitle = document.getElementById('player-title'),
  playerArtist = document.getElementById('player-arts'),
  progress = document.getElementById('progress'),
  playerProgress = document.getElementById('time-lapse-container'),
  prevBtn = document.getElementById('prev'),
  nextBtn = document.getElementById('next'),
  playBtn = document.getElementById('play'),
  favoriteSongBtn = document.getElementById('fv-song-btn');

// Ruta de los iconos del player
const playIcon = 'assets/images/play-solid.svg';
const pauseIcon = 'assets/images/pause-solid.svg';

// Audio actual
let currentAudio;

let currentImg;
let currentName;
let currentArtist;
let currentDuration;

let musicIndex = 0;

getFavoriteSong();
getCurrentSong();


// Include HTML on the container
fetchSongs().then(songs => {
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


// Play music by ID
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

      // Buscar la posicion de la cancion dentro del array
      const indexPositon = songs.findIndex(element => element.id === song.id);
      // actualizar la posicion
      musicIndex = indexPositon;

      if (song) {
        currentAudio = new Audio(song.path); // Crear un nuevo objeto Audio y asignarlo a currentAudio

        currentAudio.play()
          .then(() => {
            // guardar los datos de la cancion actual para el localStorage
            currentImg = `assets/images/covers/${song.cover}`;
            currentName = song.name;
            currentArtist = song.artist;

            // Cambiar los datos del player cuando se reproduce una nueva cancion
            playerImg.src = currentImg;
            playerTitle.innerHTML = currentName;
            playerArtist.innerHTML = currentArtist;



            // Actualizarla barra del player
            currentAudio.addEventListener('timeupdate', updateProgressBar);

            // Cambiar el icono del player
            playBtn.src = pauseIcon; // Cambia a la imagen de pausa

            // Song counter
            updatePlayCount(song.id);

            // actualizar los datos de la cancion actual
            updateCurrentSong();

            console.log(`Reproduciendo: ${song.name} de ${song.artist}`);

            currentAudio.addEventListener('ended', () => {
              playBtn.src = playIcon;
              changeMusic(1)
              getFavoriteSong();
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

function updateProgressBar() {
  const { duration, currentTime } = currentAudio;
  //console.log(currentAudio.currentTime, currentAudio.duration)
  updateCurrentSong(currentAudio.currentTime);
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
}

function setProgressBar(e) {
  console.log('user click player')
  const width = playerProgress.clientWidth;
  const clickX = e.offsetX;
  currentAudio.currentTime = (clickX / width) * currentAudio.duration;
}

function changePlayerBtn() {
  if (this.src.includes('play-solid.svg')) {
    this.src = pauseIcon; // Cambia a la imagen de pausa
    currentAudio.play();
    console.log(currentAudio)
  } else {
    this.src = playIcon; // Cambia a la imagen de play
    currentAudio.pause();
    console.log(currentAudio)
  }
};

function changeMusic(direction) {
  fetchSongs()
    .then(songs => {
      musicIndex = (musicIndex + direction + songs.length) % songs.length;
      const id = songs[musicIndex].id;
      playSongById(id);
    });
}


function getCurrentSong() {
  try {
    const currentOBJ = JSON.parse(localStorage.getItem('currentSong')) || undefined;
    console.log(currentOBJ);

    // Update the current song
    playerImg.src = currentOBJ.currentImg;
    playerTitle.innerHTML = currentOBJ.currentName;
    playerArtist.innerHTML = currentOBJ.currentArtist;
    progress.style.width = `${currentOBJ.currentDuration}%`;

    return currentOBJ;
  } catch (error) {
    console.error('Error parsing currentSong from localStorage:', error);
    return undefined;
  }
}

function updateCurrentSong(currentDuration) {
  let currentOBJ = JSON.parse(localStorage.getItem('currentSong')) || {};

  currentOBJ.currentImg = currentImg;
  currentOBJ.currentName = currentName;
  currentOBJ.currentArtist = currentArtist;
  currentOBJ.currentDuration = currentDuration;

  try {
    localStorage.setItem('currentSong', JSON.stringify(currentOBJ));
  } catch (error) {
    console.error('Error saving currentSong to localStorage:', error);
  }
}


// ----- Event Listeners ------

playBtn.addEventListener('click', changePlayerBtn);
prevBtn.addEventListener('click', () => changeMusic(-1));
nextBtn.addEventListener('click', () => changeMusic(1));

// escuchar cuando el usuario le de click a la barra del player
playerProgress.addEventListener('click', setProgressBar);

// Play user's favorite song
favoriteSongBtn.addEventListener('click', (event) => {
  const btn = event.target.closest('button');
  const id = btn.getAttribute('data-id'); // Obtener el ID desde el data-attribute
  playSongById(id);
});

// User songs
userSongs.addEventListener('dblclick', (event) => {
  // Busca el <li> más cercano al elemento clicado
  const liElement = event.target.closest('li');
  
  // Verifica si existe el <li> y si su id es 'song'
  if (liElement && liElement.id === 'userSong') {
    const id = liElement.getAttribute('data-id'); // Obtener el ID desde el data-attribute
    playSongById(id);
  }
});