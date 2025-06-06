window.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("playlist-gallery");
  const modal = document.getElementById("modal");
  const closeButton = modal.querySelector(".close-button");
  const modalContent = modal.querySelector(".modal-content");
  const modalImage = modal.querySelector(".modal-details img");
  const modalTitle = modal.querySelector(".modal-details h2");
  const modalAuthor = modal.querySelector(".modal-details p");
  const songList = modal.querySelector(".song-list");
  const searchBar = document.getElementById("searchBar");
  const sortBy = document.getElementById("sortBy");
  const form = document.getElementById("playlistForm");

  let playlistsData = [];
  const likes = JSON.parse(localStorage.getItem("likedPlaylists")) || {};
  const randomBaseLikes = {};

  fetch("data/data.json")
    .then(res => res.json())
    .then(data => {
      playlistsData = data.playlists;

      // Assign random base likes to each playlist
      playlistsData.forEach(p => {
        randomBaseLikes[p.playlistID] = Math.floor(Math.random() * 96) + 5; // Random between 5 and 100
      });

      renderPlaylists(playlistsData);
    });

  function renderPlaylists(playlists) {
    gallery.innerHTML = "";

    playlists.forEach((playlist, index) => {
      const card = document.createElement("div");
      card.className = "playlist-card";
      card.dataset.index = index;

      const liked = likes[playlist.playlistID];
      const baseLikes = randomBaseLikes[playlist.playlistID] || playlist.songs.length;
      const totalLikes = liked ? baseLikes + 1 : baseLikes;

      card.innerHTML = `
        <img src="${playlist.playlist_art}" alt="Playlist Art">
        <h3>${playlist.playlist_name}</h3>
        <p>by ${playlist.playlist_author}</p>
        <p>
          ❤️ <span class="like-count">${totalLikes}</span>
          <button class="like-btn">${liked ? "❤️" : "🤍"}</button>
        </p>
      `;

      const actions = document.createElement("div");
      actions.className = "playlist-actions";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️ Edit";
      editBtn.className = "edit-btn";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Delete";
      deleteBtn.className = "delete-btn";

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      card.appendChild(actions);
      gallery.appendChild(card);

      const likeBtn = card.querySelector(".like-btn");
      const likeSpan = card.querySelector(".like-count");

      likeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const likedNow = likes[playlist.playlistID];
        let count = parseInt(likeSpan.textContent);

        if (likedNow) {
          delete likes[playlist.playlistID];
          likeBtn.textContent = "🤍";
          likeSpan.textContent = count - 1;
        } else {
          likes[playlist.playlistID] = true;
          likeBtn.textContent = "❤️";
          likeSpan.textContent = count + 1;
        }

        localStorage.setItem("likedPlaylists", JSON.stringify(likes));
      });

      card.addEventListener("click", () => {
        modalImage.src = playlist.playlist_art;
        modalTitle.textContent = playlist.playlist_name;
        modalAuthor.textContent = `by ${playlist.playlist_author}`;
        songList.innerHTML = "";

        const oldShuffle = modalContent.querySelector(".shuffle-button");
        if (oldShuffle) oldShuffle.remove();

        playlist.songs.forEach(song => {
          const li = document.createElement("li");
          li.textContent = `🎵 ${song.title} - ${song.artist} (${song.duration})`;
          songList.appendChild(li);
        });

        const shuffleBtn = document.createElement("button");
        shuffleBtn.textContent = "🔀 Shuffle Songs";
        shuffleBtn.className = "shuffle-button";
        modalContent.appendChild(shuffleBtn);

        shuffleBtn.addEventListener("click", () => {
          const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
          songList.innerHTML = "";
          shuffled.forEach(song => {
            const li = document.createElement("li");
            li.textContent = `🎵 ${song.title} - ${song.artist} (${song.duration})`;
            songList.appendChild(li);
          });
        });

        modal.classList.remove("hidden");
      });

      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const newName = prompt("Edit name:", playlist.playlist_name);
        const newAuthor = prompt("Edit author:", playlist.playlist_author);
        const newSongs = prompt("Edit songs (format: Title - Artist - MM:SS per line):", playlist.songs.map(song => `${song.title} - ${song.artist} - ${song.duration}`).join("\n"));

        if (newName && newAuthor && newSongs) {
          playlist.playlist_name = newName;
          playlist.playlist_author = newAuthor;
          playlist.songs = newSongs.split("\n").map(line => {
            const [title, artist, duration] = line.split(" - ").map(s => s.trim());
            return { title, artist, duration };
          });
          renderPlaylists(playlistsData);
        }
      });

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${playlist.playlist_name}"?`)) {
          playlistsData = playlistsData.filter(p => p.playlistID !== playlist.playlistID);
          renderPlaylists(playlistsData);
        }
      });
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target === closeButton) {
      modal.classList.add("hidden");
    }
  });

  searchBar.addEventListener("input", () => {
    const query = searchBar.value.toLowerCase();
    const filtered = playlistsData.filter(p =>
      p.playlist_name.toLowerCase().includes(query) ||
      p.playlist_author.toLowerCase().includes(query)
    );
    renderPlaylists(filtered);
  });

  sortBy.addEventListener("change", () => {
    let sorted = [...playlistsData];
    if (sortBy.value === "name") {
      sorted.sort((a, b) => a.playlist_name.localeCompare(b.playlist_name));
    } else if (sortBy.value === "likes") {
      sorted.sort((a, b) => {
        const aLikes = (randomBaseLikes[a.playlistID] || a.songs.length) + (likes[a.playlistID] ? 1 : 0);
        const bLikes = (randomBaseLikes[b.playlistID] || b.songs.length) + (likes[b.playlistID] ? 1 : 0);
        return bLikes - aLikes;
      });
    }
    renderPlaylists(sorted);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("newName").value.trim();
    const author = document.getElementById("newAuthor").value.trim();
    const songs = document.getElementById("newSongs").value.split("\n").map(line => {
      const [title, artist, duration] = line.split(" - ").map(s => s.trim());
      return { title, artist, duration };
    }).filter(song => song.title && song.artist && song.duration);

    if (!name || !author || songs.length === 0) return;

    const newPlaylist = {
      playlistID: Date.now(),
      playlist_name: name,
      playlist_author: author,
      playlist_art: "assets/img/playlist.png",
      songs
    };

    randomBaseLikes[newPlaylist.playlistID] = Math.floor(Math.random() * 96) + 5;

    playlistsData.push(newPlaylist);
    renderPlaylists(playlistsData);
    form.reset();
  });
});

