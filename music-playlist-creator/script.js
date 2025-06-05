window.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("playlist-gallery");
  const modal = document.getElementById("modal");
  const closeButton = modal.querySelector(".close-button");
  const modalContent = modal.querySelector(".modal-content");
  const modalImage = modal.querySelector(".modal-details img");
  const modalTitle = modal.querySelector(".modal-details h2");
  const modalAuthor = modal.querySelector(".modal-details p");
  const songList = modal.querySelector(".song-list");

  let playlistsData = [];
  const likes = JSON.parse(localStorage.getItem("likedPlaylists")) || {};

  fetch("data/data.json")
    .then(response => response.json())
    .then(data => {
      playlistsData = data.playlists;

      if (!playlistsData || playlistsData.length === 0) {
        gallery.innerHTML = "<p>No playlists available.</p>";
        return;
      }

      // Create playlist cards
      playlistsData.forEach((playlist, index) => {
        const card = document.createElement("div");
        card.className = "playlist-card";
        card.dataset.index = index;

        const liked = likes[playlist.playlistID];
        const initialLikes = playlist.songs.length + (liked ? 1 : 0);

        card.innerHTML = `
          <img src="${playlist.playlist_art}" alt="Playlist Art">
          <h3>${playlist.playlist_name}</h3>
          <p>by ${playlist.playlist_author}</p>
          <p>
            ❤️ <span class="like-count">${initialLikes}</span>
            <button class="like-btn">${liked ? "❤️" : "🤍"}</button>
          </p>
        `;
        gallery.appendChild(card);

        const likeBtn = card.querySelector(".like-btn");
        const likeSpan = card.querySelector(".like-count");

        likeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const likedNow = likes[playlist.playlistID];
          let count = parseInt(likeSpan.textContent);

          if (likedNow) {
            likes[playlist.playlistID] = false;
            likeBtn.textContent = "🤍";
            likeSpan.textContent = count - 1;
          } else {
            likes[playlist.playlistID] = true;
            likeBtn.textContent = "❤️";
            likeSpan.textContent = count + 1;
          }

          localStorage.setItem("likedPlaylists", JSON.stringify(likes));
        });

        // Open modal on card click
        card.addEventListener("click", () => {
          const playlist = playlistsData[index];

          modalImage.src = playlist.playlist_art;
          modalTitle.textContent = playlist.playlist_name;
          modalAuthor.textContent = `by ${playlist.playlist_author}`;

          // Remove any existing shuffle button (if reopening a modal)
          const existingShuffle = modalContent.querySelector(".shuffle-button");
          if (existingShuffle) {
            existingShuffle.remove();
          }

          // Create shuffle button
          const shuffleBtn = document.createElement("button");
          shuffleBtn.textContent = "🔀 Shuffle Songs";
          shuffleBtn.className = "shuffle-button";
          modalContent.insertBefore(shuffleBtn, songList);

          // Initial render of songs in order
          renderSongs(playlist.songs);

          // Shuffle functionality
          shuffleBtn.addEventListener("click", () => {
            const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
            renderSongs(shuffled);
          });

          modal.classList.remove("hidden");
        });
      });
    })
    .catch(error => {
      console.error("Error loading playlists:", error);
      gallery.innerHTML = "<p>Something went wrong loading playlists.</p>";
    });

  // Close modal on overlay click or close button click
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target === closeButton) {
      modal.classList.add("hidden");
    }
  });

  // Helper function to render songs with thumbnails and preview buttons
  function renderSongs(songArray) {
    songList.innerHTML = "";
    songArray.forEach(song => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="song-item">
          <img src="assets/img/song.png" alt="Song Icon" class="song-icon">
          <span>${song}</span>
          <button class="preview-btn">🎧 Preview</button>
        </div>
      `;
      songList.appendChild(li);
    });
  }
});
window.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("playlist-gallery");
  const modal = document.getElementById("modal");
  const closeButton = modal.querySelector(".close-button");
  const modalImage = modal.querySelector(".modal-details img");
  const modalTitle = modal.querySelector(".modal-details h2");
  const modalAuthor = modal.querySelector(".modal-details p");
  const songList = modal.querySelector(".song-list");
  const modalContent = modal.querySelector(".modal-content");
  const searchBar = document.getElementById("searchBar");
  const sortBy = document.getElementById("sortBy");
  const form = document.getElementById("playlistForm");

  let playlistsData = [];
  const likes = JSON.parse(localStorage.getItem("likedPlaylists")) || {};

  fetch("data/data.json")
    .then(res => res.json())
    .then(data => {
      playlistsData = data.playlists;
      renderPlaylists(playlistsData);
    });

  function renderPlaylists(playlists) {
    gallery.innerHTML = "";

    playlists.forEach((playlist, index) => {
      const card = document.createElement("div");
      card.className = "playlist-card";
      card.dataset.index = index;

      const liked = likes[playlist.playlistID];
      const initialLikes = playlist.songs.length + (liked ? 1 : 0);

      card.innerHTML = `
        <img src="${playlist.playlist_art}" alt="Playlist Art">
        <h3>${playlist.playlist_name}</h3>
        <p>by ${playlist.playlist_author}</p>
        <p>
          ❤️ <span class="like-count">${initialLikes}</span>
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
          li.textContent = `🎵 ${song}`;
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
            li.textContent = `🎵 ${song}`;
            songList.appendChild(li);
          });
        });

        modal.classList.remove("hidden");
      });

      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const newName = prompt("Edit name:", playlist.playlist_name);
        const newAuthor = prompt("Edit author:", playlist.playlist_author);
        const newSongs = prompt("Edit songs (comma-separated):", playlist.songs.join(", "));

        if (newName && newAuthor && newSongs) {
          playlist.playlist_name = newName;
          playlist.playlist_author = newAuthor;
          playlist.songs = newSongs.split(",").map(s => s.trim()).filter(Boolean);
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
        const aLikes = a.songs.length + (likes[a.playlistID] ? 1 : 0);
        const bLikes = b.songs.length + (likes[b.playlistID] ? 1 : 0);
        return bLikes - aLikes;
      });
    }
    renderPlaylists(sorted);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("newName").value.trim();
    const author = document.getElementById("newAuthor").value.trim();
    const songs = document.getElementById("newSongs").value.split("\n").map(s => s.trim()).filter(Boolean);

    if (!name || !author || songs.length === 0) return;

    const newPlaylist = {
      playlistID: Date.now(),
      playlist_name: name,
      playlist_author: author,
      playlist_art: "assets/img/playlist.png",
      songs: songs
    };

    playlistsData.push(newPlaylist);
    renderPlaylists(playlistsData);
    form.reset();
  });
});
