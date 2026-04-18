import { NextRequest } from "next/server";

export const runtime = "nodejs";

// GET /api/location/reverse?lat=33.78&lng=-84.40
// Reverse-geocodes coordinates to a human label via OpenStreetMap Nominatim.
// No API key required. Nominatim asks for a descriptive User-Agent.
export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return Response.json({ error: "bad coords" }, { status: 400 });
  }

  try {
    // zoom=18 returns building/campus-level detail (e.g. "Georgia Institute of
    // Technology" instead of just "Atlanta"). addressdetails pulls the parsed
    // address fields. extratags surfaces things like university/campus names.
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1&namedetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "clarity-hackathon/1.0 (Clarity AI browser demo)",
        "Accept-Language": "en",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return Response.json({ error: "reverse lookup failed" }, { status: 502 });
    }
    const d = (await res.json()) as {
      display_name?: string;
      name?: string;
      address?: Record<string, string>;
      namedetails?: Record<string, string>;
    };
    const a = d.address ?? {};
    const named = d.namedetails ?? {};

    // Prefer the most specific named place — campus, building, venue, POI —
    // and fall back down to neighborhood / suburb / city.
    const place =
      named.name ??
      a.university ??
      a.college ??
      a.school ??
      a.building ??
      a.amenity ??
      a.shop ??
      a.office ??
      a.hospital ??
      a.attraction ??
      a.tourism ??
      a.leisure ??
      d.name ??
      undefined;

    const neighborhood =
      a.neighbourhood ?? a.suburb ?? a.quarter ?? a.residential ?? undefined;
    const city =
      a.city ??
      a.town ??
      a.village ??
      a.municipality ??
      a.county ??
      undefined;
    const region = a.state ?? a.region ?? undefined;
    const country = a.country ?? undefined;

    // Label order: specific place → neighborhood → city → region
    const label =
      [place, neighborhood ?? city, region].filter(Boolean).join(", ") ||
      d.display_name ||
      `${lat.toFixed(2)}, ${lng.toFixed(2)}`;

    return Response.json({
      label,
      place,
      neighborhood,
      city,
      region,
      country,
    });
  } catch (err) {
    return Response.json(
      { error: (err as Error).message ?? "error" },
      { status: 500 },
    );
  }
}
