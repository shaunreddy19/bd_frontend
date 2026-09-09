import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { mapService, CitizenMapResponse, RescuerMapResponse } from '../../services/mapService.ts';
import { User } from '../../services/authService.ts';
import { DisasterEvent } from '../../services/disasterService.ts';
import {
  Layers,
  MapPin,
  Home,
  Tent,
  Cross,
  Flame,
  Shield,
  Navigation,
  Eye,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface BeforeMapViewProps {
  user: User;
  activeDisaster: DisasterEvent | null;
}

export const BeforeMapView: React.FC<BeforeMapViewProps> = ({ user, activeDisaster }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [loading, setLoading] = useState(true);
  const [citizenData, setCitizenData] = useState<CitizenMapResponse | null>(null);
  const [rescuerData, setRescuerData] = useState<RescuerMapResponse | null>(null);

  // Layer Visibility Toggles
  const [showShelters, setShowShelters] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showFireStations, setShowFireStations] = useState(true);
  const [showPoliceStations, setShowPoliceStations] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [show5kmRadius, setShow5kmRadius] = useState(true);

  // Selected item details drawer
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  useEffect(() => {
    loadMapData();
  }, [user.role, activeDisaster?.id]);

  const loadMapData = async () => {
    setLoading(true);
    try {
      if (user.role === 'RESCUER') {
        const data = await mapService.getRescuerMap(activeDisaster?.id);
        setRescuerData(data);
      } else {
        const data = await mapService.getCitizenMap(activeDisaster?.id);
        setCitizenData(data);
      }
    } catch (e) {
      console.error('Error fetching map data:', e);
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

      // OpenStreetMap standard tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    renderLayers();
  }, [
    citizenData,
    rescuerData,
    showShelters,
    showHospitals,
    showFireStations,
    showPoliceStations,
    showRoads,
    showDangerZones,
    show5kmRadius,
    user.role,
  ]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const createIcon = (bg: string, iconHtml: string, size = 32) => {
    return L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="background-color: ${bg}; width: ${size}px; height: ${size}px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2px solid white;">${iconHtml}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const renderLayers = () => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (user.role === 'CITIZEN' && citizenData) {
      const { registeredHome, radiusKm, shelters, facilities, roads, zones } = citizenData;

      // 1. Registered Home marker
      if (registeredHome) {
        const homeIcon = createIcon(
          '#2F4156',
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
          38
        );

        const homeMarker = L.marker([registeredHome.latitude, registeredHome.longitude], {
          icon: homeIcon,
        }).addTo(group);

        homeMarker.on('click', () => {
          setSelectedEntity({
            type: 'Registered Home',
            name: registeredHome.name,
            address: registeredHome.address,
            details: `${registeredHome.membersCount} Registered Family Members`,
            members: registeredHome.members,
          });
        });

        // 2. 5km Radius Circle
        if (show5kmRadius) {
          L.circle([registeredHome.latitude, registeredHome.longitude], {
            radius: radiusKm * 1000,
            color: '#567C8D',
            weight: 2,
            dashArray: '6, 8',
            fillColor: '#C8D9E6',
            fillOpacity: 0.1,
          }).addTo(group);
        }

        map.setView([registeredHome.latitude, registeredHome.longitude], 13);
      }

      // 3. Danger Zones (Red subtle overlay)
      if (showDangerZones && zones) {
        zones.forEach((zone) => {
          try {
            const coords = JSON.parse(zone.polygonGeoJson);
            const polygon = L.polygon(coords, {
              color: '#DC2626',
              weight: 2.5,
              fillColor: '#DC2626',
              fillOpacity: 0.18,
            }).addTo(group);

            polygon.on('click', () => {
              setSelectedEntity({
                type: 'Affected Danger Zone',
                name: zone.name,
                riskLevel: zone.riskLevel,
                details: `High-risk inundation zone predicted under active flood model.`,
              });
            });
          } catch (err) {
            console.error('Failed to parse zone polygon:', err);
          }
        });
      }

      // 4. Shelters
      if (showShelters && shelters) {
        shelters.forEach((s) => {
          const sIcon = createIcon(
            '#059669',
            `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20 10 4"/><path d="m5 20 9-16"/><path d="M2 20h20"/><path d="m14 4-2-2-2 2"/></svg>`,
            32
          );
          const marker = L.marker([s.latitude, s.longitude], { icon: sIcon }).addTo(group);
          marker.on('click', () => {
            setSelectedEntity({
              type: 'Designated Shelter',
              name: s.name,
              address: s.address,
              capacity: s.capacity,
              contact: s.contactNumber,
              distance: `${s.distanceKm} km from registered home`,
            });
          });
        });
      }

      // 5. Emergency Facilities (Hospitals, Fire, Police)
      if (facilities) {
        if (showHospitals && facilities.hospitals) {
          facilities.hospitals.forEach((f) => {
            const hIcon = createIcon(
              '#DC2626',
              `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>`,
              28
            );
            const m = L.marker([f.latitude, f.longitude], { icon: hIcon }).addTo(group);
            m.on('click', () => {
              setSelectedEntity({
                type: 'Hospital / Trauma Center',
                name: f.name,
                address: f.address,
                contact: f.contactNumber,
                distance: `${f.distanceKm} km away`,
              });
            });
          });
        }

        if (showFireStations && facilities.fireStations) {
          facilities.fireStations.forEach((f) => {
            const fIcon = createIcon(
              '#D97706',
              `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
              28
            );
            const m = L.marker([f.latitude, f.longitude], { icon: fIcon }).addTo(group);
            m.on('click', () => {
              setSelectedEntity({
                type: 'Fire & Rescue Station',
                name: f.name,
                address: f.address,
                contact: f.contactNumber,
                distance: `${f.distanceKm} km away`,
              });
            });
          });
        }

        if (showPoliceStations && facilities.policeStations) {
          facilities.policeStations.forEach((f) => {
            const pIcon = createIcon(
              '#2563EB',
              `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`,
              28
            );
            const m = L.marker([f.latitude, f.longitude], { icon: pIcon }).addTo(group);
            m.on('click', () => {
              setSelectedEntity({
                type: 'Police Station / Security Precinct',
                name: f.name,
                address: f.address,
                contact: f.contactNumber,
                distance: `${f.distanceKm} km away`,
              });
            });
          });
        }
      }

      // 6. Roads
      if (showRoads && roads) {
        roads.forEach((r) => {
          try {
            const pts = JSON.parse(r.coordinatesJson);
            let roadColor = '#10B981'; // OPEN
            if (r.status === 'FLOODED') roadColor = '#3B82F6';
            if (r.status === 'BLOCKED') roadColor = '#EF4444';
            if (r.status === 'RESTRICTED') roadColor = '#F59E0B';

            const polyline = L.polyline(pts, {
              color: roadColor,
              weight: 5,
              opacity: 0.85,
            }).addTo(group);

            polyline.on('click', () => {
              setSelectedEntity({
                type: 'Road Transit Corridor',
                name: r.name,
                status: r.status,
                details: `Status: ${r.status}. Monitor access guidelines prior to transit.`,
              });
            });
          } catch (e) {
            console.error('Road coords error:', e);
          }
        });
      }
    } else if (user.role === 'RESCUER' && rescuerData) {
      // RESCUER MAP VIEW: All registered houses, 5km facility coverage circles, all emergency facilities, zones, roads
      const { households, shelters, facilities, roads, zones } = rescuerData;

      // 1. Danger Zones
      if (showDangerZones && zones) {
        zones.forEach((zone) => {
          try {
            const coords = JSON.parse(zone.polygonGeoJson);
            const polygon = L.polygon(coords, {
              color: '#DC2626',
              weight: 2.5,
              fillColor: '#DC2626',
              fillOpacity: 0.2,
            }).addTo(group);

            polygon.on('click', () => {
              setSelectedEntity({
                type: 'Affected Danger Zone',
                name: zone.name,
                riskLevel: zone.riskLevel,
                details: `Polygon area monitored for sensor inundation thresholds.`,
              });
            });
          } catch (err) {
            console.error(err);
          }
        });
      }

      // 2. All Registered Households
      if (households) {
        households.forEach((hh) => {
          const isAffected = hh.isAffected;
          const hIcon = createIcon(
            isAffected ? '#DC2626' : '#2F4156',
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
            30
          );

          const m = L.marker([hh.latitude, hh.longitude], { icon: hIcon }).addTo(group);
          m.on('click', () => {
            setSelectedEntity({
              type: 'Registered Household',
              name: hh.name,
              address: hh.address,
              isAffected: hh.isAffected ? 'INSIDE HIGH-RISK ZONE' : 'SAFE ZONE',
              membersCount: `${hh.members?.length || 0} Registered Members`,
              members: hh.members,
            });
          });
        });
      }

      // 3. Shelters
      if (showShelters && shelters) {
        shelters.forEach((s) => {
          const sIcon = createIcon(
            '#059669',
            `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20 10 4"/><path d="m5 20 9-16"/><path d="M2 20h20"/><path d="m14 4-2-2-2 2"/></svg>`,
            32
          );
          const m = L.marker([s.latitude, s.longitude], { icon: sIcon }).addTo(group);
          m.on('click', () => {
            setSelectedEntity({
              type: 'Designated Shelter',
              name: s.name,
              address: s.address,
              capacity: s.capacity,
              contact: s.contactNumber,
            });
          });
        });
      }

      // 4. Emergency Facilities with 5km coverage radius
      if (facilities) {
        facilities.forEach((f) => {
          let col = '#2F4156';
          if (f.type === 'HOSPITAL') col = '#DC2626';
          if (f.type === 'FIRE_STATION') col = '#D97706';
          if (f.type === 'POLICE_STATION') col = '#2563EB';
          if (f.type === 'CHECKPOINT') col = '#4B5563';

          const icon = createIcon(
            col,
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
            28
          );

          const m = L.marker([f.latitude, f.longitude], { icon }).addTo(group);
          m.on('click', () => {
            setSelectedEntity({
              type: `Emergency Facility (${f.type})`,
              name: f.name,
              address: f.address,
              contact: f.contactNumber,
            });
          });

          // 5km Facility Coverage circle
          if (show5kmRadius && (f.type === 'HOSPITAL' || f.type === 'FIRE_STATION')) {
            L.circle([f.latitude, f.longitude], {
              radius: 5000,
              color: col,
              weight: 1,
              dashArray: '4, 8',
              fillColor: col,
              fillOpacity: 0.04,
            }).addTo(group);
          }
        });
      }

      // 5. Roads
      if (showRoads && roads) {
        roads.forEach((r) => {
          try {
            const pts = JSON.parse(r.coordinatesJson);
            let roadColor = '#10B981';
            if (r.status === 'FLOODED') roadColor = '#3B82F6';
            if (r.status === 'BLOCKED') roadColor = '#EF4444';
            if (r.status === 'RESTRICTED') roadColor = '#F59E0B';

            const poly = L.polyline(pts, {
              color: roadColor,
              weight: 5,
              opacity: 0.85,
            }).addTo(group);

            poly.on('click', () => {
              setSelectedEntity({
                type: 'Road Transit Corridor',
                name: r.name,
                status: r.status,
              });
            });
          } catch (e) {
            console.error(e);
          }
        });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] tracking-tight">
            Preparedness Map Intelligence
          </h1>
          <p className="text-sm font-medium text-[#567C8D] mt-1">
            {user.role === 'CITIZEN'
              ? '5km safe perimeter around your registered home with shelters, facilities and flood zones.'
              : 'Command GIS: All registered buildings, high-risk flood polygons & 5km facility coverage.'}
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#C8D9E6] text-[#2F4156]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F4156]" />
            <span>Home</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#C8D9E6] text-[#059669]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
            <span>Shelter</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#C8D9E6] text-[#DC2626]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
            <span>Danger Zone</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area with Filter Bar */}
      <div className="relative rounded-3xl overflow-hidden border border-[#C8D9E6] shadow-sm bg-white">
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-2 max-w-xl">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[#C8D9E6] shadow-md flex items-center gap-1.5 text-xs font-bold text-[#2F4156]">
            <Layers className="w-3.5 h-3.5 text-[#567C8D]" />
            <span>Layers:</span>
          </div>

          <button
            type="button"
            onClick={() => setShowDangerZones(!showDangerZones)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
              showDangerZones
                ? 'bg-red-600 text-white'
                : 'bg-white/90 text-[#2F4156] border border-[#C8D9E6]'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Flood Zone</span>
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
            <Tent className="w-3 h-3" />
            <span>Shelters</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
              showHospitals
                ? 'bg-[#2F4156] text-white'
                : 'bg-white/90 text-[#2F4156] border border-[#C8D9E6]'
            }`}
          >
            <Cross className="w-3 h-3" />
            <span>Hospitals</span>
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
            <Navigation className="w-3 h-3" />
            <span>Road Corridors</span>
          </button>

          <button
            type="button"
            onClick={() => setShow5kmRadius(!show5kmRadius)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
              show5kmRadius
                ? 'bg-[#C8D9E6] text-[#2F4156]'
                : 'bg-white/90 text-[#2F4156] border border-[#C8D9E6]'
            }`}
          >
            <span>5km Radius</span>
          </button>
        </div>

        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-[580px] z-0" />

        {/* Floating Entity Details Card (when clicked on a marker or zone) */}
        {selectedEntity && (
          <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-96 z-[400] bg-white/95 backdrop-blur-md rounded-2xl border border-[#C8D9E6] shadow-xl p-4 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#567C8D]/15 text-[#2F4156]">
                  {selectedEntity.type}
                </span>
                <h3 className="text-sm font-bold text-[#2F4156] mt-1">{selectedEntity.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="text-[#567C8D] hover:text-[#2F4156] text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            {selectedEntity.address && (
              <p className="text-xs text-[#567C8D] mt-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#567C8D] flex-shrink-0" />
                <span>{selectedEntity.address}</span>
              </p>
            )}

            {selectedEntity.details && (
              <p className="text-xs text-[#2F4156] font-medium mt-2 bg-[#F5EFEB] p-2 rounded-xl">
                {selectedEntity.details}
              </p>
            )}

            {selectedEntity.capacity && (
              <div className="mt-2 text-xs font-semibold text-[#059669] flex items-center justify-between">
                <span>Total Safe Capacity:</span>
                <span className="font-bold">{selectedEntity.capacity} People</span>
              </div>
            )}

            {selectedEntity.contact && (
              <div className="mt-2 text-xs text-[#567C8D] flex items-center justify-between">
                <span>Emergency Contact:</span>
                <span className="font-bold text-[#2F4156]">{selectedEntity.contact}</span>
              </div>
            )}

            {selectedEntity.members && selectedEntity.members.length > 0 && (
              <div className="mt-3 pt-2 border-t border-[#F5EFEB]">
                <p className="text-[11px] font-bold text-[#2F4156] mb-1">Household Members:</p>
                <div className="space-y-1">
                  {selectedEntity.members.map((m: any) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between text-[11px] text-[#567C8D] bg-[#F5EFEB]/70 px-2 py-1 rounded-lg"
                    >
                      <span>{m.name} ({m.relationship})</span>
                      <span className="font-bold text-[#2F4156]">{m.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