function formatTotalDuration(songs) {
  let totalSeconds = 0;
  songs.forEach(song => {
    const [m, s] = song.duration.split(":").map(Number);
    totalSeconds += m * 60 + s;
  });
  const mm = Math.floor(totalSeconds / 60).toString();
  const ss = (totalSeconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function renderFeatured() {
  const randIndex = Math.floor(Math.random() * playlistsData.length);
  const pl = playlistsData[randIndex];

  const featuredArt = document.getElementById("featured-art");
  const featuredTitle = document.getElementById("featured-title");
  const featuredAuthor = document.getElementById("featured-author");
  const featuredTotal = document.getElementById("featured-total-duration");
  const featuredSongList = document.getElementById("featured-song-list");

  featuredArt.src = pl.playlist_art;
  featuredTitle.textContent = pl.playlist_name;
  featuredAuthor.textContent = `by ${pl.playlist_author}`;
  featuredTotal.textContent = `Total Duration: ${formatTotalDuration(pl.songs)}`;

  featuredSongList.innerHTML = "";
  pl.songs.forEach(song => {
    const li = document.createElement("li");
    li.textContent = `🎵 ${song.title} – ${song.artist} (${song.duration})`;
    featuredSongList.appendChild(li);
  });
}

function renderFeaturedPlaylist() {
  const featuredArt = document.getElementById("featured-art");
  const featuredTitle = document.getElementById("featured-title");
  const featuredAuthor = document.getElementById("featured-author");
  const featuredLikes = document.getElementById("featured-likes");
  const featuredSongList = document.getElementById("featured-song-list");

  if (!featuredArt || !featuredTitle || !featuredAuthor || !featuredSongList) return;

  fetch("data/data.json")
    .then(response => response.json())
    .then(data => {
      const playlists = data.playlists;
      const likes = JSON.parse(localStorage.getItem("likedPlaylists")) || {};
      const random = playlists[Math.floor(Math.random() * playlists.length)];
      const isLiked = likes[random.playlistID];
      const baseLikes = random.likes || 0;
      const totalLikes = isLiked ? baseLikes + 1 : baseLikes;

      featuredArt.src = random.playlist_art;
      featuredTitle.textContent = random.playlist_name;
      featuredAuthor.textContent = `by ${random.playlist_author}`;
      featuredLikes.textContent = `❤️ ${totalLikes}`;

      featuredSongList.innerHTML = "";
      random.songs.forEach(song => {
        const li = document.createElement("li");
        li.innerHTML = `
          <img src="assets/img/song.png" alt="Song">
          <strong>${song.title}</strong> - ${song.artist} <span>${song.duration}</span>
        `;
        featuredSongList.appendChild(li);
      });
    });
}

window.addEventListener("DOMContentLoaded", renderFeaturedPlaylist);

