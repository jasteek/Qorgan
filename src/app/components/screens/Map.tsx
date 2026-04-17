import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../../contexts/AuthContext";

// Safe zone data for Almaty
const SAFE_ZONES = [
  { name: "Полиция ДП Алматы", nameKk: "Алматы Полициясы", lat: 43.2565, lng: 76.9285, type: "police", icon: "🚔" },
  { name: "Скорая помощь", nameKk: "Жедел жәрдем", lat: 43.2601, lng: 76.9340, type: "hospital", icon: "🏥" },
  { name: "ТРЦ Mega Alma-Ata", nameKk: "Mega Alma-Ata сауда орталығы", lat: 43.2540, lng: 76.9420, type: "safe", icon: "🛡️" },
  { name: "Центральная мечеть", nameKk: "Орталық мешіт", lat: 43.2558, lng: 76.9220, type: "safe", icon: "🕌" },
  { name: "Парк 28 панфиловцев", nameKk: "28 панфиловшы саябағы", lat: 43.2620, lng: 76.9250, type: "safe", icon: "🌳" },
];

const API_KEY = "160485e8-1ba7-4d4e-9b0e-799d2c449360";

export function Map() {
  const { t, language } = useLanguage();
  const { user } = useAuth(); // get real user

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const contactsMarkersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);

  const labels = {
    gpsSearch: language === "ru" ? "Поиск GPS..." : language === "kk" ? "GPS іздеуде..." : "GPS Search...",
    findRoute: language === "ru" ? "Маршрут" : language === "kk" ? "Маршрут" : "Route",
    routing: language === "ru" ? "В пути..." : language === "kk" ? "Жолда..." : "Routing...",
    safeZones: language === "ru" ? "Безопасные зоны" : language === "kk" ? "Қауіпсіз аймақтар" : "Safe Zones",
    searchPlaces: language === "ru" ? "Поиск мест..." : language === "kk" ? "Орындарды іздеу..." : "Search places...",
    myLocation: language === "ru" ? "Моя позиция" : language === "kk" ? "Менің орным" : "My position",
    mapTitle: language === "ru" ? "Карта" : language === "kk" ? "Карта" : "Map",
  };

  // 1. GPS Tracking & Backend Sync
  useEffect(() => {
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        pos => {
          const newLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(newLoc);
          
          // Send location to DB
          if (user?.id) {
            fetch('/api/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, lat: pos.coords.latitude, lng: pos.coords.longitude })
            }).catch(console.error);
          }
        },
        err => {
          console.warn(err);
          // Fallback if denied
          if (!userLocation) setUserLocation([43.2567, 76.9286]);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    } else {
      setUserLocation([43.2567, 76.9286]);
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);

  // 2. Fetch Contacts from DB
  useEffect(() => {
    if (!user?.id) return;
    const fetchContacts = async () => {
      try {
        const res = await fetch(`/api/location/contacts?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setContacts(data.contacts || []);
        }
      } catch (err) {
        console.error("Failed fetching contacts:", err);
      }
    };
    
    fetchContacts();
    const interval = setInterval(fetchContacts, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [user]);

  // 3. Init 2GIS map
  useEffect(() => {
    if (!userLocation || !mapContainerRef.current) return;

    if (scriptLoadedRef.current) {
      if (!mapReady) initMap();
      return;
    }

    if ((window as any).DG) {
      scriptLoadedRef.current = true;
      initMap();
      return;
    }

    const script = document.createElement("script");
    // Added API Key here to the DG Loader
    script.src = `https://maps.api.2gis.ru/2.0/loader.js?pkg=full&key=${API_KEY}`;
    script.async = true;
    script.id = "2gis-script";

    if (!document.getElementById("2gis-script")) {
      document.head.appendChild(script);
    }

    script.onload = () => {
      scriptLoadedRef.current = true;
      setTimeout(initMap, 200);
    };

    return () => {
      if (mapRef.current && mapRef.current.remove) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }
      setMapReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  function initMap() {
    if (!userLocation || !mapContainerRef.current) return;
    const DG = (window as any).DG;
    if (!DG) return;

    if (mapRef.current) {
      try { mapRef.current.remove(); } catch {}
      mapRef.current = null;
    }
    if (mapContainerRef.current) mapContainerRef.current.innerHTML = "";

    DG.then(() => {
      const map = DG.map(mapContainerRef.current, {
        center: userLocation,
        zoom: 14,
        fullscreenControl: false,
        zoomControl: true,
      });
      mapRef.current = map;
      setMapReady(true);

      // Custom user marker
      const userIcon = DG.divIcon({
        html: `<div style="
          width:18px;height:18px;border-radius:50%;
          background:#40E0D0;border:3px solid #fff;
          box-shadow:0 0 0 6px rgba(64,224,208,0.3), 0 0 20px rgba(64,224,208,0.5)
        "></div>`,
        className: "", iconSize: [18, 18], iconAnchor: [9, 9],
      });
      DG.marker(userLocation, { icon: userIcon }).addTo(map)
        .bindPopup(`<b>${labels.myLocation}</b>`);

      addSafeZoneMarkers(DG, map);
    });
  }

  // Render contacts heavily when `contacts` changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const DG = (window as any).DG;
    
    // Clear old markers
    contactsMarkersRef.current.forEach(m => m.remove());
    contactsMarkersRef.current = [];

    contacts.forEach(c => {
      const contactIcon = DG.divIcon({
        html: `<div style="
          width:24px;height:24px;border-radius:50%;
          background:#FF69B4;border:2px solid #fff;
          box-shadow:0 0 0 4px rgba(255,105,180,0.3);
          display:flex;align-items:center;justify-content:center;
          color:white;font-size:10px;font-weight:bold;
        ">${c.name ? c.name[0].toUpperCase() : 'C'}</div>`,
        className: "", iconSize: [24, 24], iconAnchor: [12, 12],
      });
      
      const m = DG.marker([c.lat, c.lng], { icon: contactIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>Доверенный контакт</b><br/>${c.name || c.phone}<br/><small>Обновлено недавно</small>`);
      
      contactsMarkersRef.current.push(m);
    });
  }, [contacts, mapReady]);

  function addSafeZoneMarkers(DG: any, map: any) {
    if (!showSafeZones) return;
    SAFE_ZONES.forEach(zone => {
      const color = zone.type === "police" ? "#4287f5"
        : zone.type === "hospital" ? "#42c763"
        : "#C9A84C";

      const icon = DG.divIcon({
        html: `<div style="
          width:32px;height:32px;border-radius:8px;
          background:${color};border:2px solid #fff;
          display:flex;align-items:center;justify-content:center;
          font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.4)
        ">${zone.icon}</div>`,
        className: "", iconSize: [32, 32], iconAnchor: [16, 16],
      });

      const name = language === "kk" ? zone.nameKk : zone.name;
      DG.marker([zone.lat, zone.lng], { icon }).addTo(map)
        .bindPopup(`<b>${name}</b>`);
    });
  }

  // 2GIS Global Search using Catalog API
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults(SAFE_ZONES.filter(z => 
        searchQuery && z.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      return;
    }

    const delayDebounce = setTimeout(() => {
      const loc = userLocation ? `${userLocation[1]},${userLocation[0]}` : "76.9286,43.2567";
      fetch(`https://catalog.api.2gis.com/3.0/items?q=${encodeURIComponent(searchQuery)}&key=${API_KEY}&location=${loc}&radius=50000&fields=items.point&sort=distance`)
        .then(r => r.json())
        .then(data => {
          if (data.result && data.result.items) {
            const places = data.result.items.map((item: any) => ({
              name: item.name,
              nameKk: item.name,
              lat: item.point?.lat || 0,
              lng: item.point?.lon || 0,
              icon: "📍",
              type: "search_result"
            })).filter((item:any) => item.lat !== 0);
            setSearchResults(places);
          }
        });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, userLocation]);


  // Real road routing using 2GIS Routing API (Replacing OSRM)
  const handleRoute = async () => {
    if (!mapRef.current || !userLocation || !selectedZone) return;
    const DG = (window as any).DG;
    if (!DG) return;
    
    setIsRouting(true);
    
    // Clear old route if exists
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    try {
      // 2GIS Routing API requires body with points
      const response = await fetch(`https://routing.api.2gis.com/carrouting/6.0.0/global?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              points: [
                  { type: "walking", x: userLocation[1], y: userLocation[0] },
                  { type: "walking", x: selectedZone.lng, y: selectedZone.lat }
              ]
          })
      });

      const data = await response.json();
      
      if (data.result && data.result[0] && data.result[0].maneuvers) {
        let allPoints: [number, number][] = [];
        data.result[0].maneuvers.forEach((m: any) => {
          if (m.outcoming_path && m.outcoming_path.geometry) {
            m.outcoming_path.geometry.forEach((g: any) => {
              if (g.selection) {
                const ptsMatch = g.selection.match(/LINESTRING\((.*)\)/);
                if (ptsMatch && ptsMatch[1]) {
                  const pts = ptsMatch[1].split(',').map((p:string) => {
                      const [lon, lat] = p.trim().split(' ');
                      return [parseFloat(lat), parseFloat(lon)];
                  });
                  allPoints.push(...pts);
                }
              }
            });
          }
        });

        if (allPoints.length > 0) {
            DG.then(() => {
              const polyline = DG.polyline(allPoints, {
                color: "#4287f5", // Bright blue for active route
                weight: 6,
                opacity: 0.9,
              }).addTo(mapRef.current);
              
              routeLayerRef.current = polyline;
              
              const destName = language === "kk" ? selectedZone.nameKk : selectedZone.name;
              DG.marker([selectedZone.lat, selectedZone.lng]).addTo(mapRef.current).bindPopup(`Выбрано: ${destName}`).openPopup();
              mapRef.current.fitBounds(polyline.getBounds(), { padding: [60, 60] });
            });
        } else {
            throw new Error("No polyline data found in maneuvers");
        }
      } else {
          throw new Error("No route found from 2GIS");
      }
    } catch (err) {
      console.error("2GIS Routing error: ", err);
      // Fallback straight line
      DG.then(() => {
        routeLayerRef.current = DG.polyline([userLocation, [selectedZone.lat, selectedZone.lng]], {
           color: "#C9A84C", weight: 5, opacity: 0.85, dashArray: "8 4"
        }).addTo(mapRef.current);
        mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] });
      });
    } finally {
      setIsRouting(false);
    }
  };

  const zoomIn = () => { if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + 1); };
  const zoomOut = () => { if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() - 1); };
  const centerOnMe = () => { if (mapRef.current && userLocation) mapRef.current.setView(userLocation, 15); };

  const shareLocation = () => {
    if (!userLocation) return;
    const url = `https://2gis.kz/search/${userLocation[1]}%2C${userLocation[0]}`;
    const text = language === "kk" ? "Менің орным осында!" : language === "en" ? "My current location!" : "Моё местоположение!";
    
    if (navigator.share) {
      navigator.share({ title: "Qorǵan", text, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert(language === "ru" ? "Ссылка скопирована!" : "Көшірілді!");
    }
  };

  const displayedResults = searchQuery.length > 0 ? searchResults 
    : SAFE_ZONES; // default to safe zones when empty

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0a1208" }}>
      {!userLocation && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a1208]">
          <div className="w-12 h-12 border-3 border-t-transparent border-teal-400 rounded-full animate-spin mb-4" />
          <p className="text-teal-400 text-sm tracking-widest uppercase animate-pulse">{labels.gpsSearch}</p>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="absolute inset-0"
        style={{ height: "100vh", width: "100%", filter: "brightness(0.92) saturate(1.1)" }}
      />

      <div className="absolute top-20 left-4 right-4 z-10 flex items-start justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-amber-400/30 rounded-xl px-3 py-2 shadow-lg">
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">{t("path")}</span>
          </div>
          <h2 className="text-3xl text-amber-400 mt-1 drop-shadow-lg"
            style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
            {labels.mapTitle}
          </h2>
        </div>

        <div className="pointer-events-auto flex flex-col gap-2">
          <button onClick={() => setShowSearch(s => !s)}
            className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-2.5 text-white/70 hover:text-white active:scale-95 transition-all shadow-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
          <button onClick={() => setShowSafeZones(s => !s)}
            className={`backdrop-blur-xl border rounded-xl p-2.5 active:scale-95 transition-all shadow-lg ${
              showSafeZones ? "bg-amber-400/20 border-amber-400/50 text-amber-400" : "bg-black/60 border-white/20 text-white/50"
            }`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </button>
          <button onClick={centerOnMe}
            className="bg-teal-400/20 backdrop-blur-xl border border-teal-400/40 rounded-xl p-2.5 text-teal-400 active:scale-95 transition-all shadow-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="currentColor" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </button>
          <button onClick={shareLocation}
            className="bg-indigo-500/20 backdrop-blur-xl border border-indigo-500/40 rounded-xl p-2.5 text-indigo-400 active:scale-95 transition-all shadow-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="absolute top-40 left-4 right-4 z-10">
          <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 px-4 py-3">
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={labels.searchPlaces} className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm" />
            </div>
            {(displayedResults.length > 0) && (
              <div className="border-t border-white/10 max-h-44 overflow-y-auto">
                {displayedResults.map((zone, i) => (
                  <button key={i} onClick={() => {
                    setSelectedZone(zone); setSearchQuery(""); setShowSearch(false);
                    if (mapRef.current && zone.lat) mapRef.current.setView([zone.lat, zone.lng], 16);
                  }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left border-b border-white/5">
                    <span className="text-lg">{zone.icon}</span>
                    <div>
                      <p className="text-white/90 text-sm">{language === "kk" && zone.nameKk ? zone.nameKk : zone.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
        <button onClick={zoomIn} className="w-10 h-10 bg-black/60 border border-white/20 rounded-xl text-white font-light active:scale-95 shadow-lg flex items-center justify-center">+</button>
        <button onClick={zoomOut} className="w-10 h-10 bg-black/60 border border-white/20 rounded-xl text-white font-light active:scale-95 shadow-lg flex items-center justify-center">−</button>
      </div>

      {/* Selected zone */}
      {selectedZone && (
        <div className="absolute bottom-28 left-4 right-4 z-10">
          <div className="bg-black/80 backdrop-blur-xl border border-amber-400/30 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-xl">{selectedZone.icon}</div>
                <div>
                  <h4 className="text-amber-400 text-sm font-semibold">{language === "kk" && selectedZone.nameKk ? selectedZone.nameKk : selectedZone.name}</h4>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleRoute} disabled={isRouting}
                  className="px-4 py-2 rounded-xl text-xs font-bold shadow-md bg-amber-400 text-black">
                  {isRouting ? labels.routing : labels.findRoute}
                </button>
                <button onClick={() => {
                    setSelectedZone(null);
                    if(routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }
                  }}
                  className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">✕</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSafeZones && !selectedZone && mapReady && (
        <div className="absolute bottom-28 left-4 right-4 z-10">
          <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-lg flex gap-4 overflow-x-auto scrollbar-none">
            {SAFE_ZONES.map((zone, i) => (
              <button key={i} onClick={() => { setSelectedZone(zone); if (mapRef.current) mapRef.current.setView([zone.lat, zone.lng], 16); }}
                className="flex flex-col items-center gap-1 flex-shrink-0 active:scale-95">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-base">{zone.icon}</div>
                <p className="text-white/50 text-[9px] text-center max-w-[60px] line-clamp-1">{zone.name.split(" ")[0]}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
