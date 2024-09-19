import { loadLikeCurrentSong, loadMainStats, isInPlaylist } from '../scripts/home.js'

const userSongs = document.querySelector('.userSongs'),
  playlistSongs = document.getElementById('pst-song-list'),
  heartRegular = 'assets/images/heart-regular.svg',
  heartSolid = 'assets/images/heart-solid-liked.svg';

loadInitialArr();
const globalOBJ = getFavoritesSongs();

function loadInitialArr() {
  const init = getFavoritesSongs();
  if (!init) {
    localStorage.setItem('favoriteSongs', JSON.stringify([]));
  };
  // Set an empty array if key doesn'y exist.
};

export function getFavoritesSongs() {
  const obj = JSON.parse(localStorage.getItem('favoriteSongs'));
  return obj;
};

function setFavoritesSongs(ID) {
  if (globalOBJ.includes(ID)) {
    const i = globalOBJ.indexOf(ID);
    if (i > -1) {
      globalOBJ.splice(i, 1);
    };
  } else {
    globalOBJ.push(ID);
  };
  localStorage.setItem('favoriteSongs', JSON.stringify(globalOBJ));
};

function paintSongFavoriteState(event) {
  const img = event.target;
  let ID;

  if (img.hasAttribute('data-id')) {
    ID = img.getAttribute('data-id');
  } else {
    ID = img.closest('li').getAttribute('data-id');
  };

  if (img.src.includes('heart-regular.svg')) {
    img.src = heartSolid;
    setFavoritesSongs(ID);
    loadLikeCurrentSong();
  } else {
    img.src = heartRegular;
    setFavoritesSongs(ID);
    loadLikeCurrentSong();
  };

  loadMainStats();
};

export function checkItem(ID) {
  if (globalOBJ && globalOBJ.includes(`${ID}`)) {
    return heartSolid;
  } else {
    return heartRegular;
  };
};

function paintCurrentSongComponent(event, songsContainer) {
  const ID = event.target.getAttribute('data-id');

  const matchLi = Array.from(songsContainer.getElementsByTagName('li')).filter(li => li.getAttribute('data-id') === ID);
  const element = matchLi[0];
  const htmlCollection = element.getElementsByTagName('img');
  let imgToRender;

  Array.from(htmlCollection).forEach(img => {
    if (img.classList.contains('like-regular')) {
      imgToRender = img;
    }
  });

  if (imgToRender) {
    if (imgToRender.src.includes('heart-regular.svg')) {
      imgToRender.src = heartSolid;
    } else {
      imgToRender.src = heartRegular;
    };
  };
};

document.querySelector('#crrt-sg-fv').addEventListener('click', (event) => {
  paintSongFavoriteState(event);

  if (isInPlaylist) {
    paintCurrentSongComponent(event, playlistSongs);
  } else {
    paintCurrentSongComponent(event, userSongs);
  };
});
userSongs.addEventListener('click', (event) => {
  if (event.target.classList.contains('like-regular')) {
    paintSongFavoriteState(event);
  };
});
playlistSongs.addEventListener('click', (event) => {
  if (event.target.classList.contains('like-regular')) {
    paintSongFavoriteState(event);
    loadUserSongsHTML();
  };
});