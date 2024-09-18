import { loadLikeCurrentSong } from '../scripts/home.js'

const userSongs = document.querySelector('.userSongs'),
  heartRegular = 'assets/images/heart-regular.svg',
  heartSolid = 'assets/images/heart-solid-liked.svg';

loadInitialArr();
const globalOBJ = getFavoritesSongs();
//console.log(globalOBJ)

function loadInitialArr() {
  const init = getFavoritesSongs();
  if (!init) {
    localStorage.setItem('favoriteSongs', JSON.stringify([]));
  };
  // Set an empty array if key doesn'y exist.
};

function getFavoritesSongs() {
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
};

export function checkItem(ID) {
  if (globalOBJ && globalOBJ.includes(`${ID}`)) {
    return heartSolid;
  } else {
    return heartRegular;
  };
};

document.querySelectorAll('.like-regular').forEach(heart => heart.addEventListener('click', paintSongFavoriteState));
userSongs.addEventListener('click', (event) => {
  if (event.target.classList.contains('like-regular')) {
    paintSongFavoriteState(event);
  };
});