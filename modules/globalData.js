export const globalDATA = await loadGlobalData();

async function loadGlobalData() {
  try {
    const response = await fetch('../data/songs.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error to load global data:', error)
  };
};