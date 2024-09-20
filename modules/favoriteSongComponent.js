import { globalDATA } from './globalData.js';
import { getPlaysCount } from './playsCounter.js';

// DOM Elements
const favoriteName = document.getElementById('fv-name'),
      favoriteArtist = document.getElementById('fv-art'),
      favoritePlays = document.getElementById('plays-fv'),
      favoriteImg = document.getElementById('fv-img'),
      favoriteSongBtn = document.getElementById('fv-song-btn');
      
      

export async function getFavoriteSong() {
  const object = getPlaysCount();
  if (object[0] !== undefined) {
    let plays = object[0].plays;
    let name;
    let artist;
    let id = object[0].id;

    if (plays) {
      object.forEach((song) => {
        if (song.plays > plays) {
          plays = song.plays; // Corregido de song.play a song.plays
          id = song.id;
        }
      });
    } else {
      return;
    };

    globalDATA.forEach(song => {
      if (song.id === id) {
        name = song.name;
        artist = song.artist;
      };
    });

    favoriteSongBtn.dataset.id = id;
    favoriteName.innerHTML = name;
    favoriteArtist.innerHTML = artist;
    favoritePlays.innerHTML = plays + ' Plays';
    favoriteImg.src = `assets/images/covers/${artist}.webp`;
  };
};