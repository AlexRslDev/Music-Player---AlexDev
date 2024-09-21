import { globalDATA } from '../modules/globalData.js';
import { loadContent } from '../modules/loadContent.js';
import { getPlaysCount, updatePlayCount } from '../modules/playsCounter.js';
import { userSongsTemplate, artistTemplate, playlistContentTemplate, mainTopArtistsTemplate, favoriteSongTemplate } from '../modules/templates.js';
import { checkItem } from '../modules/favoriteSongs.js';
import { getFavoriteSong } from '../modules/favoriteSongComponent.js';
import { removeActive, includeActive } from '../utils/removeActive.js';
import { getStoredPlaylist, setStoredPlaylist } from '../utils/storedPlaylist.js';
import { getFavoritesSongs } from '../modules/favoriteSongs.js';

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
  artistsNavegation = document.querySelector('.artists-nav'),
  favoritesNavegation = document.querySelector('.favorites-nav'),
  searchBar = document.getElementById('srch-bar'),
  searchResults = document.getElementById('srch-rstls'),
  volumeIcon = document.querySelector('#vol-icon'),
  favoriteSongsContainer = document.querySelector('#fv-songs-ctn');

// Player icon path
const playIcon = 'assets/images/play-solid.svg',
  pauseIcon = 'assets/images/pause-solid.svg';

// Currents variables
let currentAudio,
  currentID,
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
  beforeRandom = [],
  originalVolume = 1,
  isRepeating;

export let isInPlaylist = false;

loader();
// Load Favorite Component
getFavoriteSong();
// Load Current user's song
getCurrentSong();
// load playlist
loadPlaylists();
// Load songs id's array with all user songs
loadInitialSongsArray();
loadUserSongsHTML();
loadMainTopArtists();


function loader() {
  setTimeout(() => {
    document.querySelector('#loader').style.display = 'none';
    document.querySelector('#app-container').style.display = 'grid';
  }, 2000);
};

// Include HTML user's songs on the container
async function loadUserSongsHTML() {
  await loadContent(globalDATA, '.userSongs', userSongsTemplate);
};

