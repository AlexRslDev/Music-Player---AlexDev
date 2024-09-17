import { fetchSongs } from '../modules/fetching.js';
import { getPlaysCount, updatePlayCount } from '../modules/playsCounter.js';
import { getFavoriteSong } from '../modules/favoriteSong.js';
import { removeActive, includeActive } from '../utils/removeActive.js';
import { getStoredPlaylist, setStoredPlaylist } from '../utils/storedPlaylist.js';

// ELEMENTS
const userSongs = document.querySelector('.userSongs'),
  playerImg = document.getElementById('p-img'),
  playerTitle = document.getElementById('player-title'),
  playerArtist = document.getElementById('player-arts'),
  progress = document.getElementById('progress'),
  playerProgress = document.getElementById('time-lapse-container'),
  prevBtn = document.getElementById('prev'),
  nextBtn = document.getElementById('next'),
  playBtn = document.getElementById('play'),
  volumeLineContainer = document.getElementById('vol-line-ctn'),
  volumeLine = document.getElementById('vol-line'),
  favoriteSongBtn = document.getElementById('fv-song-btn'),
  createPlaylistBtn = document.getElementById('c-playlist'),
  playlistDialog = document.getElementById('playlist-dialog'),
  formCreatePlaylist = document.getElementById('form-pst'),
  coverPlaylist = document.getElementById('pst-file'),
  playlistContainer = document.getElementById('user-playlists'),
  homeNavegation = document.querySelector('.home-nav'),
  searchBar = document.getElementById('srch-bar'),
  searchResults = document.getElementById('srch-rstls'),
  volumeIcon = document.querySelector('#vol-icon');

// Player icon path
const playIcon = 'assets/images/play-solid.svg',
  pauseIcon = 'assets/images/pause-solid.svg';

// Currents variables
let currentAudio,
  currentPosition,
  currentImg,
  currentName,
  currentArtist,
  currentTimeSong,
  currentDurationSong,
  musicIndex = 0,
  openEllipsisContainer = null,
  imageBase64,  // variable global que contiene la imagen en base 64
  currentInterface = 'main',
  currentPlaylist,
  songsToPlay = [],
  savedSongsToPlay = [],
  originalVolume = 1,
  isRepeating;

loader();
// Load Favorite Component
getFavoriteSong();
// Load Current user's song
getCurrentSong();
// load playlist
loadPlaylists();
// Load songs id's array with all user songs
loadInitialSongsArray();

function loader() {
  setTimeout(() => {
    document.querySelector('#loader').style.display = 'none';
    document.querySelector('#app-container').style.display = 'grid';
  }, 2000);
};

// Include HTML user's songs on the container
fetchSongs().then(songs => {
  const fragment = document.createDocumentFragment();

  songs.forEach(song => {
    const songHTML = `
      <li data-id="${song.id}" id="userSong" class="userSongItem">
        <div id="left-song-item">
          <img src="assets/images/covers/${song.cover}" alt="">
          <div>
            <span>${song.name}</span>
            <p class="gray">${song.artist}</p>
          </div>
        </div>

        <div id="right-song-item">
          <img src="assets/images/heart-regular.svg">
          <div class="home-duration ">
            <p class="gray">${song.duration}</p>
            <img src="assets/images/plus-solid.svg" class="ellipsis-btn">
          </div>
        </div>

        <div class="ellipsis-container">
          <div id="top-elip">
            <img src="assets/images/xmark-solid-gray.svg" class="close-elip">
            <p>Add to playlist</p>
          </div>
          <div class="select-pst"></div>
        </div>
      </li>
    `;

    // Crear un contenedor temporal para el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = songHTML;

    // Agregar el primer hijo del contenedor temporal al fragment
    fragment.appendChild(tempDiv.firstElementChild);
  });

  userSongs.appendChild(fragment);
});

