// Función para obtener el conteo de las reproducciones
export function getPlaysCount() {
  // Recupera el conteo desde localStorage
  const playsCounts = JSON.parse(localStorage.getItem('playsCounts')) || [];
  return playsCounts;
}

// Función para actualizar el conteo de reproducciones de una canción
export function updatePlayCount(songId) {
  // Recupera el conteo actual desde localStorage
  const playsCounts = JSON.parse(localStorage.getItem('playsCounts')) || [];
  
  // Encuentra el objeto de la canción con el id dado
  const song = playsCounts.find(song => song.id === songId);

  if (song) {
    // Si la canción ya existe, incrementa el conteo de reproducciones
    song.plays++;
  } else {
    // Si la canción no existe, añade un nuevo objeto con id y un conteo inicial de 1
    playsCounts.push({ id: songId, plays: 1 });
  }
  
  // Guarda el conteo actualizado en localStorage
  localStorage.setItem('playsCounts', JSON.stringify(playsCounts));
}