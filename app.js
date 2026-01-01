// app.js

async function fetchVenues(filters = {}) {
  const params = new URLSearchParams(filters);
  const url = `/api/venues?${params.toString()}`;

  console.log("Fetching venues from:", url);

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Failed to fetch venues", res.status);
    return { featured: [], venues: [] };
  }

  const data = await res.json();
  console.log("API response:", data);
  return data;
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
        typeof venue.rating === "number"
          ? `<span>⭐ ${venue.rating.toFixed(1)}${
              venue.reviewCount ? ` (${venue.reviewCount} reviews)` : ""
            }</span>`
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
        ? `<a href="${
            venue.website.startsWith("http")
              ? venue.website
              : "https://" + venue.website
          }" target="_blank" rel="noopener noreferrer">Visit website</a>`
        : ""
    }
  `;

  return card;
}

function renderVenues(data) {
  const featuredGrid = document.getElementById("featured-grid");
  const venueGrid = document.getElementById("venue-grid");

  if (!featuredGrid && !venueGrid) {
    console.error("No grids found in DOM");
    return;
  }

  const featured = Array.isArray(data.featured) ? data.featured : [];
  const venues = Array.isArray(data.venues) ? data.venues : [];

  // Clear existing
  if (featuredGrid) featuredGrid.innerHTML = "";
  if (venueGrid) venueGrid.innerHTML = "";

  // If we have a featured grid, put featured there
  if (featuredGrid) {
    featured.forEach((v) => {
      featuredGrid.appendChild(renderVenueCard(v));
    });
  }

  // All venues (non-featured)
  if (venueGrid) {
    venues.forEach((v) => {
      venueGrid.appendChild(renderVenueCard(v));
    });

    // If there is no featured grid, or if we want everything visible anyway,
    // also show featured items in the main grid as a fallback:
    if (!featuredGrid || venues.length === 0) {
      featured.forEach((v) => {
        venueGrid.appendChild(renderVenueCard(v));
      });
    }
  }
}

async function applyFilters() {
  const cityInput = document.getElementById("filter-city");
  const ratingSelect = document.getElementById("filter-rating");

  const filters = {};
  if (cityInput && cityInput.value.trim()) {
    filters.city = cityInput.value.trim();
  }
  if (ratingSelect && ratingSelect.value) {
    filters.minRating = ratingSelect.value;
  }

  const data = await fetchVenues(filters);
  renderVenues(data);
}

async function init() {
  console.log("Initializing venue UI…");

  // Initial load
  const data = await fetchVenues();
  renderVenues(data);

  // Wire up filters if they exist
  const cityInput = document.getElementById("filter-city");
  const ratingSelect = document.getElementById("filter-rating");
  const resetBtn = document.getElementById("filter-reset");

  if (cityInput) {
    cityInput.addEventListener("input", () => {
      applyFilters();
    });
  }

  if (ratingSelect) {
    ratingSelect.addEventListener("change", () => {
      applyFilters();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (cityInput) cityInput.value = "";
      if (ratingSelect) ratingSelect.value = "0";
      applyFilters();
    });
  }
}

// Ensure DOM is ready
document.addEventListener("DOMContentLoaded", init);
