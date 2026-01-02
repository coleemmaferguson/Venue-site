function renderVenueCard(venue) {
  const card = document.createElement("article");
  card.className = "venue-card";

  const imageHTML = venue.imageUrl
    ? `<img class="venue-image" src="${venue.imageUrl}" alt="${venue.name || "Venue"}" loading="lazy" />`
    : "";

  card.innerHTML = `
    ${imageHTML}
    <h3>${venue.name || "Untitled venue"}</h3>
    <p>${[venue.city, venue.address].filter(Boolean).join(" • ")}</p>
    ${venue.website ? `<a href="${venue.website.startsWith("http") ? venue.website : "https://" + venue.website}" target="_blank" rel="noopener noreferrer">Visit website</a>` : ""}
  `;

  return card;
}
