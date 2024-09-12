// Función para obtener el conteo de las reproducciones
export function getPlaysCount() {
  // Recupera el conteo desde localStorage
  const playsCounts = JSON.parse(localStorage.getItem('playsCounts')) || []; // Buscar donde se usa
  return playsCounts;
};

// Función para actualizar el conteo de reproducciones de una canción
export function updatePlayCount(songId) {
  const playsCounts = getPlaysCount();
  // Encuentra el objeto de la canción con el id dado
  const song = playsCounts.find(song => song.id === songId);

  if (song) {
    song.plays++;
  } else {
    playsCounts.push({ id: songId, plays: 1 });
  };
  
  // Guarda el conteo actualizado en localStorage
  localStorage.setItem('playsCounts', JSON.stringify(playsCounts));
};