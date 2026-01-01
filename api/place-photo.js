// api/place-photo.js

export default async function handler(req, res) {
  try {
    const { ref, maxwidth } = req.query || {};
    const apiKey = process.env.PLACES_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Missing PLACES_API_KEY environment variable" });
    }

    if (!ref) {
      return res.status(400).json({ error: "Missing 'ref' query parameter" });
    }

    const width = maxwidth || "800";

    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${encodeURIComponent(
      width
    )}&photo_reference=${encodeURIComponent(ref)}&key=${encodeURIComponent(
      apiKey
    )}`;

    const photoRes = await fetch(url);

    if (!photoRes.ok) {
      const text = await photoRes.text();
      console.error("Photo API error:", photoRes.status, text);
      return res
        .status(500)
        .json({ error: "Failed to fetch photo from Google" });
    }

    const contentType =
      photoRes.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await photoRes.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // cache 1 day
    res.status(200).send(buffer);
  } catch (err) {
    console.error("place-photo error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
