'use client';

import React, { useEffect, useRef, useState } from 'react';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { MapPin, Navigation, Search, AlertCircle } from 'lucide-react';

interface SupportMapProps {
  category: string; // document category, picks which resources to look for
  analysis?: string; // advisor analysis, so the planner can refine the search
}

interface Place {
  id: number;
  name: string;
  lat: number;
  lon: number;
  label: string;
  color: string;
  distanceKm: number;
}

// The vocabulary of support resources we can map → each has an OSM filter.
// The advisor picks from these keys; we never trust free-text from the model.
const RESOURCES: Record<string, { filter: string }> = {
  food_bank: { filter: 'nwr["social_facility"="food_bank"]' },
  charity: { filter: 'nwr["shop"="charity"]' },
  social_facility: { filter: 'nwr["amenity"="social_facility"]' },
  community_centre: { filter: 'nwr["amenity"="community_centre"]' },
  clinic: { filter: 'nwr["amenity"~"^(clinic|doctors)$"]' },
  hospital: { filter: 'nwr["amenity"="hospital"]' },
  pharmacy: { filter: 'nwr["amenity"="pharmacy"]' },
  library: { filter: 'nwr["amenity"="library"]' },
  government: { filter: 'nwr["office"="government"]' },
  townhall: { filter: 'nwr["amenity"="townhall"]' },
  school: { filter: 'nwr["amenity"="school"]' },
};

// Fallback resource keys per document type when the planner can't be reached.
const DEFAULTS: Record<string, string[]> = {
  food: ['food_bank', 'community_centre', 'social_facility', 'charity'],
  medical: ['clinic', 'hospital', 'pharmacy', 'social_facility'],
  discharge: ['pharmacy', 'clinic', 'hospital'],
  housing: ['government', 'social_facility', 'community_centre', 'library'],
  eviction: ['government', 'social_facility', 'library', 'community_centre'],
  debt: ['government', 'library', 'townhall', 'social_facility'],
  government: ['government', 'townhall', 'library', 'social_facility'],
  school: ['library', 'community_centre', 'school', 'social_facility'],
  default: ['social_facility', 'government', 'library', 'community_centre'],
};

// Ask the advisor which resource types fit THIS document; fall back to defaults.
async function resolveResources(category: string, analysis?: string): Promise<string[]> {
  const fallback = DEFAULTS[category] || DEFAULTS.default;
  try {
    const res = await fetch('/api/support-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, analysis, options: Object.keys(RESOURCES) }),
    });
    const data = await res.json();
    const picked = Array.isArray(data.resources) ? data.resources.filter((k: string) => RESOURCES[k]) : [];
    return picked.length ? picked.slice(0, 5) : fallback;
  } catch {
    return fallback;
  }
}

// Turn OSM tags into a friendly label + marker colour.
function classify(tags: Record<string, string> = {}): { label: string; color: string } {
  if (tags.social_facility === 'food_bank') return { label: 'Food bank', color: '#5FA873' };
  if (tags.shop === 'charity') return { label: 'Charity / donations', color: '#5FA873' };
  if (tags.amenity === 'social_facility') return { label: 'Social services', color: '#378ADD' };
  if (tags.amenity === 'community_centre') return { label: 'Community centre', color: '#7F77DD' };
  if (tags.amenity === 'clinic' || tags.amenity === 'doctors') return { label: 'Clinic', color: '#1D9E75' };
  if (tags.amenity === 'hospital') return { label: 'Hospital', color: '#D85A30' };
  if (tags.amenity === 'pharmacy') return { label: 'Pharmacy', color: '#1D9E75' };
  if (tags.amenity === 'library') return { label: 'Library', color: '#BA7517' };
  if (tags.amenity === 'townhall' || tags.office === 'government') return { label: 'Government office', color: '#378ADD' };
  if (tags.amenity === 'school') return { label: 'School', color: '#7F77DD' };
  return { label: 'Resource', color: '#888780' };
}

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

type Status = 'idle' | 'locating' | 'needLocation' | 'loading' | 'ready' | 'error';

