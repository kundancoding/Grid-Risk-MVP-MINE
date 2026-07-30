import { useEffect, useMemo, useState } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const INITIAL = { lat: 30.2672, lng: -97.7431 };
const TILES = {
  map: { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "© OpenStreetMap contributors" },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: "Tiles © Esri" },
};
const FILTERS = {
  composite: ["Overall opportunity", "Balances all screened signals"],
  price: ["Price sensitivity", "Scenario contour until a market feed is connected"],
  policy: ["Policy review", "Prioritises areas needing jurisdiction review"],
  environment: ["Environmental exposure", "Uses live weather and terrain"],
  grid: ["Grid access", "Screening proximity, not utility capacity"],
};
const color = (score) => score >= 74 ? "#98e85d" : score >= 58 ? "#f8cb5a" : "#f37965";

function Focus({ point }) {
  const map = useMap();
  useEffect(() => { map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 10), { duration: .75 }); }, [map, point]);
  return null;
}

export default function GridPathLiveMap() {
  const [company, setCompany] = useState("Highline Development");
  const [project, setProject] = useState("New energy site");
  const [technology, setTechnology] = useState("Solar + storage");
  const [capacity, setCapacity] = useState("150");
  const [acres, setAcres] = useState("620");
  const [search, setSearch] = useState("Austin, Texas");
  const [point, setPoint] = useState(INITIAL);
  const [location, setLocation] = useState("Austin, Texas, United States");
  const [jurisdiction, setJurisdiction] = useState("Texas, United States");
  const [layer, setLayer] = useState("map");
  const [filter, setFilter] = useState("composite");
  const [weather, setWeather] = useState(null);
  const [elevation, setElevation] = useState(null);
  const [notices, setNotices] = useState([]);
  const [status, setStatus] = useState("Ready to screen this location.");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  const candidates = useMemo(() => {
    const mw = Math.max(1, Number(capacity) || 1);
    const land = Math.max(1, Number(acres) || 1);
    const heat = weather ? Math.max(0, weather.temperature - 30) * 1.2 : 3;
    const gust = weather ? Math.max(0, weather.gusts - 45) * .38 : 3;
    const terrain = elevation == null ? 3 : Math.min(11, Math.abs(elevation) / 220);
    const scale = Math.max(0, mw - land / 3.3) * .11;
    const pressure = notices.length ? Math.min(12, notices.length * 2) : 5;
    return [["North ridge", .055, -.066, 88, 89], ["East corridor", .012, .082, 75, 80], ["South parcel", -.064, .018, 68, 72], ["West junction", -.018, -.093, 61, 66]].map((row) => {
      const [name, north, east, grid, base] = row;
      const price = Math.round(39 + (grid - 60) * .27 + mw * .025);
      const environment = Math.max(30, Math.round(base - heat - gust - terrain));
      const policy = Math.max(25, Math.round(base - pressure - (name === "South parcel" ? 7 : 0)));
      const composite = Math.round((base + grid + environment + policy) / 4 - scale);
      const score = filter === "price" ? Math.max(0, Math.min(100, Math.round((price - 30) / 32 * 100))) : filter === "policy" ? policy : filter === "environment" ? environment : filter === "grid" ? grid : composite;
      return { name, lat: point.lat + north, lng: point.lng + east, grid, price, environment, policy, composite, score };
    }).sort((a, b) => b.score - a.score);
  }, [acres, capacity, elevation, filter, notices.length, point, weather]);

  const selected = candidates[active] || candidates[0];

  async function refresh(nextPoint = point, nextLocation = location, nextJurisdiction = jurisdiction) {
    setLoading(true); setStatus("Refreshing live weather, terrain, and official notice signals…");
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({ latitude: String(nextPoint.lat), longitude: String(nextPoint.lng), timezone: "auto", current: "temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation" });
    const legalTerm = nextJurisdiction.split(",")[0] + " renewable energy environment";
    const responses = await Promise.allSettled([
      fetch(weatherUrl).then((r) => r.json()),
      fetch("https://api.open-meteo.com/v1/elevation?latitude=" + nextPoint.lat + "&longitude=" + nextPoint.lng).then((r) => r.json()),
      fetch("https://www.federalregister.gov/api/v1/documents.json?per_page=5&order=newest&conditions%5Bterm%5D=" + encodeURIComponent(legalTerm)).then((r) => r.json()),
    ]);
    const [weatherResult, elevationResult, noticesResult] = responses;
    if (weatherResult.status === "fulfilled" && weatherResult.value.current) {
      const c = weatherResult.value.current;
      setWeather({ temperature: c.temperature_2m, wind: c.wind_speed_10m, gusts: c.wind_gusts_10m, precipitation: c.precipitation, updated: c.time });
    }
    if (elevationResult.status === "fulfilled" && typeof elevationResult.value.elevation?.[0] === "number") setElevation(Math.round(elevationResult.value.elevation[0]));
    if (noticesResult.status === "fulfilled" && Array.isArray(noticesResult.value.results)) setNotices(noticesResult.value.results.slice(0, 5).map((n) => ({ title: n.title, url: n.html_url, date: n.publication_date, agency: n.agencies?.[0]?.name || "Federal Register" })));
    setStatus(weatherResult.status === "fulfilled" ? "Live data updated for " + nextLocation + "." : "Map updated; one or more live sources did not respond. Try refreshing.");
    setLoading(false);
  }

  async function locate(event) {
    event.preventDefault(); if (!search.trim()) return;
    setStatus("Finding this location…");
    try {
      const response = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(search) + "&count=1&language=en&format=json");
      const result = (await response.json()).results?.[0]; if (!result) throw new Error("not found");
      const nextPoint = { lat: result.latitude, lng: result.longitude };
      const nextLocation = [result.name, result.admin1, result.country].filter(Boolean).join(", ");
      const nextJurisdiction = [result.admin1, result.country].filter(Boolean).join(", ") || nextLocation;
      setPoint(nextPoint); setLocation(nextLocation); setJurisdiction(nextJurisdiction); setActive(0); await refresh(nextPoint, nextLocation, nextJurisdiction);
    } catch { setStatus("Could not find that place. Try a city and region, for example Austin, Texas."); }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return setStatus("Device coordinates are not supported in this browser.");
    setStatus("Requesting device coordinates…");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const nextPoint = { lat: coords.latitude, lng: coords.longitude };
      const nextLocation = nextPoint.lat.toFixed(5) + ", " + nextPoint.lng.toFixed(5);
      setPoint(nextPoint); setLocation(nextLocation); setJurisdiction("Selected coordinates"); setSearch(nextLocation); setActive(0); await refresh(nextPoint, nextLocation, "Selected coordinates");
    }, () => setStatus("Location was not shared. Search for a city instead."), { enableHighAccuracy: true, timeout: 10000 });
  }

  useEffect(() => { refresh(); }, []);

  return <main className="gp-app">
    <header className="gp-topbar"><div className="gp-brand"><b>GP</b><strong>GridPath</strong><span>live location intelligence</span></div><div className="gp-badge"><i /> Live public data</div></header>
    <section className="gp-hero"><div><p className="gp-overline">Site selection workspace</p><h1>Find the better place to build.</h1><p>Enter the company and project. Compare real coordinates, weather, terrain, and official policy discovery on a map.</p></div><button onClick={() => refresh()} disabled={loading}>{loading ? "Refreshing…" : "Refresh live screen"}</button></section>
    <section className="gp-intake"><div><p className="gp-overline">1 · Project inputs</p><h2>What are you planning?</h2></div><label>Company<input value={company} onChange={(e) => setCompany(e.target.value)} /></label><label>Project<input value={project} onChange={(e) => setProject(e.target.value)} /></label><label>Technology<select value={technology} onChange={(e) => setTechnology(e.target.value)}><option>Solar + storage</option><option>Utility solar</option><option>Battery storage</option><option>Wind</option><option>Data center / flexible load</option></select></label><label>Capacity (MW)<input value={capacity} onChange={(e) => setCapacity(e.target.value)} inputMode="decimal" /></label><label>Land (acres)<input value={acres} onChange={(e) => setAcres(e.target.value)} inputMode="decimal" /></label></section>
    <section className="gp-location"><div><p className="gp-overline">2 · Site location</p><h2>{location}</h2><small>{point.lat.toFixed(5)}, {point.lng.toFixed(5)}</small></div><form onSubmit={locate}><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Austin, Texas" /><button>Find on map</button><button type="button" className="gp-quiet" onClick={useMyLocation}>Use my location</button></form></section>
    <section className="gp-workspace">
      <aside className="gp-panel gp-controls"><div><p className="gp-overline">3 · Compare signals</p><h2>Map filters</h2><p>Choose one lens. The map contour and candidates update together.</p></div><div className="gp-filters">{Object.entries(FILTERS).map(([key, copy]) => <button key={key} className={filter === key ? "active" : ""} onClick={() => { setFilter(key); setActive(0); }}><i className={key} /><span><b>{copy[0]}</b><small>{copy[1]}</small></span></button>)}</div><div className="gp-layers"><button className={layer === "map" ? "active" : ""} onClick={() => setLayer("map")}>Map</button><button className={layer === "satellite" ? "active" : ""} onClick={() => setLayer("satellite")}>Satellite</button></div><p className="gp-status"><i />{status}</p></aside>
      <div className="gp-map"><MapContainer center={[point.lat, point.lng]} zoom={10} scrollWheelZoom className="gp-leaflet"><TileLayer url={TILES[layer].url} attribution={TILES[layer].attribution} maxZoom={19} /><Focus point={point} />{candidates.map((c, index) => <Circle key={c.name} center={[c.lat, c.lng]} radius={index === 0 ? 7200 : 5600} pathOptions={{ color: color(c.score), fillColor: color(c.score), fillOpacity: index === 0 ? .23 : .13, weight: index === active ? 3 : 1.2 }} eventHandlers={{ click: () => setActive(index) }} />)}{candidates.map((c, index) => <CircleMarker key={c.name + "marker"} center={[c.lat, c.lng]} radius={index === active ? 10 : 7} pathOptions={{ color: "#10252b", fillColor: color(c.score), fillOpacity: 1, weight: 3 }} eventHandlers={{ click: () => setActive(index) }}><Tooltip direction="top">{c.name} · {c.score}</Tooltip></CircleMarker>)}<CircleMarker center={[point.lat, point.lng]} radius={8} pathOptions={{ color: "#fff", fillColor: "#1a8fbd", fillOpacity: 1, weight: 3 }}><Tooltip permanent direction="bottom">{project || "Your site"}</Tooltip></CircleMarker></MapContainer><div className="gp-key"><span><i />Higher fit</span><span><i />Review</span><span><i />Higher friction</span></div><p className="gp-mapnote">Contours are decision-support screening, not legal, permitting, market, or property boundaries.</p></div>
      <aside className="gp-panel gp-candidates"><div><p className="gp-overline">4 · Suggested candidates</p><h2>Start here</h2><p>Ranked for {company || "your company"} with the current filter.</p></div><div>{candidates.map((c, index) => <button className={active === index ? "gp-candidate active" : "gp-candidate"} key={c.name} onClick={() => setActive(index)}><em>{index + 1}</em><span><b>{c.name}</b><small>$ {c.price}/MWh scenario</small></span><strong style={{ color: color(c.score) }}>{c.score}</strong></button>)}</div>{selected && <div className="gp-detail"><b>{selected.name}</b><p>{FILTERS[filter][0]}: <strong>{selected.score}</strong></p>{[["Grid", selected.grid], ["Policy review", selected.policy], ["Environmental fit", selected.environment]].map(([name, score]) => <label key={name}>{name}<i><em style={{ width: String(score) + "%" }} /></i></label>)}</div>}</aside>
    </section>
    <section className="gp-data"><article><p className="gp-overline">Live weather · Open-Meteo</p><h2>{weather ? weather.temperature.toFixed(1) + "°C" : "—"}</h2><p>{weather ? weather.wind.toFixed(0) + " km/h wind · " + weather.gusts.toFixed(0) + " km/h gusts · " + weather.precipitation.toFixed(1) + " mm precipitation" : "Waiting for a live response."}</p></article><article><p className="gp-overline">Terrain · Open-Meteo</p><h2>{elevation == null ? "—" : elevation + " m"}</h2><p>Elevation at the selected point. Use a survey and local flood data before siting.</p></article><article><p className="gp-overline">Environmental review</p><h2>{weather && weather.gusts >= 50 ? "Elevated" : "Screen"}</h2><p>Weather and terrain are real inputs. Protected habitat, wetlands, and permits need authoritative local datasets.</p></article></section>
    <section className="gp-legal"><div><p className="gp-overline">Official policy discovery</p><h2>Legal and permitting signals</h2><p>Live Federal Register results for <b>{jurisdiction}</b>. These help determine what counsel and local teams should verify, not compliance.</p></div><div>{notices.length ? notices.map((n) => <a href={n.url} target="_blank" rel="noreferrer" key={n.url}><small>{n.date}</small><b>{n.title}</b><span>{n.agency} ↗</span></a>) : <p>No matching notices loaded yet. Refresh the screen to retry.</p>}</div></section>
    <footer>Live sources: OpenStreetMap / Esri basemaps, Open-Meteo weather and elevation, and the Federal Register. Utility capacity, nodal prices, parcel ownership, state and local law, and permits require official or licensed feeds before investment or filing decisions.</footer>
  </main>;
}