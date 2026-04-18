export type WeatherData = {
  location: string;
  today: {
    condition: string;
    high: number;
    low: number;
    precipChance: number;
    humidity: number;
    wind: number;
    description: string;
  };
  week: {
    day: string;
    high: number;
    low: number;
    condition: string;
    precipChance: number;
  }[];
};

const WEATHER_CODES: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
};

function dayLabel(iso: string, offset: number): string {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

async function geocode(
  location: string,
): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: { latitude: number; longitude: number; name: string; country?: string }[];
    };
    const first = data.results?.[0];
    if (!first) return null;
    return {
      lat: first.latitude,
      lon: first.longitude,
      name: first.country ? `${first.name}, ${first.country}` : first.name,
    };
  } catch {
    return null;
  }
}

export async function getWeather(location: string): Promise<WeatherData | null> {
  const geo = await geocode(location);
  if (!geo) return null;

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(geo.lat));
    url.searchParams.set("longitude", String(geo.lon));
    url.searchParams.set(
      "daily",
      "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    );
    url.searchParams.set(
      "current",
      "temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m,precipitation",
    );
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("wind_speed_unit", "mph");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "7");

    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: {
        temperature_2m: number;
        weathercode: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
      };
      daily?: {
        time: string[];
        weathercode: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
      };
    };

    const daily = data.daily;
    const current = data.current;
    if (!daily || !current) return null;

    const todayCond = WEATHER_CODES[current.weathercode] ?? "Clear";

    return {
      location: geo.name,
      today: {
        condition: todayCond,
        high: Math.round(daily.temperature_2m_max[0]),
        low: Math.round(daily.temperature_2m_min[0]),
        precipChance: daily.precipitation_probability_max[0] ?? 0,
        humidity: Math.round(current.relative_humidity_2m),
        wind: Math.round(current.wind_speed_10m),
        description: `${todayCond.toLowerCase()} · high ${Math.round(daily.temperature_2m_max[0])}°`,
      },
      week: daily.time.map((iso, i) => ({
        day: dayLabel(iso, i),
        high: Math.round(daily.temperature_2m_max[i]),
        low: Math.round(daily.temperature_2m_min[i]),
        condition: WEATHER_CODES[daily.weathercode[i]] ?? "Clear",
        precipChance: daily.precipitation_probability_max[i] ?? 0,
      })),
    };
  } catch {
    return null;
  }
}
