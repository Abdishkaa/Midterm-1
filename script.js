const apiKey = "6e7ab2107e43b5c69b3d2754ed5fe799";
const baseUrl = "https://api.themoviedb.org/3";
const movieGrid = document.getElementById("movie-grid");
const suggestions = document.getElementById("suggestions");
const modal = document.getElementById("modal");

window.onload = () => fetchMovies();

function fetchMovies(sortBy = "popularity.desc") {
    fetch(`${baseUrl}/discover/movie?sort_by=${sortBy}&api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => displayMovies(data.results));
}

function displayMovies(movies) {
    movieGrid.innerHTML = movies.map(movie => `
        <div class="movie-item" onclick="showMovieDetails(${movie.id})">
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.release_date}</p>
                <button onclick="addToWatchlist(${movie.id}); event.stopPropagation();">Add to Watchlist</button>
            </div>
        </div>
    `).join("");
}

function autoSuggest() {
    const query = document.getElementById("movie-name").value;
    if (query.length > 2) {
        fetch(`${baseUrl}/search/movie?query=${query}&api_key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                suggestions.innerHTML = data.results
                    .map(movie => `<div onclick="selectMovie('${movie.title}')">${movie.title}</div>`)
                    .join("");
            });
    } else {
        suggestions.innerHTML = '';
    }
}

function selectMovie(title) {
    document.getElementById("movie-name").value = title;
    suggestions.innerHTML = '';
    searchMovies(title);
}

document.getElementById("search-btn").addEventListener("click", () => {
    const query = document.getElementById("movie-name").value;
    searchMovies(query);
});

function searchMovies(query) {
    fetch(`${baseUrl}/search/movie?query=${query}&api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => displayMovies(data.results));
}

function showMovieDetails(id) {
    fetch(`${baseUrl}/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos`)
        .then(response => response.json())
        .then(movie => {
            const cast = movie.credits.cast.slice(0, 5).map(actor => actor.name).join(", ");
            const trailer = movie.videos.results.find(video => video.type === "Trailer");

            document.getElementById("modal-body").innerHTML = `
                <h2>${movie.title}</h2>
                <p>${movie.overview}</p>
                <p><strong>Rating:</strong> ${movie.vote_average}</p>
                <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
                <p><strong>Cast:</strong> ${cast}</p>
                ${trailer ? `<a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank">Watch Trailer</a>` : ""}
            `;
            modal.style.display = "flex";
        });
}

function closeModal() {
    modal.style.display = "none";
}

function addToWatchlist(id) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    if (!watchlist.includes(id)) {
        watchlist.push(id);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        alert("Movie added to watchlist!");
    }
}
