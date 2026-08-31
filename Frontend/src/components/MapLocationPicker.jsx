import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { LocateFixed } from "lucide-react";
import L from "leaflet";

const pin = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function DragHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapLocationPicker({ value, onChange }) {
  const lat = value?.lat ?? 18.5204;
  const lng = value?.lng ?? 73.8567;

  return (
    <div className="space-y-4">
      <div className="h-64 overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
      <button
        type="button"
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition((pos) => {
            onChange({ ...value, lat: pos.coords.latitude, lng: pos.coords.longitude });
          });
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-slate-50 transition"
      >
        <LocateFixed size={16} /> Use current location
      </button>
    </div>
  );
}