// Play music by ID
function playSongById(id) {
  fetchSongs()
    .then(songs => {
      // Stop song if another song is playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reiniciar el tiempo para que comience desde el inicio si se vuelve a reproducir
      };

      // Buscar la canción por ID en el array de canciones
      const song = songs.find(song => song.id === id);

      // Search the index position inside global songs array
      const indexPosition = songsToPlay.findIndex(element => element === id)
      musicIndex = indexPosition;
      console.log(musicIndex)
      currentPosition = savedSongsToPlay.findIndex(element => element === id);

      if (song) {
        currentAudio = new Audio(song.path); // Crear un nuevo objeto Audio y asignarlo a currentAudio

        currentAudio.play()
          .then(() => {
            currentAudio.volume = originalVolume;
            if (currentInterface === 'main') {
              removeActive('userSongItem');
              includeActive('userSongItem', id);
            } else {
              removeActive('userPlaylistItem');
              includeActive('userPlaylistItem', id);
            };
            
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

            currentAudio.addEventListener('ended', () => {
              if (!isRepeating) {
                playBtn.src = playIcon;
                changeMusic(1)
                getFavoriteSong();
                removeActive('userSongItem');
              } else {
                playBtn.src = playIcon;
                getFavoriteSong();
                playSongById(id);
              };
            });
          })
          .catch(error => {
            console.error('Error trying to play song:', error);
            return;
          });
      } else {
        console.error('Canción no encontrada:', id);
      };
    });
};

function updateProgressBar() {
  const { duration, currentTime } = currentAudio;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
  currentTimeSong = currentTime;
  currentDurationSong = duration;
  updateCurrentSong();
};

function setProgressBar(e) {
  const width = playerProgress.clientWidth;
  const clickX = e.offsetX;
  currentAudio.currentTime = (clickX / width) * currentAudio.duration;
};

function changeMusic(direction) {
  // Search the position of the song into de array global
  musicIndex = (musicIndex + direction + songsToPlay.length) % songsToPlay.length;
  const id = songsToPlay[musicIndex];
  playSongById(id);
};

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
    updateCurrentWdContent(currentImg, currentName, currentArtist);

    // Update UI // i can reuse with playSongById
    playerImg.src = currentImg;
    playerTitle.innerHTML = currentName;
    playerArtist.innerHTML = currentArtist;
    progress.style.width = `${(currentTimeSong / currentDurationSong) * 100}%`;
  };
};

function updateCurrentSong() {
  let savedSong = JSON.parse(localStorage.getItem('currentSong')) || {};

  savedSong.position = String(currentPosition);
  savedSong.savedImg = currentImg;
  savedSong.savedName = currentName;
  savedSong.savedArtist = currentArtist;
  savedSong.currentTimeSong = String(currentTimeSong);
  savedSong.currentDurationSong = String(currentDurationSong);
  updateCurrentWdContent(currentImg, currentName, currentArtist);

  // Save
  localStorage.setItem('currentSong', JSON.stringify(savedSong));
};

function updateCurrentWdContent(currentImg, currentName, currentArtist) {
  // Update current song window
  document.querySelector('#current-wd-cover').src = currentImg;
  document.querySelector('#txt-ttl-cws').innerHTML = currentName;
  document.querySelector('#txt-arts-cws').innerHTML = currentArtist;
};

export function loadPlaylists() {
  const obj = getStoredPlaylist();

  if (obj) {
    playlistContainer.innerHTML = '';

    obj.forEach((item, index) => {
      if (item.img) { // si tiene una imagen
        const html = `
          <li class="pst-item-side" data-pos="${index}">
            <img src="${item.img}" id="user-image">
            <div>
              <p>${item.title}</p>
            </div>
            <div id="delete-btn-pst">Delete</div>
          </li>
        `;
        playlistContainer.innerHTML += html;
      } else { // si solo tiene titulo le ponemos el default icon
        const html = `
          <li class="pst-item-side" data-pos="${index}">
            <img src="assets/images/default-icon.webp" id="default-image">
            <div>
              <p>${item.title}</p>
            </div>
            <div id="delete-btn-pst">Delete</div>
          </li>
        `;
        playlistContainer.innerHTML += html;
      };
    });
  } else {  // si no exite la key: storedPlaylist
    const createArray =  JSON.stringify([]);
    localStorage.setItem('storedPlaylist', createArray);
  }
};

