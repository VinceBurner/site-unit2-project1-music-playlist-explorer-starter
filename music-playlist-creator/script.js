window.addEventListener("DOMContentLoaded",() => {
    const gallery = document.getElementById("playlist-gallery");
    const modal = document.getElementById("modal");
    const closeButton = document.querySelector(".close-button");
    const modalImage = document.querySelector(".modal-details img");
    const modalTitle = document.querySelector(".modal-details h2");
    const modalAuthor = document.querySelector(".modal-details p");
    const songList = document.querySelector(".song-list");

    let playlistData = []

    fetch("data/data.json")
    .then(response => response.json())
    .then(data => {
        playlistsData = data.playlists;
        if (!data.playlists || data.playlists === 0) {
            gallery.innerHTML = "<p>No playlists added.</p>";
            return;
        }

        data.playlists.forEach(playlist => {
            const card = document.createElement("div");
            card.className = "playlist-card";
            card.innerHTML = `
            <img src="${playlist.playlist_art}" alt="Playlist Cover">
            <h3>${playlist.playlist_name}</h3>
            <p>by ${playlist.playlist_author}</p>
            <p>❤️ ${playlist.songs.length}</p>
            ' ;
            gallery.appendChild(card);
        });
    })
    .catch(error => {
        gallery.innerHTML = "<p>Error loading playlists.</p>";
        console.error("Fetch error: "error);
    });
});
