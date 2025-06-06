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

  let playlistsData = [];
  const likes = JSON.parse(localStorage.getItem("likedPlaylists")) || {};
  const randomBaseLikes = {};

  // Check if we have saved playlists in localStorage
  const savedPlaylists = JSON.parse(localStorage.getItem("savedPlaylists"));

  if (savedPlaylists) {
    // Use saved playlists from localStorage
    playlistsData = savedPlaylists;

    // Assign random base likes to each playlist if not already assigned
    playlistsData.forEach((p) => {
      if (!randomBaseLikes[p.playlistID]) {
        randomBaseLikes[p.playlistID] = Math.floor(Math.random() * 96) + 5; // Random between 5 and 100
      }
    });

    renderPlaylists(playlistsData);
  } else {
    // Load playlists from data.json if no saved playlists exist
    fetch("data/data.json")
      .then((res) => res.json())
      .then((data) => {
        playlistsData = data.playlists;

        // Assign random base likes to each playlist
        playlistsData.forEach((p) => {
          randomBaseLikes[p.playlistID] = Math.floor(Math.random() * 96) + 5; // Random between 5 and 100
        });

        renderPlaylists(playlistsData);
      });
  }

  function renderPlaylists(playlists) {
    gallery.innerHTML = "";

    playlists.forEach((playlist, index) => {
      const card = document.createElement("div");
      card.className = "playlist-card";
      card.dataset.index = index;

      const liked = likes[playlist.playlistID];
      const baseLikes =
        randomBaseLikes[playlist.playlistID] || playlist.songs.length;
      const totalLikes = liked ? baseLikes + 1 : baseLikes;

      // Card with image, name, artist, and buttons
      card.innerHTML = `
        <div class="playlist-card-image">
          <img src="${playlist.playlist_art}" alt="${
        playlist.playlist_name
      }" onerror="this.src='assets/img/playlist.png'">
        </div>
        <div class="card-body">
          <h3>${playlist.playlist_name}</h3>
          <p>by ${playlist.playlist_author}</p>
          <p>
            ❤️ <span class="like-count">${totalLikes}</span>
            <button class="like-btn">${liked ? "❤️" : "🤍"}</button>
          </p>
          <div class="card-buttons">
            <button class="edit-btn">✏️ Edit</button>
            <button class="delete-btn">🗑️ Delete</button>
          </div>
        </div>
      `;

      gallery.appendChild(card);

      // Get references to the buttons in the card
      const likeBtn = card.querySelector(".like-btn");
      const likeSpan = card.querySelector(".like-count");
      const editBtn = card.querySelector(".edit-btn");
      const deleteBtn = card.querySelector(".delete-btn");

      // Add event listener for like button
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

      // Add event listener for card click (show modal)
      card.addEventListener("click", () => {
        console.log("Opening modal for playlist:", playlist);
        console.log("Image path:", playlist.playlist_art);

        // Directly set the image source
        console.log("Setting image source to:", playlist.playlist_art);

        // Force the image to be visible with inline styles
        modalImage.setAttribute(
          "style",
          "display: block !important; " +
            "visibility: visible !important; " +
            "opacity: 1 !important; " +
            "width: 100% !important; " +
            "height: auto !important; " +
            "max-width: 100% !important;"
        );

        // Set the image source directly
        modalImage.src = playlist.playlist_art;

        // Add error handler to use fallback if image fails to load
        modalImage.onerror = function () {
          console.error("Failed to load image, using fallback");
          this.src = "assets/img/playlist.png";
        };

        modalTitle.textContent = playlist.playlist_name;
        modalAuthor.textContent = `by ${playlist.playlist_author}`;

        songList.innerHTML = "";

        const oldShuffle = modalContent.querySelector(".shuffle-button");
        if (oldShuffle) oldShuffle.remove();

        playlist.songs.forEach((song) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <div style="width: 100%;">
              <div style="font-weight: bold; font-size: 1.1rem;">${song.title}</div>
              <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                <span>${song.artist}</span>
                <span>${song.duration}</span>
              </div>
              <div style="color: #a0a0a0; font-size: 0.9rem; margin-top: 2px;">Album name</div>
            </div>
          `;
          songList.appendChild(li);
        });

        // Get the modal song container
        const modalSongContainer = modalContent.querySelector(
          ".modal-song-container"
        );

        // Create shuffle button
        const shuffleBtn = document.createElement("button");
        shuffleBtn.textContent = "🔀 Shuffle Songs";
        shuffleBtn.className = "shuffle-button";

        // Append to the song container, not the modal content
        modalSongContainer.appendChild(shuffleBtn);

        shuffleBtn.addEventListener("click", () => {
          const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
          songList.innerHTML = "";
          shuffled.forEach((song) => {
            const li = document.createElement("li");
            li.innerHTML = `
              <div style="width: 100%;">
                <div style="font-weight: bold; font-size: 1.1rem;">${song.title}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                  <span>${song.artist}</span>
                  <span>${song.duration}</span>
                </div>
                <div style="color: #a0a0a0; font-size: 0.9rem; margin-top: 2px;">Album name</div>
              </div>
            `;
            songList.appendChild(li);
          });
        });

        modal.classList.remove("hidden");
      });

      // Add event listener for edit button
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const newName = prompt("Edit name:", playlist.playlist_name);
        const newAuthor = prompt("Edit author:", playlist.playlist_author);
        const newSongs = prompt(
          "Edit songs (format: Title - Artist - MM:SS per line):",
          playlist.songs
            .map((song) => `${song.title} - ${song.artist} - ${song.duration}`)
            .join("\n")
        );

        if (newName && newAuthor && newSongs) {
          playlist.playlist_name = newName;
          playlist.playlist_author = newAuthor;
          playlist.songs = newSongs.split("\n").map((line) => {
            const [title, artist, duration] = line
              .split(" - ")
              .map((s) => s.trim());
            return { title, artist, duration };
          });

          // Save changes to localStorage
          localStorage.setItem("savedPlaylists", JSON.stringify(playlistsData));

          renderPlaylists(playlistsData);
        }
      });

      // Add event listener for delete button
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${playlist.playlist_name}"?`)) {
          playlistsData = playlistsData.filter(
            (p) => p.playlistID !== playlist.playlistID
          );

          // Save changes to localStorage
          localStorage.setItem("savedPlaylists", JSON.stringify(playlistsData));

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
    const filtered = playlistsData.filter(
      (p) =>
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
        const aLikes =
          (randomBaseLikes[a.playlistID] || a.songs.length) +
          (likes[a.playlistID] ? 1 : 0);
        const bLikes =
          (randomBaseLikes[b.playlistID] || b.songs.length) +
          (likes[b.playlistID] ? 1 : 0);
        return bLikes - aLikes;
      });
    }
    renderPlaylists(sorted);
  });

  // Define the handlePlaylistSubmit function first
  function handlePlaylistSubmit(e) {
    if (e) e.preventDefault();
    console.log("Form submission handler called");

    try {
      // Get form values
      const nameInput = document.getElementById("newName");
      const authorInput = document.getElementById("newAuthor");
      const songsInput = document.getElementById("newSongs");

      if (!nameInput || !authorInput || !songsInput) {
        console.error("Form inputs not found:", {
          nameInput,
          authorInput,
          songsInput,
        });
        alert("Error: Form inputs not found. Please refresh the page.");
        return;
      }

      const name = nameInput.value.trim();
      const author = authorInput.value.trim();
      const songsText = songsInput.value.trim();

      console.log("Form values:", { name, author, songsText });

      // Validate form values
      if (!name || !author || !songsText) {
        alert("Please fill in all fields");
        return;
      }

      // Parse songs
      const songs = songsText
        .split("\n")
        .map((line) => {
          const parts = line.split(" - ").map((s) => s.trim());
          if (parts.length < 3) {
            return null; // Invalid format
          }
          const [title, artist, duration] = parts;
          return { title, artist, duration };
        })
        .filter((song) => song !== null);

      console.log("Parsed songs:", songs);

      if (songs.length === 0) {
        alert(
          "Please add at least one song in the format: Title - Artist - Duration"
        );
        return;
      }

      // Create new playlist
      const newPlaylist = {
        playlistID: Date.now(),
        playlist_name: name,
        playlist_author: author,
        playlist_art: "assets/img/playlist.png",
        songs,
      };

      console.log("New playlist:", newPlaylist);

      // Add random likes
      randomBaseLikes[newPlaylist.playlistID] =
        Math.floor(Math.random() * 96) + 5;

      // Add to playlists data
      playlistsData.push(newPlaylist);

      console.log("Updated playlists data:", playlistsData);

      // Save to localStorage
      try {
        localStorage.setItem("savedPlaylists", JSON.stringify(playlistsData));
        console.log("Saved to localStorage");
      } catch (error) {
        console.error("Error saving to localStorage:", error);
        alert("Error saving playlist. Please try again.");
        return;
      }

      // Show success message
      alert("Playlist added successfully! Reloading page...");

      // Reload page
      window.location.reload();
    } catch (error) {
      console.error("Error in handlePlaylistSubmit:", error);
      alert("An error occurred while adding the playlist. Please try again.");
    }
  }

  // Set up form submission handler
  console.log("Setting up form submission handler");

  try {
    // Try multiple ways to get the form element
    const playlistForm =
      document.getElementById("playlistForm") ||
      document.querySelector("form#playlistForm") ||
      document.querySelector("form");

    console.log("Form element found:", playlistForm);

    if (playlistForm) {
      // Add submit event listener
      playlistForm.onsubmit = handlePlaylistSubmit;
      console.log("Submit event listener added to form using onsubmit");

      // Also add a direct click handler to the submit button
      const submitButton = playlistForm.querySelector("button[type='submit']");
      if (submitButton) {
        submitButton.onclick = function (e) {
          e.preventDefault();
          console.log("Submit button clicked directly");
          handlePlaylistSubmit(e);
        };
        console.log("Click event listener added to submit button");
      }
    } else {
      console.error("Form element not found!");

      // Add a direct button handler as a last resort
      const addButton = document.querySelector("button[type='submit']");
      if (addButton) {
        addButton.onclick = function (e) {
          e.preventDefault();
          console.log("Submit button clicked (fallback)");
          handlePlaylistSubmit(e);
        };
        console.log("Fallback click handler added to submit button");
      } else {
        console.error("Submit button not found!");
        alert("Error: Could not initialize form. Please refresh the page.");
      }
    }
  } catch (error) {
    console.error("Error setting up form handlers:", error);
  }
  // Function to render featured playlist from data.json
  function renderFeaturedPlaylist() {
    console.log("renderFeaturedPlaylist called");

    // Get featured page elements
    const featuredArt = document.getElementById("featured-art");
    const featuredTitle = document.getElementById("featured-title");
    const featuredAuthor = document.getElementById("featured-author");
    const featuredLikes = document.getElementById("featured-likes");
    const featuredSongList = document.getElementById("featured-song-list");

    console.log("Featured elements:", {
      featuredArt,
      featuredTitle,
      featuredAuthor,
      featuredLikes,
      featuredSongList,
    });

    // Check if we have all the required elements
    if (
      !featuredArt ||
      !featuredTitle ||
      !featuredAuthor ||
      !featuredSongList
    ) {
      console.error("Missing featured page elements");
      return;
    }

    console.log("Fetching playlist data for featured page");

    // Use saved playlists if available, otherwise fetch from data.json
    if (playlistsData && playlistsData.length > 0) {
      console.log("Using existing playlistsData");
      displayFeaturedPlaylist(playlistsData);
    } else {
      console.log("Fetching data.json");
      fetch("data/data.json")
        .then((response) => response.json())
        .then((data) => {
          console.log("Data fetched successfully:", data);
          displayFeaturedPlaylist(data.playlists);
        })
        .catch((error) => {
          console.error("Error fetching playlist data:", error);
        });
    }

    // Helper function to display a featured playlist
    function displayFeaturedPlaylist(playlists) {
      console.log("Displaying featured playlist");

      // Get a random playlist
      const random = playlists[Math.floor(Math.random() * playlists.length)];
      console.log("Selected random playlist:", random);

      // Get likes
      const likes = JSON.parse(localStorage.getItem("likedPlaylists")) || {};
      const isLiked = likes[random.playlistID];
      const baseLikes =
        randomBaseLikes[random.playlistID] || random.songs.length;
      const totalLikes = isLiked ? baseLikes + 1 : baseLikes;

      // Update UI
      featuredArt.src = random.playlist_art;
      featuredTitle.textContent = random.playlist_name;
      featuredAuthor.textContent = `by ${random.playlist_author}`;

      if (featuredLikes) {
        featuredLikes.textContent = `❤️ ${totalLikes}`;
      }

      featuredSongList.innerHTML = "";
      random.songs.forEach((song) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <img src="assets/img/song.png" alt="Song">
          <strong>${song.title}</strong> - ${song.artist} <span>${song.duration}</span>
        `;
        featuredSongList.appendChild(li);
      });

      console.log("Featured playlist displayed successfully");
    }
  }

  // Check if we're on the featured page and initialize it
  const isFeaturedPage = document.getElementById("featured-art") !== null;
  console.log("Is featured page:", isFeaturedPage);

  if (isFeaturedPage) {
    console.log("Initializing featured page");
    renderFeaturedPlaylist();
  }
});
