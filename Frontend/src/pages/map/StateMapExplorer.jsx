import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Filter,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowRight,
  Search,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import UpwardButton from "../../components/UpwardButton";
import {
  JHARKHAND_DISTRICTS,
  JHARKHAND_DISTRICT_COORDS,
  DEFAULT_JHARKHAND_COORDS,
  ISSUE_CATEGORIES,
} from "../../lib/constants";
import { useLanguageStore } from "../../store/languageStore";

// Custom pin icons
const createColoredIcon = (color) => {
  return L.divIcon({
    className: "custom-leaflet-pin",
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const redIcon = createColoredIcon("#E11D48"); // Critical / High
const amberIcon = createColoredIcon("#F59E0B"); // Medium / Under review
const greenIcon = createColoredIcon("#10B981"); // Resolved
const blueIcon = createColoredIcon("#2563EB"); // Assigned

function MapCenterController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 11);
    }
  }, [center, zoom, map]);
  return null;
}

import { handleMockRequest } from "../../api/mockAdapter";

export default function StateMapExplorer() {
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [district, setDistrict] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [mapCenter, setMapCenter] = useState([DEFAULT_JHARKHAND_COORDS.lat, DEFAULT_JHARKHAND_COORDS.lng]);
  const [mapZoom, setMapZoom] = useState(8);

  useEffect(() => {
    async function loadIssues() {
      try {
        const { data } = await axiosClient.get("/api/issues");
        if (Array.isArray(data) && data.length > 0) {
          setIssues(data);
          return;
        }
      } catch (err) {}
      try {
        const mockRes = await handleMockRequest({ method: "get", url: "/api/issues" });
        if (Array.isArray(mockRes?.data)) setIssues(mockRes.data);
      } catch (_) {}
    }
    loadIssues();
  }, []);

  const handleDistrictChange = (d) => {
    setDistrict(d);
    if (d !== "all" && JHARKHAND_DISTRICT_COORDS[d]) {
      setMapCenter([JHARKHAND_DISTRICT_COORDS[d].lat, JHARKHAND_DISTRICT_COORDS[d].lng]);
      setMapZoom(12);
    } else {
      setMapCenter([DEFAULT_JHARKHAND_COORDS.lat, DEFAULT_JHARKHAND_COORDS.lng]);
      setMapZoom(8);
    }
  };

  const filteredIssues = issues.filter((i) => {
    const matchDistrict = district === "all" || i.district === district;
    const matchCategory = category === "all" || i.category === category;
    const matchStatus = status === "all" || i.status === status;
    return matchDistrict && matchCategory && matchStatus;
  });

  const getMarkerIcon = (issue) => {
    if (issue.status === "Resolved") return greenIcon;
    if (issue.priority === "High") return redIcon;
    if (issue.status === "Assigned" || issue.status === "In progress") return blueIcon;
    return amberIcon;
  };

  return (
    <div className="pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="text-[#0E4B4C]" size={28} /> {t("gisMapTitle")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("gisMapSubtitle")}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> {t("legendUrgent")}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> {t("legendAssigned")}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {t("legendResolved")}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            {t("districtLabel")}
          </label>
          <select
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#0E4B4C]"
          >
            <option value="all">{t("allDistrictsCount")} ({issues.length} total)</option>
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            {t("categoryLabel")}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#0E4B4C]"
          >
            <option value="all">{t("categoryLabel")} (All)</option>
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            {t("role")} / Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#0E4B4C]"
          >
            <option value="all">All Statuses</option>
            <option value="New">{t("statusNew")}</option>
            <option value="Assigned">{t("statusAssigned")}</option>
            <option value="In progress">{t("statusInProgress")}</option>
            <option value="Resolved">{t("statusResolved")}</option>
          </select>
        </div>
      </div>

      {/* Main Map & Issue List Split View */}
      <div className="grid gap-6 lg:grid-cols-[68%_32%]">
        {/* Map Container */}
        <div className="h-[560px] rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative bg-slate-100">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom
            className="h-full w-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenterController center={mapCenter} zoom={mapZoom} />

            {filteredIssues.map((issue) => {
              const lat = issue.lat || issue.location?.lat || DEFAULT_JHARKHAND_COORDS.lat;
              const lng = issue.lng || issue.location?.lng || DEFAULT_JHARKHAND_COORDS.lng;

              return (
                <Marker
                  key={issue.id || issue._id}
                  position={[lat, lng]}
                  icon={getMarkerIcon(issue)}
                  eventHandlers={{
                    click: () => setSelectedIssue(issue),
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 max-w-xs text-xs">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-[#0E4B4C] line-clamp-1">{issue.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          issue.status === "Resolved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 mt-1">{issue.description}</p>
                      <div className="mt-2 text-[10px] text-slate-400">
                        📍 {issue.district}, {issue.block}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/issues/${issue.id || issue._id}`)}
                        className="mt-2 block w-full rounded-lg bg-[#0E4B4C] py-1 text-center font-bold text-white text-[11px] hover:bg-[#0b3b3c]"
                      >
                        Open Issue Tracker →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Filtered Issue Sidebar Cards */}
        <div className="h-[560px] flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-slate-900 text-sm">
              Issues in View ({filteredIssues.length})
            </h2>
            <span className="text-[11px] text-slate-400">Click to pin on map</span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id || issue._id}
                onClick={() => {
                  setSelectedIssue(issue);
                  const lat = issue.lat || issue.location?.lat;
                  const lng = issue.lng || issue.location?.lng;
                  if (lat && lng) {
                    setMapCenter([lat, lng]);
                    setMapZoom(14);
                  }
                }}
                className={`rounded-2xl border p-3.5 text-xs transition cursor-pointer ${
                  selectedIssue?.id === issue.id
                    ? "border-teal-400 bg-teal-50/40 shadow-xs"
                    : "border-slate-100 bg-[#F7F8FA] hover:border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {issue.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    issue.priority === "High" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                  }`}>
                    {issue.priority}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 line-clamp-1">{issue.title}</h3>
                <p className="text-slate-500 mt-1 line-clamp-2 leading-relaxed">{issue.description}</p>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                  <span>📍 {issue.district}, {issue.block}</span>
                  <div className="flex items-center gap-2">
                    <UpwardButton
                      issueId={issue.id || issue._id}
                      count={issue.upwardsCount}
                      hasUpwarded={issue.hasUpwarded}
                      size="sm"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/issues/${issue.id || issue._id}`);
                      }}
                      className="font-bold text-[#0E4B4C] hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredIssues.length === 0 && (
              <div className="py-16 text-center text-xs text-slate-400">
                No issues match the selected district and category filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