export default function SupportMap({ category, analysis }: SupportMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const sdkRef = useRef<any>(null);
  const [status, setStatus] = useState<Status>('locating');
  const [places, setPlaces] = useState<Place[]>([]);
  const [manualPlace, setManualPlace] = useState('');
  const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  // Try the browser's location first.
  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('needLocation');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => boot(pos.coords.latitude, pos.coords.longitude),
      () => setStatus('needLocation'),
      { timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve a typed place name → coordinates via MapTiler geocoding.
  const geocodeAndBoot = async () => {
    if (!manualPlace.trim() || !key) return;
    setStatus('locating');
    try {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(manualPlace)}.json?key=${key}&limit=1`
      );
      const data = await res.json();
      const center = data.features?.[0]?.center;
      if (center) boot(center[1], center[0]);
      else setStatus('needLocation');
    } catch {
      setStatus('needLocation');
    }
  };

  // Init the 3D map + fetch nearby resources for a coordinate.
  const boot = async (lat: number, lon: number) => {
    if (!key || !containerRef.current) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const sdk = await import('@maptiler/sdk');
      sdkRef.current = sdk;
      sdk.config.apiKey = key;

      const found = await fetchPlaces(lat, lon);
      setPlaces(found);

      if (!mapRef.current) {
        mapRef.current = new sdk.Map({
          container: containerRef.current,
          style: sdk.MapStyle.STREETS,
          center: [lon, lat],
          zoom: 13,
          pitch: 55,
          terrain: true,
          terrainExaggeration: 1,
          navigationControl: true,
          geolocateControl: false,
        });
      }
      const map = mapRef.current;

      // All style-dependent work must wait until the style has loaded.
      const onReady = () => {
        try {
          map.setCenter([lon, lat]);
          const youEl = document.createElement('div');
          youEl.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#2E4F4A;border:3px solid #fff;box-shadow:0 0 0 4px rgba(46,79,74,0.25)';
          new sdk.Marker({ element: youEl }).setLngLat([lon, lat]).addTo(map);
          addMarkers(found);
        } catch (e) {
          console.error('Map render failed', e);
        }
        setStatus('ready');
      };

      if (map.isStyleLoaded && map.isStyleLoaded()) onReady();
      else map.once('load', onReady);
    } catch (e) {
      console.error('Map init failed', e);
      setStatus('error');
    }
  };

  const fetchPlaces = async (lat: number, lon: number): Promise<Place[]> => {
    const keys = await resolveResources(category, analysis);
    const filters = keys
      .map((k) => `${RESOURCES[k].filter}(around:6000,${lat},${lon});`)
      .join('');
    const query = `[out:json][timeout:25];(${filters});out center 60;`;
    const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { method: 'POST', body: query });
        if (!res.ok) continue;
        const data = await res.json();
        const seen = new Set<string>();
        const out: Place[] = [];
        for (const el of data.elements || []) {
          const plat = el.lat ?? el.center?.lat;
          const plon = el.lon ?? el.center?.lon;
          const name = el.tags?.name;
          if (!plat || !plon || !name || seen.has(name)) continue;
          seen.add(name);
          const { label, color } = classify(el.tags);
          out.push({ id: el.id, name, lat: plat, lon: plon, label, color, distanceKm: haversineKm(lat, lon, plat, plon) });
        }
        return out.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 20);
      } catch {
        /* try next endpoint */
      }
    }
    return [];
  };

  const addMarkers = (list: Place[]) => {
    const sdk = sdkRef.current;
    if (!sdk || !mapRef.current) return;
    list.forEach((p) => {
      const el = document.createElement('div');
      el.style.cssText = `width:14px;height:14px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${p.color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer`;
      const dir = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`;
      const popup = new sdk.Popup({ offset: 18, closeButton: false }).setHTML(
        `<div style="font-family:sans-serif;font-size:12px"><strong>${p.name}</strong><br/><span style="color:#5F5E5A">${p.label} · ${p.distanceKm.toFixed(1)} km</span><br/><a href="${dir}" target="_blank" rel="noopener" style="color:#1D9E75;font-weight:600;text-decoration:none">→ Directions</a></div>`
      );
      new sdk.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(popup).addTo(mapRef.current);
    });
  };

  const flyTo = (p: Place) => {
    mapRef.current?.flyTo({ center: [p.lon, p.lat], zoom: 16, pitch: 60, duration: 1200 });
  };

  if (!key) {
    return (
      <div className="bg-surface dark:bg-surface rounded-3xl shadow-calm p-6 text-sm text-ink/60 font-sans">
        Map isn't configured — add a MapTiler API key to enable “support near you”.
      </div>
    );
  }

  return (
    <div className="bg-surface dark:bg-surface rounded-3xl shadow-calm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="w-8 h-8 rounded-full bg-calm-sage/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-deep-pine dark:text-calm-sage" />
        </div>
        <div>
          <p className="font-serif font-bold text-sm text-deep-pine dark:text-calm-sage">Support near you</p>
          <p className="text-2xs font-sans text-ink dark:text-ink opacity-70">
            {status === 'ready' ? `${places.length} place${places.length === 1 ? '' : 's'} that can help` : 'Real places that can help with this'}
          </p>
        </div>
      </div>

      {status === 'needLocation' && (
        <div className="px-6 pb-6">
          <p className="text-sm text-ink/70 font-sans mb-3">Tell me roughly where you are and I'll find help nearby.</p>
          <div className="flex items-center gap-2 bg-paper dark:bg-paper rounded-2xl p-2 pl-4 max-w-md">
            <Search className="w-4 h-4 text-calm-sage flex-shrink-0" />
            <input
              value={manualPlace}
              onChange={(e) => setManualPlace(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && geocodeAndBoot()}
              placeholder="City, neighborhood, or ZIP…"
              className="flex-1 bg-transparent text-sm text-ink dark:text-ink font-sans focus:outline-none placeholder:text-ink/40"
            />
            <button onClick={geocodeAndBoot} className="text-xs font-semibold bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine rounded-full px-4 py-2 hover:opacity-90 transition-opacity font-sans">
              Find
            </button>
          </div>
        </div>
      )}

      {status === 'locating' && (
        <div className="px-6 pb-6 flex items-center gap-3 text-sm text-ink/60 font-sans">
          <div className="w-8 h-8 rounded-full bg-calm-sage flex items-center justify-center animate-breathing flex-shrink-0" />
          Finding your location…
        </div>
      )}

      {status === 'error' && (
        <div className="px-6 pb-6 flex items-center gap-2 text-sm text-soft-clay font-sans">
          <AlertCircle className="w-4 h-4" /> Couldn't load the map. Try again in a moment.
        </div>
      )}

      {/* Map + list — rendered while loading AND ready so the map has real dimensions */}
      <div className={status === 'loading' || status === 'ready' ? 'block' : 'hidden'}>
        <div className="grid md:grid-cols-[1fr_260px]">
          <div className="relative">
            <div ref={containerRef} className="h-[360px] w-full" />
            {status === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center gap-3 text-sm text-ink/70 font-sans bg-paper/70 dark:bg-paper/70 backdrop-blur-[1px]">
                <div className="w-8 h-8 rounded-full bg-calm-sage flex items-center justify-center animate-breathing flex-shrink-0" />
                Mapping nearby support…
              </div>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto border-t md:border-t-0 md:border-l border-mist/40 dark:border-mist/30">
            {places.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-2 px-4 py-3 border-b border-mist/30 dark:border-mist/20 hover:bg-warm-sand/50 dark:hover:bg-mist/20 transition-colors"
              >
                <button onClick={() => flyTo(p)} className="flex items-start gap-2.5 text-left flex-1 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: p.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink dark:text-ink truncate">{p.name}</p>
                    <p className="text-2xs text-ink/60 font-sans">{p.label} · {p.distanceKm.toFixed(1)} km away</p>
                  </div>
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Get directions"
                  className="flex items-center gap-1 text-2xs font-semibold text-calm-sage hover:text-deep-pine dark:hover:text-calm-sage transition-colors flex-shrink-0 mt-0.5 rounded-full px-2 py-1 hover:bg-calm-sage/10"
                >
                  <Navigation className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
            {places.length === 0 && (
              <p className="text-sm text-ink/60 font-sans p-4">No places found within 6 km. Try a nearby city.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
