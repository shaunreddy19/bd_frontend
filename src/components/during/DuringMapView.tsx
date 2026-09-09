import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { mapService } from '../../services/mapService.ts';
import { emergencyService, EmergencyRequest } from '../../services/emergencyService.ts';
import { DisasterEvent } from '../../services/disasterService.ts';
import { User } from '../../services/authService.ts';
import {
  Layers,
  LifeBuoy,
  AlertTriangle,
  Building2,
  Tent,
  Navigation,
  Cross,
  Clock,
  Radio,
  MapPin,
} from 'lucide-react';

interface DuringMapViewProps {
  user: User;
  activeDisaster: DisasterEvent | null;
  onSelectRequest?: (req: EmergencyRequest) => void;
}

export const DuringMapView: React.FC<DuringMapViewProps> = ({
  user,
  activeDisaster,
  onSelectRequest,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [mapData, setMapData] = useState<any>(null);

  // Layer Toggles
  const [showDistressMarkers, setShowDistressMarkers] = useState(true);
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showRoads, setShowRoads] = useState(true);

  // Selected item modal / drawer
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    loadLiveMapData();
    const interval = setInterval(loadLiveMapData, 6000);
    return () => clearInterval(interval);
  }, [activeDisaster?.id]);

  const loadLiveMapData = async () => {
    if (!activeDisaster) return;
    try {
      const [reqs, mData] = await Promise.all([
        emergencyService.getEmergencyRequests(activeDisaster.id),
        mapService.getRescuerMap(activeDisaster.id).catch(() => null),
      ]);
      setRequests(reqs);
      setMapData(mData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = [13.0827, 80.2707];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    renderLayers();
  }, [
    requests,
    mapData,
    showDistressMarkers,
    showFloodZones,
    showShelters,
    showFacilities,
    showRoads,
  ]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const createDivIcon = (bg: string, content: string, size = 32) => {
    return L.divIcon({
      className: 'custom-during-icon',
      html: `<div style="background-color: ${bg}; width: ${size}px; height: ${size}px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid white;">${content}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const renderLayers = () => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Flood Inundation Zones (Red Overlay)
    if (showFloodZones && mapData?.zones) {
      mapData.zones.forEach((z: any) => {
        try {
          const coords = JSON.parse(z.polygonGeoJson);
          const polygon = L.polygon(coords, {
            color: '#DC2626',
            weight: 3,
            fillColor: '#DC2626',
            fillOpacity: 0.22,
          }).addTo(group);

          polygon.on('click', () => {
            setSelectedItem({
              type: 'High-Risk Flood Zone',
              name: z.name,
              details: `Monitored breach zone. Danger level: ${z.riskLevel}`,
            });
          });
        } catch (e) {
          console.error(e);
        }
      });
    }

    // 2. Distress Emergency Requests (Pulsing Red Beacons with Priority Score)
    if (showDistressMarkers && requests) {
      requests.forEach((req) => {
        const lat = req.latitude || 13.0827;
        const lng = req.longitude || 80.2707;

        let beaconBg = '#DC2626'; // PENDING
        if (req.rescueStatus === 'TEAM_ASSIGNED') beaconBg = '#2563EB';
        if (req.rescueStatus === 'SAFELY_RESCUED') beaconBg = '#059669';
        if (req.rescueStatus === 'NOT_FOUND') beaconBg = '#6B7280';

        const beaconIcon = L.divIcon({
          className: 'distress-beacon',
          html: `<div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${
              req.rescueStatus === 'PENDING'
                ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: rgba(220, 38, 38, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="background-color: ${beaconBg}; width: 34px; height: 34px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: 2px solid white; z-index: 10;">
              ${req.priorityScore}
            </div>
          </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([lat, lng], { icon: beaconIcon }).addTo(group);
        marker.on('click', () => {
          setSelectedItem({
            type: 'Emergency Distress Call',
            name: req.householdMember?.name || 'Citizen in Distress',
            address: req.address || 'Reported Location',
            score: req.priorityScore,
            status: req.rescueStatus,
            description: req.description,
            conditions: req.conditions?.map((c) => c.conditionType) || [],
            assignments: req.rescueAssignments || [],
            rawRequest: req,
          });
        });
      });
    }

    // 3. Shelters
    if (showShelters && mapData?.shelters) {
      mapData.shelters.forEach((s: any) => {
        const sIcon = createDivIcon(
          '#059669',
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20 10 4"/><path d="m5 20 9-16"/><path d="M2 20h20"/><path d="m14 4-2-2-2 2"/></svg>`,
          30
        );
        const m = L.marker([s.latitude, s.longitude], { icon: sIcon }).addTo(group);
        m.on('click', () => {
          setSelectedItem({
            type: 'Designated Safe Shelter',
            name: s.name,
            address: s.address,
            capacity: s.capacity,
            contact: s.contactNumber,
          });
        });
      });
    }

    // 4. Facilities
    if (showFacilities && mapData?.facilities) {
      mapData.facilities.forEach((f: any) => {
        let col = '#2F4156';
        if (f.type === 'HOSPITAL') col = '#DC2626';
        if (f.type === 'FIRE_STATION') col = '#D97706';

        const fIcon = createDivIcon(
          col,
          `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
          26
        );
        const m = L.marker([f.latitude, f.longitude], { icon: fIcon }).addTo(group);
        m.on('click', () => {
          setSelectedItem({
            type: `Facility: ${f.type}`,
            name: f.name,
            address: f.address,
            contact: f.contactNumber,
          });
        });
      });
    }

    // 5. Roads
    if (showRoads && mapData?.roads) {
      mapData.roads.forEach((r: any) => {
        try {
          const pts = JSON.parse(r.coordinatesJson);
          let col = '#10B981';
          if (r.status === 'FLOODED') col = '#3B82F6';
          if (r.status === 'BLOCKED') col = '#EF4444';
          if (r.status === 'RESTRICTED') col = '#F59E0B';

          const line = L.polyline(pts, { color: col, weight: 5, opacity: 0.85 }).addTo(group);
          line.on('click', () => {
            setSelectedItem({
              type: 'Road Corridor',
              name: r.name,
              details: `Transit Status: ${r.status}`,
            });
          });
        } catch (e) {
          console.error(e);
        }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] tracking-tight">
            Live Emergency Incident Map
          </h1>
          <p className="text-sm font-medium text-[#567C8D] mt-1">
            Real-time geospatial tactical feed. Beacons display calculated Priority Scores.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-red-300 text-red-700 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span>Pending Rescue (Score)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-blue-300 text-blue-700 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Team Assigned</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-emerald-300 text-emerald-700 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Safely Rescued</span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-3xl overflow-hidden border border-[#C8D9E6] shadow-sm bg-white">
        {/* Floating Controls */}
        <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-2 max-w-xl">
          <button
            type="button"
            onClick={() => setShowDistressMarkers(!showDistressMarkers)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
              showDistressMarkers
                ? 'bg-red-600 text-white'
                : 'bg-white/90 text-[#2F4156] border border-[#C8D9E6]'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Distress SOS Beacons</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFloodZones(!showFloodZones)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
              showFloodZones
                ? 'bg-[#2F4156] text-white'
                : 'bg-white/90 text-[#2F4156] border border-[#C8D9E6]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Inundation Zone</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShelters(!showShelters)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
              showShelters
                ? 'bg-[#059669] text-white'
                : 'bg-white/90 text-[#2F4156] border border-[#C8D9E6]'
            }`}
          >
            <Tent className="w-3.5 h-3.5" />
            <span>Shelters</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRoads(!showRoads)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
              showRoads
                ? 'bg-[#567C8D] text-white'
                : 'bg-white/90 text-[#2F4156] border border-[#C8D9E6]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Road Access</span>
          </button>
        </div>

        {/* Map */}
        <div ref={mapContainerRef} className="w-full h-[600px] z-0" />

        {/* Selected Beacon Drawer */}
        {selectedItem && (
          <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-[420px] z-[400] bg-white/95 backdrop-blur-md rounded-3xl border border-[#C8D9E6] shadow-2xl p-5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-red-100 text-red-800">
                  {selectedItem.type}
                </span>
                <h3 className="text-base font-bold text-[#2F4156] mt-1.5">
                  {selectedItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-[#567C8D] hover:text-[#2F4156] text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            {selectedItem.score !== undefined && (
              <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-red-700">
                    Priority Score
                  </span>
                  <p className="text-xs text-red-900 font-bold">
                    Rescue Status: {selectedItem.status}
                  </p>
                </div>
                <span className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-red-600">
                  {selectedItem.score}
                </span>
              </div>
            )}

            {selectedItem.address && (
              <p className="text-xs text-[#567C8D] mt-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{selectedItem.address}</span>
              </p>
            )}

            {selectedItem.description && (
              <p className="text-xs text-[#2F4156] mt-2 bg-[#F5EFEB] p-2.5 rounded-xl font-medium">
                "{selectedItem.description}"
              </p>
            )}

            {selectedItem.conditions && selectedItem.conditions.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase text-[#567C8D] mb-1">
                  Conditions Detected:
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedItem.conditions.map((c: string) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-800"
                    >
                      {c.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedItem.assignments && selectedItem.assignments.length > 0 && (
              <div className="mt-3 pt-2 border-t border-[#F5EFEB]">
                <p className="text-[10px] font-bold uppercase text-[#567C8D]">
                  Assigned Team:
                </p>
                <p className="text-xs font-bold text-[#2F4156]">
                  {selectedItem.assignments[0]?.teamName}
                </p>
                <p className="text-[11px] text-[#567C8D]">
                  {selectedItem.assignments[0]?.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