function updatePlaylist(title) {
  const obj = getStoredPlaylist();
  const text = title;

  if (imageBase64) {
    const newObj = {
      title: text,
      img: imageBase64,
      songs: []
    };
    obj.push(newObj);

    setStoredPlaylist(obj);
    imageBase64 = '';
  } else {
    const newObj = {
      title: text,
      songs: []
    };
    obj.push(newObj);

    setStoredPlaylist(obj);
  };
};

function addSongToUserPlaylist(ellipsisContainer) {
  let playlistContainer = ellipsisContainer.querySelector('.select-pst');
  const obj = getStoredPlaylist();

  if (obj) {
    playlistContainer.innerHTML = '';
    obj.forEach((item, index) => {
      const html = `
        <div class="items-to-pst" data-pos="${index}">
          <p>${item.title}</p>
        </div>
      `;
      playlistContainer.innerHTML += html;
    });
  };
};

function songToPlaylist(id, playlist) {
  const obj = getStoredPlaylist();
  const songs = obj[Number(playlist)].songs;

  // Avoid Include the same ID Song
  if (!songs.includes(id)) {
    songs.push(id);
    setStoredPlaylist(obj);
  };
};

function loadPlaylistContent (position) {
  // Reset some values
  document.getElementById('pst-song-list').innerHTML = '';
  document.getElementById('ctn-pst-img').src = 'assets/images/default-icon.webp';

  const obj = getStoredPlaylist();
  const thisPlaylist = obj[position];
  
  // TOP: text content windows playlist
  document.getElementById('ctn-pst-ttle').innerHTML = thisPlaylist.title;
  document.getElementById('ctn-pst-qtt').innerHTML = thisPlaylist.songs.length + ' Songs';
  if (thisPlaylist.img) {
    document.getElementById('ctn-pst-img').src = thisPlaylist.img;
  }

  // Load the ArrayIndex variable with the id's of playlist songs
  songsToPlay = [];
  thisPlaylist.songs.forEach(song => songsToPlay.push(song));
  savedSongsToPlay = songsToPlay;
  console.log(songsToPlay)

  // fetching songs
  fetchSongs().then(dataSongs => {
    const fragment = document.createDocumentFragment();

    dataSongs.forEach(dataSong => {
      // Verificar que dataSong tiene un id
      if (dataSong.id && thisPlaylist.songs.some(song => song === dataSong.id)) {
        const html = `
          <li id="userSongPlaylist" class="userPlaylistItem" data-id="${dataSong.id}">
            <div id="lft-sng-pst-itm">
              <img src="assets/images/covers/${dataSong.cover}">
              <div>
                <span>${dataSong.name}</span>
                <p class="gray">${dataSong.artist}</p>
              </div>
            </div>
      
            <div id="rght-sng-pst-itm">
              <img src="assets/images/heart-regular.svg">
              <div class="pst-duration ">
                <p class="gray">${dataSong.duration}</p>
                <img src="assets/images/xmark-solid-gray.svg" class="rm-sg-fpst">
              </div>
            </div>
          </li>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        fragment.appendChild(tempDiv.firstElementChild);
      };
    });
    
    document.getElementById('pst-song-list').appendChild(fragment);
  });

};

function loadInitialSongsArray() {
  fetchSongs().then(songs => {
    songs.forEach(song => songsToPlay.push(song.id));
    loadMainStats();
  });
  savedSongsToPlay = songsToPlay;
};

async function searchBarData(query) {
  try {
    const response = await fetch('../data/songs.json');
    const data = await response.json();
    
    const filteredResults = data.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
    );
    
    showBarResults(filteredResults);
  } catch (error) {
      console.error('Error loading data:', error);
  }
};

function showBarResults(filteredResults) {
  searchResults.innerHTML = filteredResults.map(item =>
      `<div class="srch-item" data-id="${item.id}">
        <span>${item.name}</span>
        <p>${item.artist}</p>
      </div>
      `
  ).join('');
};

function clearResults() {
  searchResults.innerHTML = '';
};

function closeAllBtns() {
  const playlistItems = playlistContainer.querySelectorAll('li');
  
  playlistItems.forEach(item => {
    item.querySelector('#delete-btn-pst').style.display = 'none';
  });
};

function removePlaylist(position) {
  const obj = getStoredPlaylist();
  obj.splice(position, 1);
  setStoredPlaylist(obj);
};

function loadMainStats() {
  document.querySelector('#stat-tracks').innerHTML = songsToPlay.length;
  //document.querySelector('#stat-likes')
}


// --- Event Listers Functions ---
function setVolume(event) {
  if (currentAudio && volumeIcon.src.includes('assets/images/volume-up-line.svg')) {
    // Obtén el ancho del contenedor
    const ctnWidth = volumeLineContainer.offsetWidth;
    
    // Obtén la posición del clic dentro del contenedor
    const clickX = event.offsetX;
    
    // Calcula el nuevo volumen basado en la posición del clic (0 a 1)
    const newVolume = clickX / ctnWidth;
    originalVolume = newVolume;

    // Ajusta el volumen del audio
    currentAudio.volume = newVolume;
    
    // Ajusta el ancho de la barra de volumen para reflejar el cambio
    volumeLine.style.width = (newVolume * 100) + '%';
  };
};

function handlePlayButton() {
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
    };
    
  } else {
    playBtn.src = playIcon; // Cambia a la imagen de play
    currentAudio.pause();
  };
};

function handleSongClick(event) {
  const liElement = event.target.closest('li');
  liElement.classList.add('active');
  
  if (liElement && liElement.id === 'userSong' || liElement.id === 'userSongPlaylist') {
    const id = liElement.getAttribute('data-id'); // Obtener el ID desde el data-attribute
    playSongById(id);
  };
};

function convertPlaylistImage() {
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
      };
    };
    // Leemos el archivo como una URL de datos
    reader.readAsDataURL(file);
  } else {
    document.getElementById('pst-no-file').innerHTML = 'No File Selected';
  }
};

function handleAddButton() {
  if (event.target.classList.contains('ellipsis-btn')) {
    const liElement = event.target.closest('li');
    const ellipsisContainer = liElement.querySelector('.ellipsis-container');

    // Si hay un contenedor abierto, ciérralo
    if (openEllipsisContainer && openEllipsisContainer !== ellipsisContainer) {
      openEllipsisContainer.classList.remove('active');
    }

    // Muestra el contenedor clicado y actualiza el estado del contenedor abierto
    ellipsisContainer.classList.add('active');
    openEllipsisContainer = ellipsisContainer;
    addSongToUserPlaylist(ellipsisContainer);

    // Añade un listener al botón de cerrar dentro del contenedor
    liElement.querySelector('.close-elip').addEventListener('click', (closeEvent) => {
      closeEvent.stopPropagation(); // Evita que el clic en el botón de cerrar cierre el contenedor
      ellipsisContainer.classList.remove('active');
      openEllipsisContainer = null;
    });

    document.querySelectorAll('.items-to-pst').forEach(element => {
      element.addEventListener('click', (event) => {
        const id = liElement.getAttribute('data-id');
        let pos = event.target.getAttribute('data-pos');

        if (!pos) {
          pos = event.target.closest('div').getAttribute('data-pos');
        };
        
        songToPlaylist(id, pos);
        ellipsisContainer.classList.remove('active');
        openEllipsisContainer = null;
      });
    });
  };
};

function handleNavegationPaint(home, playlist, currentSong, window) {
  document.getElementById('home-window').style.display = home;
  document.getElementById('playlist-window').style.display = playlist;
  document.getElementById('window-pos').innerHTML = window;
  document.querySelector('#current-song-ctn').style.display = currentSong;
};

function shuffleArray(songsArr) {
  for (let i = songsArr.length - 1; i > 0; i--) {
    // Generar un índice aleatorio entre 0 y i
    const j = Math.floor(Math.random() * (i + 1));
    
    // Intercambiar los elementos en las posiciones i y j
    [songsArr[i], songsArr[j]] = [songsArr[j], songsArr[i]];
  }
  return songsArr;
};

// ----- | Event Listeners | ------

// Player
playBtn.addEventListener('click', handlePlayButton);
prevBtn.addEventListener('click', () => changeMusic(-1));
nextBtn.addEventListener('click', () => changeMusic(1));
playerProgress.addEventListener('click', setProgressBar);
volumeLineContainer.addEventListener('click', setVolume);
document.querySelector('#vol-icon').addEventListener('click', () => {
  if (currentAudio) {
    if (volumeIcon && volumeIcon.src.includes('assets/images/volume-up-line.svg')) {
      volumeIcon.src = 'assets/images/volume-xmark-solid.svg';
      currentAudio.volume = 0;
      volumeLine.style.width = '0%';
    } else {
      volumeIcon.src = 'assets/images/volume-up-line.svg';
      currentAudio.volume = originalVolume;
      volumeLine.style.width = (originalVolume * 100) + '%';
    };
  };
});

// Play a User's Song
userSongs.addEventListener('dblclick', (event) => {
  handleSongClick(event);
  removeActive('userSongItem');
});
// Play a Playlist Song
document.getElementById('pst-song-list').addEventListener('dblclick', (event) => {
  currentInterface = 'playlist'; // for inclue active className to the playlist ul none to the all user songs ul
  handleSongClick(event);
  removeActive('userPlaylistItem');
});
// Play user's Favorite Song
favoriteSongBtn.addEventListener('click', (event) => {
  const btn = event.target.closest('button');
  const id = btn.getAttribute('data-id'); // Obtener el ID desde el data-attribute
  playSongById(id);
});

// Playlist Creation
createPlaylistBtn.addEventListener('click', () => {
  playlistDialog.classList.add('hidden'); // Inicialmente escondido
  
  // Rest text before open dialog
  const userImg = document.getElementById('user-img-pst');
  document.getElementById('input-txt-pst').value = '';
  document.getElementById('pst-file').value = '';
  userImg.src = 'assets/images/default-icon.webp';
  

  playlistDialog.showModal();
  setTimeout(() => {
      playlistDialog.classList.remove('hidden');
      playlistDialog.classList.add('showing');
  }, 10); // Timeout pequeño para activar la animación
});
coverPlaylist.addEventListener('change', convertPlaylistImage);
formCreatePlaylist.addEventListener('submit', (event) => {
  event.preventDefault(); // Previene el comportamiento por defecto (recarga de página)
  const playlistName = document.getElementById('input-txt-pst').value;

  if (coverPlaylist) {
    updatePlaylist(playlistName); 
  };

  // Close Dialog
  playlistDialog.classList.remove('showing');
    setTimeout(() => {
        playlistDialog.close();
    }, 500); // Coincide con el tiempo de la transición CSS
});

// Add Song To A Playlist
userSongs.addEventListener('click', handleAddButton);

// Global Event to close containers
document.addEventListener('click', (event) => {
  // Solo cerrar el contenedor si está abierto y el clic fue fuera del contenedor y su botón
  if (openEllipsisContainer && !event.target.closest('.ellipsis-container') && !event.target.classList.contains('ellipsis-btn')) {
    openEllipsisContainer.classList.remove('active');
    openEllipsisContainer = null;
  };

  if (!event.target.closest('#delete-btn-pst')) { // Si le da click fuera del boton delete de un playlist item
    closeAllBtns();
  };
});

// navegation
playlistContainer.addEventListener('click', (event) => {
  const liElement = event.target.closest('li');
  
  if (liElement && !liElement.classList.contains('remove')) {
    removeActive('pst-item-side');
    document.querySelector('#song-playing').classList.remove('active');
    // Search position inside the array with playlists (localStorage)
    const pos = liElement.getAttribute('data-pos'); // Obtener el ID desde el data-attribute
    currentPlaylist = pos;
    loadPlaylistContent(Number(pos))

    homeNavegation.classList.remove('active');
    liElement.classList.add('active');

    handleNavegationPaint('none', 'block', 'none', 'Playlist');
  };
});
homeNavegation.addEventListener('click', () => {
  currentInterface = 'main';
  removeActive('pst-item-side');
  document.querySelector('#song-playing').classList.remove('active');
  !homeNavegation.classList.contains('active') && homeNavegation.classList.add('active');
  handleNavegationPaint('flex', 'none', 'none', 'Your Library');
  songsToPlay = [];
  loadInitialSongsArray();
});


// Search bar
searchBar.addEventListener('input', (event) => {
  const query = event.target.value;
  if (query.trim() === '') {
      clearResults();
  } else {
      searchBarData(query);
  };
});
searchBar.addEventListener('click', () => {
  document.getElementById('srch-rstls').style.display = 'flex';
  searchBarData();
});
searchResults.addEventListener('click', (event) => {
  const id = event.target.getAttribute('data-id');
  
  if (!id) {
    const div = event.target.closest('div').getAttribute('data-id');
    playSongById(div);
  } else {
    playSongById(id);
  };
  document.getElementById('srch-rstls').style.display = 'none';
});
searchBar.addEventListener('blur', () => {
  setTimeout(() => {document.getElementById('srch-rstls').style.display = 'none';}, 300);
  searchBar.value = '';
});

// Right click on a playlist item
playlistContainer.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  closeAllBtns();
  const element = event.target.closest('li');   
  const attribute = element.getAttribute('data-pos'); // posición del objeto en localStorage
  const deleteBtn = element.querySelector('#delete-btn-pst'); // Usa querySelector aquí

  if (deleteBtn) {
    deleteBtn.style.display = 'block';

    deleteBtn.addEventListener('click', () => {
      element.classList.add('remove');
      removePlaylist(attribute);
      console.log(`Este es el elemento a eliminar: ${attribute}`)
    });
  };
});
// Delete a song inside a playlist
document.getElementById('pst-song-list').addEventListener('click', (event) => {
  const attribute = event.target.closest('li').getAttribute('data-id');
  if (event.target.classList.contains('rm-sg-fpst')) {  // if it's an x-mark img
    const obj = getStoredPlaylist();
    const songs = obj[currentPlaylist].songs;
    const index = songs.indexOf(attribute);
    
    songs.splice(index, 1);
    
    setStoredPlaylist(obj);
    loadPlaylistContent(Number(currentPlaylist));
  }
});

// Play playlist button
document.querySelector('#play-pst').addEventListener('click', () => {
  playSongById(songsToPlay[0]);
  currentInterface = 'playlist';
});

// Current song window
document.querySelector('#song-playing').addEventListener('click', () => {
  removeActive('pst-item-side');
  document.querySelector('#song-playing').classList.add('active');
  homeNavegation.classList.remove('active');
  handleNavegationPaint('none', 'none', 'flex', '');
});

// Random Button
document.querySelector('#shuffle').addEventListener('click', (event)=> {
  const parent = event.target.parentElement;
  if (parent.classList.contains('active')) {
    parent.classList.remove('active');
    songsToPlay = savedSongsToPlay;
  } else {
    parent.classList.add('active');
    const neww = shuffleArray(songsToPlay.slice()); // don't change the original Array.
    songsToPlay = neww;
  };
});

// Replay Button
document.querySelector('#replay').addEventListener('click', (event)=> {
  const parent = event.target.parentElement;
  if (parent.classList.contains('active')) {
    parent.classList.remove('active');
    isRepeating = false;
  } else {
    parent.classList.add('active');
    isRepeating = true;
  };
});