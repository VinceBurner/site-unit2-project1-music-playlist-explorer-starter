window.addEventListener("DOMContentLoaded", () => {
  console.log("Featured.js loaded");

  let playlists = [];

  // Get elements from the featured page
  const art = document.getElementById("featured-art");
  const playlistNameUnderImage = document.getElementById(
    "featured-playlist-name"
  );
  const title = document.getElementById("featured-title");
  const author = document.getElementById("featured-author");
  const likes = document.getElementById("featured-likes");
  const songList = document.getElementById("featured-song-list");

  console.log("Featured elements:", {
    art,
    playlistNameUnderImage,
    title,
    author,
    likes,
    songList,
  });

  // Check if elements exist
  if (!art || !title || !author || !songList || !playlistNameUnderImage) {
    console.error("Missing featured page elements");
    return;
  }

  // Get saved playlists from localStorage
  const savedPlaylists = JSON.parse(localStorage.getItem("savedPlaylists"));
  const likedPlaylists =
    JSON.parse(localStorage.getItem("likedPlaylists")) || {};

  console.log("Loading playlists for featured page");

  // Use saved playlists if available, otherwise fetch from data.json
  if (savedPlaylists && savedPlaylists.length > 0) {
    console.log("Using saved playlists from localStorage");
    playlists = savedPlaylists;
    loadRandomPlaylist();
  } else {
    console.log("Fetching playlists from data.json");
    fetch("data/data.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Data fetched successfully:", data);
        playlists = data.playlists;
        loadRandomPlaylist();
      })
      .catch((error) => {
        console.error("Error fetching playlist data:", error);
      });
  }

  // Function to render a playlist on the featured page
  function render(playlist) {
    console.log("Rendering playlist:", playlist);

    // Update UI elements
    console.log("Setting featured image src to:", playlist.playlist_art);

    // Force the image to be visible with inline styles
    art.setAttribute(
      "style",
      "display: block !important; " +
        "visibility: visible !important; " +
        "opacity: 1 !important; " +
        "width: 100% !important; " +
        "height: auto !important; " +
        "max-width: 100% !important;"
    );

    // Set the image source directly
    art.src = playlist.playlist_art;

    // Add error handler to use fallback if image fails to load
    art.onerror = function () {
      console.error("Failed to load featured image, using fallback");
      this.src = "assets/img/playlist.png";
    };

    // Set the playlist name under the image
    playlistNameUnderImage.textContent = playlist.playlist_name;

    // Set the title and author in the details section
    title.textContent = playlist.playlist_name;
    author.textContent = `by ${playlist.playlist_author}`;

    // Calculate likes
    const baseLikes = Math.floor(Math.random() * 96) + 5;
    const liked = likedPlaylists[playlist.playlistID];
    const totalLikes = liked ? baseLikes + 1 : baseLikes;

    // Update likes display if element exists
    if (likes) {
      likes.textContent = `❤️ ${totalLikes}`;
    }

    // Render songs with the specified layout
    songList.innerHTML = "";
    playlist.songs.forEach((song) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div style="width: 100%;">
          <div style="font-weight: bold; font-size: 1.1rem;">${song.title}</div>
          <div style="font-size: 0.9rem; margin-top: 4px;">${song.artist}</div>
          <div style="font-size: 0.9rem; color: #a0a0a0;">${song.duration}</div>
        </div>
      `;
      songList.appendChild(li);
    });

    console.log("Playlist rendered successfully");
  }

  // Function to load a random playlist
  function loadRandomPlaylist() {
    if (playlists.length === 0) {
      console.error("No playlists available");
      return;
    }

    const random = playlists[Math.floor(Math.random() * playlists.length)];
    render(random);
  }
});
