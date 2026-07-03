import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Address } from "../types";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface RouteMapProps {
  pickupAddress: Address;
  dropoffAddress: Address;
  height?: string;
  interactive?: boolean;
}

export default function RouteMap({
  pickupAddress,
  dropoffAddress,
  height = "320px",
  interactive = true,
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      scrollWheelZoom: false, // Prevents accidental scroll zoom when scanning pages
    });

    mapInstanceRef.current = map;

    // Beautiful premium light-themed CartoDB Positron tiles (100% free, no API keys)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    // Create custom inline SVG markers to avoid broken Leaflet default asset imports
    const pickupIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-indigo-500/25 animate-ping"></div>
          <div class="w-7 h-7 rounded-full bg-indigo-600 border-2 border-white shadow-md flex items-center justify-center text-white">
            <span class="text-[10px] font-sans font-extrabold tracking-tighter">P</span>
          </div>
        </div>
      `,
      className: "custom-pin-pickup",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const dropoffIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-amber-500/25 animate-pulse"></div>
          <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-slate-950">
            <span class="text-[10px] font-sans font-extrabold tracking-tighter">D</span>
          </div>
        </div>
      `,
      className: "custom-pin-dropoff",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const pickupLatLng = L.latLng(pickupAddress.latitude, pickupAddress.longitude);
    const dropoffLatLng = L.latLng(dropoffAddress.latitude, dropoffAddress.longitude);

    // Place Markers
    const pickupMarker = L.marker(pickupLatLng, { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<b>Pickup:</b> ${pickupAddress.label}`);

    const dropoffMarker = L.marker(dropoffLatLng, { icon: dropoffIcon })
      .addTo(map)
      .bindPopup(`<b>Dropoff:</b> ${dropoffAddress.label}`);

    // Create simple bounds initially
    const bounds = L.latLngBounds([pickupLatLng, dropoffLatLng]);
    map.fitBounds(bounds, { padding: [40, 40] });

    // Fetch actual street route from OSRM (100% free public routing service)
    const fetchStreetRoute = async () => {
      setLoadingRoute(true);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickupAddress.longitude},${pickupAddress.latitude};${dropoffAddress.longitude},${dropoffAddress.latitude}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("OSRM routing API error");
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates;
          // Coordinates are in [lng, lat] for GeoJSON, Leaflet needs [lat, lng]
          const latLngs = coordinates.map((coord: [number, number]) => L.latLng(coord[1], coord[0]));
          
          if (routeLineRef.current) {
            map.removeLayer(routeLineRef.current);
          }
          
          // Draw smooth high-contrast street route line
          const polyline = L.polyline(latLngs, {
            color: "#4f46e5", // Indigo-600 matching our primary color
            weight: 4,
            opacity: 0.85,
            lineJoin: "round",
            dashArray: "1, 1", // elegant high-density dashed/dotted street line
          }).addTo(map);
          
          routeLineRef.current = polyline;
          
          // Fit map to precise polyline bounds
          map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        } else {
          throw new Error("No routes found in response");
        }
      } catch (err) {
        console.warn("Could not retrieve street-level route, drawing straight line fallback:", err);
        
        if (routeLineRef.current) {
          map.removeLayer(routeLineRef.current);
        }
        
        // Straight line fallback
        const polyline = L.polyline([pickupLatLng, dropoffLatLng], {
          color: "#4f46e5",
          weight: 4,
          opacity: 0.7,
          dashArray: "8, 8",
        }).addTo(map);
        
        routeLineRef.current = polyline;
        map.fitBounds(bounds, { padding: [40, 40] });
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchStreetRoute();

    // Trigger a map redraw when container is styled or transitions end
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickupAddress, dropoffAddress, interactive]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
      {/* Map Element */}
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="w-full z-10"
        id={`leaflet-map-${pickupAddress.id}-${dropoffAddress.id}`}
      />

      {/* Floating Status & Label Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="bg-indigo-50 p-1.5 rounded-lg flex-shrink-0 text-indigo-600">
            <Navigation className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold block">Route Segment</span>
            <span className="text-xs font-bold text-slate-800 block truncate">
              {pickupAddress.label} &rarr; {dropoffAddress.label}
            </span>
          </div>
        </div>

        {loadingRoute && (
          <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200/50 px-2 py-1 rounded-lg">
            <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
            <span>Calculating Route...</span>
          </div>
        )}
      </div>
    </div>
  );
}
