export function getStoredPlaylist () {
  const objStr = localStorage.getItem('storedPlaylist');
  const obj = JSON.parse(objStr); 
  return obj;
}