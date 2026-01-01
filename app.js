async function fetchVenues(filters = {}) {
  const params = new URLSearchParams(filters);
  const url = `/api/venues?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Failed to fetch venues", res.status);
    return { featured: [], venues: [] };
  }
  return res.json();
}

function renderVenueCard(venue) {
  const card = document.createElement("article");
  card.className = "venue-card";

  const priceLabel =
    typeof venue.priceLevel === "number" && venue.priceLevel >= 0
      ? "$".repeat(venue.priceLevel || 1)
      : null;

  card.innerHTML = `
    <h3>${venue.name || "Untitled venue"}</h3>
    ${
      venue.city || venue.address
        ? `<p>${[venue.city, venue.address].filter(Boolean).join(" • ")}</p>`
        : ""
    }
    <div class="venue-meta">
      ${
        venue.rating
          ? `<span>⭐ ${venue.rating.toFixed(1)}${venue.reviewCount ? ` (${venue.reviewCount} reviews)` : ""}</span>`
          : ""
      }
      ${priceLabel ? `<span>${priceLabel}</span>` : ""}
    </div>
    ${
      venue.tags && venue.tags.length
        ? `<p class="venue-tags">${venue.tags.join(" • ")}</p>`
        : ""
    }
    ${
      venue.website
        ? `<a href="${venue.website}" target="_blank" rel="noopener noreferrer">Visit website</a>`
        : ""
    }
  `;

  return card;
}

function renderVenues({ featured, venues }) {
  const featuredGrid = document.getElementById("featured-grid");
  const venueGrid = document.getElementById("venue-grid");

  featuredGrid.innerHTML = "";
  venueGrid.innerHTML = "";

  featured.forEach((v) => {
    featuredGrid.appendChild(renderVenueCard(v));
  });

  venues.forEach((v) => {
    venueGrid.appendChild(renderVenueCard(v));
  });
}

async function applyFilters() {
  const cityInput = document.getElementById("filter-city");
  const ratingSelect = document.getElementById("filter-rating");

  const filters = {};
  if (cityInput.value.trim()) filters.city = cityInput.value.trim();
  if (ratingSelect.value) filters.minRating = ratingSelect.value;

  const data = await fetchVenues(filters);
  renderVenues(data);
}

async function init() {
  // initial load
  const data = await fetchVenues();
  renderVenues(data);

  const cityInput = document.getElementById("filter-city");
  const ratingSelect = document.getElementById("filter-rating");
  const resetBtn = document.getElementById("filter-reset");

  cityInput.addEventListener("input", () => {
    // debounce if you want, but simple is fine
    applyFilters();
  });

  ratingSelect.addEventListener("change", applyFilters);
  resetBtn.addEventListener("click", () => {
    cityInput.value = "";
    ratingSelect.value = "0";
    applyFilters();
  });
}

init();
