window.addEventListener("DOMContentLoaded", () => {
  let playlists = [];
  let currentPlaylist = null;
  const art = document.getElementById("featured-art");
  const name = document.getElementById("featured-name");
  const author = document.getElementById("featured-author");
  const songList = document.getElementById("featured-songs");
  const likeBtn = document.getElementById("like-button");
  const likeCount = document.getElementById("like-count");
  const likes = JSON.parse(localStorage.getItem("likedPlaylists")) || {};

  fetch("data/data.json")
    .then(response => response.json())
    .then(data => {
      playlists = data.playlists;
      loadRandomPlaylist();
    });

  function render(playlist) {
    currentPlaylist = playlist;

    art.src = playlist.playlist_art;
    name.textContent = playlist.playlist_name;
    author.textContent = `by ${playlist.playlist_author}`;

    const baseLikes = playlist.songs.length;
    const liked = likes[playlist.playlistID];
    likeCount.textContent = liked ? baseLikes + 1 : baseLikes;
    likeBtn.textContent = liked ? "❤️" : "🤍";

    songList.innerHTML = "";
    playlist.songs.forEach(song => {
      const li = document.createElement("li");
      li.textContent = `🎵 ${song}`;
      songList.appendChild(li);
    });
  }

  function loadRandomPlaylist() {
    const random = playlists[Math.floor(Math.random() * playlists.length)];
    render(random);
  }

  function loadMostLiked() {
    let max = -1;
    let top = playlists[0];

    playlists.forEach(p => {
      const score = p.songs.length + (likes[p.playlistID] ? 1 : 0);
      if (score > max) {
        max = score;
        top = p;
      }
    });

    render(top);
  }

  likeBtn.addEventListener("click", () => {
    const id = currentPlaylist.playlistID;
    const baseLikes = currentPlaylist.songs.length;

    if (likes[id]) {
      delete likes[id];
      likeBtn.textContent = "🤍";
      likeCount.textContent = baseLikes;
    } else {
      likes[id] = true;
      likeBtn.textContent = "❤️";
      likeCount.textContent = baseLikes + 1;
    }

    localStorage.setItem("likedPlaylists", JSON.stringify(likes));
  });

  document.getElementById("shuffle-featured").addEventListener("click", loadRandomPlaylist);
  document.getElementById("top-liked").addEventListener("click", loadMostLiked);
});
