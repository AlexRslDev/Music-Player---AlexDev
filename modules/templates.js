import { checkItem } from './favoriteSongs.js';

export const userSongsTemplate = (song) => `
  <li data-id="${song.id}" id="userSong" class="userSongItem">
    <div id="left-song-item">
      <img src="assets/images/covers/${song.cover}" alt="">
      <div>
        <span>${song.name}</span>
        <p class="gray">${song.artist}</p>
      </div>
    </div>

    <div id="right-song-item">
      <img src="${checkItem(song.id)}" class="like-regular">
      <div class="home-duration ">
        <p class="gray">${song.duration}</p>
        <img src="assets/images/plus-solid.svg" class="ellipsis-btn">
      </div>
    </div>

    <div class="ellipsis-container">
      <div id="top-elip">
        <img src="assets/images/xmark-solid-gray.svg" class="close-elip">
        <p>Add to playlist</p>
      </div>
      <div class="select-pst"></div>
    </div>
  </li>
`;

export const artistTemplate = (item) => `
  <div id="itm-ats">
    <img src="assets/images/covers/${item.cover}">
    <p>${item.artist}</p>
  </div>
`;

export const playlistContentTemplate = (dataSong) => `
  <li id="userSongPlaylist" class="userPlaylistItem" data-id="${dataSong.id}">
    <div id="lft-sng-pst-itm">
      <img src="assets/images/covers/${dataSong.cover}">
      <div>
        <span>${dataSong.name}</span>
        <p class="gray">${dataSong.artist}</p>
      </div>
    </div>

    <div id="rght-sng-pst-itm">
      <img src="${checkItem(dataSong.id)}" class="like-regular">
      <div class="pst-duration ">
        <p class="gray">${dataSong.duration}</p>
        <img src="assets/images/xmark-solid-gray.svg" class="rm-sg-fpst">
      </div>
    </div>
  </li>
`;

export const mainTopArtistsTemplate =  (item) => `
  <li>
    <img src="assets/images/covers/${item.cover}" alt="">
    <div>
      <span>${item.artist}</span>
      <p class="plays-art gray">${item.plays}</p>
    </div>
  </li>
`;

export const favoriteSongTemplate = (song) => `
  <li id="userSongFavorite" class="userFavoriteItem" data-id="${song.id}">
    <div id="lft-sng-fv-itm">
      <img src="assets/images/covers/${song.cover}">
      <div>
        <span>${song.name}</span>
        <p class="gray">${song.artist}</p>
      </div>
    </div>

    <div id="rght-sng-fv-itm">
      <img src="assets/images/heart-solid-liked.svg">
      <div class="fv-duration">
        <p class="gray">${song.duration}</p>
      </div>
    </div>
  </li>
`;