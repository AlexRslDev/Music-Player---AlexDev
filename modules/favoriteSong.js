import { fetchSongs } from './fetching.js';
import { getPlaysCount } from './playsCounter.js';

// DOM Elements
const favoriteName = document.getElementById('fv-name'),
      favoriteArtist = document.getElementById('fv-art'),
      favoritePlays = document.getElementById('plays-fv'),
      favoriteImg = document.getElementById('fv-img'),
      favoriteSongBtn = document.getElementById('fv-song-btn');
      
      

export async function getFavoriteSong() {
  const object = getPlaysCount();
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
    console.log('No hay canciones guardadas');
    return { name: null, artist: null }; // Devuelve un objeto vacío si no hay canciones
  }

  // Espera a que fetchSongs() se resuelva
  const songs = await fetchSongs();

  if (songs) {
    songs.forEach(song => {
      if (song.id === id) {
        name = song.name;
        artist = song.artist;
      }
    });

    favoriteSongBtn.dataset.id = id;
    favoriteName.innerHTML = name;
    favoriteArtist.innerHTML = artist;
    favoritePlays.innerHTML = plays + ' Plays';
    favoriteImg.src = `assets/images/covers/${artist}.webp`
  };

  //console.log(`Your favorite song: ${name} by: ${artist}`);
  //return { name, artist, plays, id };
};