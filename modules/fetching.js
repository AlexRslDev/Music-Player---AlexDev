export function fetchSongs() {
  return fetch('../data/songs.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error loading JSON file');
      }
      return response.json();
    })
    .catch(error => {
      console.error(error);
    });
};
