// api/venues.js

export default async function handler(req, res) {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || "Venues";

    if (!apiKey || !baseId) {
      console.error("Missing Airtable config", { apiKey: !!apiKey, baseId: !!baseId });
      return res.status(500).json({ 
        error: "Missing Airtable config. Check AIRTABLE_API_KEY and AIRTABLE_BASE_ID env vars." 
      });
    }

    // For now: no filters, no view. Just grab up to 50 rows from the table.
    const params = new URLSearchParams({
      maxRecords: "50",
    });

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      tableName
    )}?${params.toString()}`;

    const airtableRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const text = await airtableRes.text(); // read body either way

    if (!airtableRes.ok) {
      console.error("Airtable error:", airtableRes.status, text);
      return res.status(500).json({
        error: "Airtable error",
        status: airtableRes.status,
        details: text, // <- this is what we need to see
      });
    }

    const data = JSON.parse(text);

    const records = data.records || [];
    const venues = records.map((r) => {
      const f = r.fields || {};
      return {
        id: r.id,
        name: f["Name"] || "",
        city: f["City"] || f["Location"] || "",
        address: f["Address"] || "",
        website: f["Website"] || "",
        rating: typeof f["Rating"] === "number" ? f["Rating"] : null,
        reviewCount:
          typeof f["Review Count"] === "number" ? f["Review Count"] : null,
        priceLevel:
          typeof f["Price Level"] === "number" ? f["Price Level"] : null,
        tags: Array.isArray(f["Tags"]) ? f["Tags"] : [],
        featured: !!f["Featured"],
        photoRef: f["Photo Ref"] || null,
      };
    });

    return res.status(200).json({
      featured: [],
      venues,
    });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: "Server error", details: String(e) });
  }
}
