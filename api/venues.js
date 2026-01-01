// netlify/functions/venues.js

// Netlify functions run on Node 18+ so global fetch is available.

export default async function handler(req, res) {
  try {
    const { city, minRating } = req.query || {};

    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || "Venues";

    if (!apiKey || !baseId) {
      return res.status(500).json({ error: "Missing Airtable config" });
    }

    const formulaParts = ['{Status} = "Approved"'];

    if (city) {
      const safeCity = city.replace(/"/g, '\\"');
      formulaParts.push(`FIND(LOWER("${safeCity}"), LOWER({City}))`);
    }

    if (minRating) {
      const ratingNum = Number(minRating);
      if (!isNaN(ratingNum)) {
        formulaParts.push(`{Rating} >= ${ratingNum}`);
      }
    }

    const filterFormula =
      formulaParts.length === 1
        ? formulaParts[0]
        : `AND(${formulaParts.join(",")})`;

    const params = new URLSearchParams({
      filterByFormula: filterFormula,
      maxRecords: "200",
    });

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      tableName
    )}?${params.toString()}`;

    const airtableRes = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!airtableRes.ok) {
      console.error(await airtableRes.text());
      return res.status(500).json({ error: "Failed to query Airtable" });
    }

    const data = await airtableRes.json();

    const records = data.records || [];
    const venues = records.map((r) => {
      const f = r.fields || {};
      return {
        id: r.id,
        name: f["Name"] || "",
        city: f["City"] || "",
        address: f["Address"] || "",
        website: f["Website"] || "",
        rating: typeof f["Rating"] === "number" ? f["Rating"] : null,
        reviewCount:
          typeof f["Review Count"] === "number" ? f["Review Count"] : null,
        priceLevel:
          typeof f["Price Level"] === "number" ? f["Price Level"] : null,
        tags: Array.isArray(f["Tags"]) ? f["Tags"] : [],
        featured: !!f["Featured"],
      };
    });

    const featured = venues.filter((v) => v.featured);
    const nonFeatured = venues.filter((v) => !v.featured);

    return res.status(200).json({
      featured,
      venues: nonFeatured,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}

