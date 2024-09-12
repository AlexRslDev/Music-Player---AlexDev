import { loadPlaylists } from '../scripts/home.js';

export function getStoredPlaylist() {
  const objStr = localStorage.getItem('storedPlaylist');
  const obj = JSON.parse(objStr); 
  return obj;
}

export function setStoredPlaylist(obj) {
  const updatePlaylists = JSON.stringify(obj);
  localStorage.setItem('storedPlaylist', updatePlaylists);
  loadPlaylists();
}