// Play music by ID
function playSongById(id) {
  // Stop song if another song is playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0; // Reiniciar el tiempo para que comience desde el inicio si se vuelve a reproducir
  };

  // Search for song by ID in song array.
  const song = globalDATA.find(song => song.id === id);

  // Search the index inside global songs array
  const indexPosition = songsToPlay.findIndex(element => element === id)
  musicIndex = indexPosition;

  currentPosition = savedSongsToPlay.findIndex(element => element === id);
  currentID = id;
  const currentSongLiked = document.querySelector('#crrt-sg-fv');
  currentSongLiked.setAttribute('data-id', `${id}`);
  loadLikeCurrentSong();

  if (song) {
    currentAudio = new Audio(song.path); // Crear un nuevo objeto Audio y asignarlo a currentAudio

    currentAudio.play()
      .then(() => {
        currentAudio.volume = originalVolume;
        controlActivesInterfaces(id);
        
        // guardar los datos de la cancion actual para el localStorage
        currentImg = `assets/images/covers/${song.cover}`;
        currentName = song.name;
        currentArtist = song.artist;

        // Cambiar los datos del player cuando se reproduce una nueva cancion
        playerImg.src = currentImg;
        playerTitle.innerHTML = currentName;
        playerArtist.innerHTML = currentArtist;

        loadMainTopArtists(currentInterface, id);

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
};

function controlActivesInterfaces(id) {
  switch (currentInterface) {
    case 'main':
      removeActive('userSongItem');
      includeActive('userSongItem', id);
      break;
    case 'playlist':
      removeActive('userPlaylistItem');
      includeActive('userPlaylistItem', id);
      break;
    case 'favorites':
      removeActive('userFavoriteItem');
      includeActive('userFavoriteItem', id);
      break;
    default:
      break;
  };
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
    const currentSongLiked = document.querySelector('#crrt-sg-fv');
    currentPosition = Number(savedSong.position);
    currentTimeSong = Number(savedSong.currentTimeSong);
    currentDurationSong = Number(savedSong.currentDurationSong);
    currentImg = savedSong.savedImg;
    currentName = savedSong.savedName;
    currentArtist = savedSong.savedArtist;
    musicIndex = Number(savedSong.position);
    currentSongLiked.setAttribute('data-id', `${savedSong.id}`);
    updateCurrentWdContent(currentImg, currentName, currentArtist);

    // Update UI // i can reuse with playSongById
    playerImg.src = currentImg;
    playerTitle.innerHTML = currentName;
    playerArtist.innerHTML = currentArtist;
    progress.style.width = `${(currentTimeSong / currentDurationSong) * 100}%`;
    loadLikeCurrentSong();
  };
};

export function loadLikeCurrentSong() {
  const currentSongLiked = document.querySelector('#crrt-sg-fv');
  currentSongLiked.src = checkItem(currentSongLiked.getAttribute('data-id'));
};

function updateCurrentSong() {
  let savedSong = JSON.parse(localStorage.getItem('currentSong')) || {};

  savedSong.id = currentID;
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

async function loadPlaylistContent(position) {
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
  //savedSongsToPlay = songsToPlay;

  // Filter the songs that are in the playlist
  const songsInPlaylist = globalDATA.filter(dataSong =>
    thisPlaylist.songs.includes(dataSong.id)
  );

  // Load the leaked songs
  await loadContent(songsInPlaylist, '#pst-song-list', playlistContentTemplate);
};

function loadInitialSongsArray() {
  globalDATA.forEach(song => songsToPlay.push(song.id));
  loadMainStats();
  savedSongsToPlay = songsToPlay;
};

async function searchBarData(query) {
  const filteredResults = globalDATA.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
  );
  
  showBarResults(filteredResults);
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

export function loadMainStats() {
  document.querySelector('#stat-tracks').innerHTML = songsToPlay.length;
  document.querySelector('#stat-likes').innerHTML = getFavoritesSongs().length;
}

async function loadMainTopArtists() {
  const count = getPlaysCount();
  const container = document.querySelector('#tp-art-ctn');
  
  if (count.length > 1) {
    let one,two,three,global = [];
    count.sort((a, b) => b.plays - a.plays);  // ORDER BY
    [one, two, three] = count;

    globalDATA.forEach(song => {
      switch (song.id) {
        case one?.id:
          ({ cover: one.cover, artist: one.artist } = song);
          break;
        
        case two?.id:
          ({ cover: two.cover, artist: two.artist } = song);
          break;

        case three?.id:
          ({ cover: three.cover, artist: three.artist } = song);
          break;

        default:
          break;
      };
    });
    if (one) global.push(one);
    if (two) global.push(two);
    if (three) global.push(three);

    container.innerHTML = '';
    await loadContent(global, '#tp-art-ctn', mainTopArtistsTemplate);
  } else {
    container.innerHTML = 'Start listening to get your stats...'
  };
};


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
      let obj = globalDATA[currentPosition];
      currentAudio = new Audio(obj.path);
      currentAudio.currentTime = currentTimeSong;
      currentAudio.play();
      // Inicia la actualización del progreso
      setInterval(() => {
        updateProgressBar();
      }, 100); // Actualiza el progreso cada segundo
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
  const id = liElement.getAttribute('data-id');
  if (!liElement.classList.contains('active')) {
    liElement.classList.add('active');
  };
  playSongById(id);
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

function handleNavegationPaint(home, playlist, currentSong, artists, favorites, window) {
  document.getElementById('home-window').style.display = home;
  document.getElementById('playlist-window').style.display = playlist;
  document.querySelector('#current-song-ctn').style.display = currentSong;
  document.querySelector('#artists-window').style.display = artists;
  document.querySelector('#favorites-window').style.display = favorites;
  document.getElementById('window-pos').innerHTML = window;
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

async function loadArtistsContent() {
  await loadContent(globalDATA, '#ats-ctn', artistTemplate);
};

async function loadFavoriteSongs() {
  const OBJ = getFavoritesSongs();

  if (OBJ && OBJ.length > -1) {
    const songsContainer = document.querySelector('#fv-songs-ctn');
    songsContainer.innerHTML = '';
    let songsInPlaylist = [];
    songsToPlay = [];

    OBJ.forEach(song => {
      songsToPlay.push(song)
      songsInPlaylist = [...songsInPlaylist, ...globalDATA.filter(dataSong => dataSong.id === song)];
    });

    // Load the leaked songs
    await loadContent(songsInPlaylist, '#fv-songs-ctn', favoriteSongTemplate);
  };
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
  removeActive('userSongItem');
  handleSongClick(event);
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
document.querySelector('#str-lkd-pst').addEventListener('click', () => {
  playSongById(songsToPlay[0]);
});
favoriteSongsContainer.addEventListener('dblclick', (event) => {
  removeActive('userFavoriteItem');
  handleSongClick(event);
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
    isInPlaylist = true;
    currentInterface = 'playlist';
    removeActive('pst-item-side');
    document.querySelector('#song-playing').classList.remove('active');
    artistsNavegation.classList.remove('active');
    favoritesNavegation.classList.remove('active');
    // Search position inside the array with playlists (localStorage)
    const pos = liElement.getAttribute('data-pos'); // Obtener el ID desde el data-attribute
    currentPlaylist = pos;
    loadPlaylistContent(Number(pos))

    homeNavegation.classList.remove('active');
    liElement.classList.add('active');

    handleNavegationPaint('none', 'block', 'none', 'none', 'none', 'Playlist');
  };
});
homeNavegation.addEventListener('click', () => {
  currentInterface = 'main';
  removeActive('pst-item-side');
  document.querySelector('#song-playing').classList.remove('active');
  artistsNavegation.classList.remove('active');
  favoritesNavegation.classList.remove('active');
  !homeNavegation.classList.contains('active') && homeNavegation.classList.add('active');
  handleNavegationPaint('flex', 'none', 'none', 'none', 'none', 'Your Library');
  songsToPlay = [];
  loadInitialSongsArray();
  loadUserSongsHTML();
});
document.querySelector('#song-playing').addEventListener('click', () => {
  removeActive('pst-item-side');
  document.querySelector('#song-playing').classList.add('active');
  homeNavegation.classList.remove('active');
  artistsNavegation.classList.remove('active');
  favoritesNavegation.classList.remove('active');
  handleNavegationPaint('none', 'none', 'flex', 'none', 'none', '');
});
artistsNavegation.addEventListener('click', () => {
  currentInterface = 'artists';
  removeActive('pst-item-side');
  homeNavegation.classList.remove('active');
  playlistContainer.classList.remove('active');
  favoritesNavegation.classList.remove('active');
  document.querySelector('#song-playing').classList.remove('active');
  !artistsNavegation.classList.contains('active') && artistsNavegation.classList.add('active');
  handleNavegationPaint('none', 'none', 'none', 'block', 'none', 'Artists');
  loadArtistsContent();
});
document.querySelector('#se-all-arts').addEventListener('click', () => {
  artistsNavegation.click();
});
favoritesNavegation.addEventListener('click', () => {
  currentInterface = 'favorites';
  removeActive('pst-item-side');
  homeNavegation.classList.remove('active');
  playlistContainer.classList.remove('active');
  document.querySelector('#song-playing').classList.remove('active');
  artistsNavegation.classList.remove('active');
  !favoritesNavegation.classList.contains('active') && favoritesNavegation.classList.add('active');
  handleNavegationPaint('none', 'none', 'none', 'none', 'block', 'Favorites');
  document.querySelector('#fv-sgs-count').innerHTML = `${getFavoritesSongs().length} Songs`;
  loadFavoriteSongs();
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
});

// Random Button
document.querySelector('#shuffle').addEventListener('click', (event)=> {
  const parent = event.target.parentElement;
  if (parent.classList.contains('active')) {
    parent.classList.remove('active');
    songsToPlay = beforeRandom;
  } else {
    parent.classList.add('active');
    beforeRandom = songsToPlay;
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
