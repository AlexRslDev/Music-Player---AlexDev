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
  favoriteSongBtn = document.getElementById('fv-song-btn'),
  createPlaylistBtn = document.getElementById('c-playlist'),
  playlistDialog = document.getElementById('playlist-dialog'),
  formCreatePlaylist = document.getElementById('form-pst'),
  coverPlaylist = document.getElementById('pst-file');

// Ruta de los iconos del player
const playIcon = 'assets/images/play-solid.svg';
const pauseIcon = 'assets/images/pause-solid.svg';



// Currents variables
let currentAudio,
  currentPosition,
  currentImg,
  currentName,
  currentArtist,
  currentTimeSong,
  currentDurationSong,
  musicIndex = 0;

// Load Favorite Component
getFavoriteSong();
// Load Current user's song
getCurrentSong();
// load playlist
loadPlaylists();

// Include HTML user's songs on the container
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
      currentPosition = indexPositon;
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
}

function updateProgressBar() {
  const duration = currentAudio.duration,
    currentTime = currentAudio.currentTime,
    progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
  currentTimeSong = currentTime;
  currentDurationSong = duration;
  updateCurrentSong();
}

function setProgressBar(e) {
  console.log('user click player')
  const width = playerProgress.clientWidth;
  const clickX = e.offsetX;
  currentAudio.currentTime = (clickX / width) * currentAudio.duration;
}

function changeMusic(direction) {
  fetchSongs()
    .then(songs => {
      musicIndex = (musicIndex + direction + songs.length) % songs.length;
      const id = songs[musicIndex].id;
      playSongById(id);
    });
}

function getCurrentSong() {
  const savedSong = JSON.parse(localStorage.getItem('currentSong')) || {};

  if (savedSong.savedName) {
    // Set variables
    currentPosition = Number(savedSong.position);
    currentTimeSong = Number(savedSong.currentTimeSong);
    currentDurationSong = Number(savedSong.currentDurationSong);
    currentImg = savedSong.savedImg;
    currentName = savedSong.savedName;
    currentArtist = savedSong.savedArtist;
    musicIndex = Number(savedSong.position);

    // Update UI // i can reuse with playSongById
    playerImg.src = currentImg;
    playerTitle.innerHTML = currentName;
    playerArtist.innerHTML = currentArtist;
    progress.style.width = `${(currentTimeSong / currentDurationSong) * 100}%`;
  }
}

function updateCurrentSong() {
  let savedSong = JSON.parse(localStorage.getItem('currentSong')) || {};

  savedSong.position = String(currentPosition);
  savedSong.savedImg = currentImg;
  savedSong.savedName = currentName;
  savedSong.savedArtist = currentArtist;
  savedSong.currentTimeSong = String(currentTimeSong);
  savedSong.currentDurationSong = String(currentDurationSong);
  // Save
  localStorage.setItem('currentSong', JSON.stringify(savedSong));
}


// ----- Event Listeners ------
playBtn.addEventListener('click', () => {
  if (playBtn.src.includes('play-solid.svg')) {
    playBtn.src = pauseIcon; // Cambia a la imagen de pausa
    
    if (!currentAudio) {
      fetchSongs().then(songs => {
        let obj = songs[currentPosition];
        currentAudio = new Audio(obj.path);
        currentAudio.currentTime = currentTimeSong;
        currentAudio.play();
        // Inicia la actualización del progreso
        setInterval(() => {
          updateProgressBar();
        }, 100); // Actualiza el progreso cada segundo
      });
    } else {
      currentAudio.play();
      // Inicia la actualización del progreso
      setInterval(() => {
        updateProgressBar();
      }, 100); // Actualiza el progreso cada segundo
    }
    
  } else {
    playBtn.src = playIcon; // Cambia a la imagen de play
    currentAudio.pause();
    console.log(currentAudio)
  }

});

prevBtn.addEventListener('click', () => changeMusic(-1));
nextBtn.addEventListener('click', () => changeMusic(1));

// When the User click a song from songs container
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


// Play user's favorite song
favoriteSongBtn.addEventListener('click', (event) => {
  const btn = event.target.closest('button');
  const id = btn.getAttribute('data-id'); // Obtener el ID desde el data-attribute
  playSongById(id);
});

