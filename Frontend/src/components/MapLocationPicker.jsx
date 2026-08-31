import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from "react-leaflet";
import { LocateFixed, MapPin } from "lucide-react";
import L from "leaflet";
import { DEFAULT_JHARKHAND_COORDS } from "../lib/constants";

const pin = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapViewUpdater({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

function DragHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapLocationPicker({ value, onChange }) {
  const lat = value?.lat ?? DEFAULT_JHARKHAND_COORDS.lat;
  const lng = value?.lng ?? DEFAULT_JHARKHAND_COORDS.lng;

  return (
    <div className="space-y-3">
      <div className="h-64 overflow-hidden rounded-2xl border border-slate-200 shadow-inner relative">
        <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapViewUpdater lat={lat} lng={lng} />
          <Marker
            position={[lat, lng]}
            draggable
            icon={pin}
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                onChange({ ...value, lat: p.lat, lng: p.lng });
              },
            }}
          />
          <DragHandler onChange={(coords) => onChange({ ...value, ...coords })} />
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition((pos) => {
              onChange({ ...value, lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0E4B4C] shadow-sm hover:bg-slate-50 transition"
        >
          <LocateFixed size={15} /> Use current GPS location
        </button>

        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <MapPin size={13} className="text-teal-700" />
          {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
        </span>
      </div>
    </div>
  );
}