createPlaylistBtn.addEventListener('click', () => {
  playlistDialog.classList.add('hidden'); // Inicialmente escondido
  playlistDialog.showModal();
  setTimeout(() => {
      playlistDialog.classList.remove('hidden');
      playlistDialog.classList.add('showing');
  }, 10); // Timeout pequeño para activar la animación
});

let imageBase64;  // variable global que contiene la imagen en base 64


function loadPlaylists() {
  const playlistContainer = document.getElementById('user-playlists');
  const objStr = localStorage.getItem('storedPlaylist');

  if (objStr) {
    playlistContainer.innerHTML = '';
    const obj = JSON.parse(objStr); 

    obj.forEach(item => {

      if (item.img) { // si tiene una imagen
        const html = `
          <li>
            <img src="${item.img}" id="user-image">
            <div>
              <p>${item.title}</p>
            </div>
          </li>
        `;

        playlistContainer.innerHTML += html;
      } else { // si solo tiene titulo le ponemos el default icon
        const html = `
          <li>
            <div id="default-image"><img src="assets/images/music-solid-white.svg" id="icon-default"></div>
            <div>
              <p>${item.title}</p>
            </div>
          </li>
        `;
        playlistContainer.innerHTML += html;
      }

    });
  } else {  // si no exite la key: storedPlaylist
    const createArray =  JSON.stringify([]);
    localStorage.setItem('storedPlaylist', createArray);
  }
}


function storeImageBase64(title) {
  const storedObject = localStorage.getItem('storedPlaylist');
  const obj = JSON.parse(storedObject);

  const text = title;

  if (imageBase64) {
    const newObj = {
      title: text,
      img: imageBase64
    }
    
    obj.push(newObj);

    // Convertir el objeto a una cadena JSON
    const updatePlaylists = JSON.stringify(obj);

    // Almacenar la cadena JSON en localStorage
    localStorage.setItem('storedPlaylist', updatePlaylists);
    loadPlaylists();
  } else {
    const newObj = {
      title: text
    }

    obj.push(newObj);

    const updatePlaylists = JSON.stringify(obj);
    localStorage.setItem('storedPlaylist', updatePlaylists);
    loadPlaylists();
  }

}



formCreatePlaylist.addEventListener('submit', (event) => {
  event.preventDefault(); // Previene el comportamiento por defecto (recarga de página)

  // Work with data
  const playlistName = document.getElementById('input-txt-pst').value;
  
  if (coverPlaylist) {
    storeImageBase64(playlistName); 
    console.log(`El nombre de la playlist es: ${playlistName} y la imageb ${coverPlaylist}`);
  }

  console.log(`El nombre de la playlist es: ${playlistName}`);

  // Close Dialog
  playlistDialog.classList.remove('showing');
    setTimeout(() => {
        playlistDialog.close();
    }, 500); // Coincide con el tiempo de la transición CSS
});


coverPlaylist.addEventListener('change', () => {
  if (coverPlaylist.files && coverPlaylist.files[0]) {
    document.getElementById('pst-no-file').innerHTML = 'File Selected';

    const file = coverPlaylist.files[0];
    const reader = new FileReader(); // Instanciamos FileReader

    reader.onload = function(e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function() {
        // Crear un canvas para redimensionar la imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Establecer el tamaño del canvas
        canvas.width = 200;
        canvas.height = 200;

        // Dibujar la imagen redimensionada en el canvas
        ctx.drawImage(img, 0, 0, 200, 200);

        // Convertir el contenido del canvas a Base64
        imageBase64 = canvas.toDataURL('image/jpeg', 0.7);

        // Actualizar la vista previa
        const userImg = document.getElementById('user-img-pst');
        userImg.src = imageBase64;


        // Ocultar la imagen por defecto y mostrar la imagen
        document.getElementById('default-pst-img').style.display = 'none';
        userImg.style.display = 'block';
      }
    }

    // Leemos el archivo como una URL de datos
    reader.readAsDataURL(file);
  } else {
    document.getElementById('pst-no-file').innerHTML = 'No File Selected';

    // Mostrar la imagen por defecto y ocultar la imagen cargada
    document.getElementById('default-pst-img').style.display = 'block';
    document.getElementById('user-img-pst').style.display = 'none';
  }
});
