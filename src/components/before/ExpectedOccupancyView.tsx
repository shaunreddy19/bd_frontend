import React, { useState, useEffect } from 'react';
import { disasterService, BuildingIntelligence, DisasterEvent } from '../../services/disasterService.ts';
import { User } from '../../services/authService.ts';
import {
  Building2,
  Users,
  Home,
  Tent,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  Eye,
} from 'lucide-react';

interface ExpectedOccupancyViewProps {
  user: User;
  activeDisaster: DisasterEvent | null;
}

export const ExpectedOccupancyView: React.FC<ExpectedOccupancyViewProps> = ({
  user,
  activeDisaster,
}) => {
  const [buildings, setBuildings] = useState<BuildingIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'AFFECTED' | 'UNAFFECTED'>('ALL');

  useEffect(() => {
    loadBuildings();
  }, [activeDisaster?.id]);

  const loadBuildings = async () => {
    if (!activeDisaster) return;
    setLoading(true);
    try {
      const list = await disasterService.getBuildingIntelligence(activeDisaster.id);
      setBuildings(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = buildings.filter((b) => {
    const matchesSearch =
      b.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRisk === 'AFFECTED') return b.isAffected;
    if (filterRisk === 'UNAFFECTED') return !b.isAffected;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] tracking-tight">
            Building Expected Occupancy
          </h1>
          <p className="text-sm font-medium text-[#567C8D] mt-1">
            Pre-disaster census intelligence. Expected occupancy counts{' '}
            <strong className="text-[#2F4156]">ONLY</strong> persons choosing to stay at Home.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#567C8D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search building / street..."
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-[#C8D9E6] text-xs font-semibold text-[#2F4156] outline-none placeholder-[#567C8D]/60 focus:border-[#567C8D]"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="p-1 rounded-xl bg-white border border-[#C8D9E6] flex items-center text-xs font-semibold">
            {(['ALL', 'AFFECTED', 'UNAFFECTED'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterRisk(mode)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterRisk === mode
                    ? mode === 'AFFECTED'
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-[#2F4156] text-white font-bold'
                    : 'text-[#567C8D] hover:text-[#2F4156]'
                }`}
              >
                {mode === 'ALL' ? 'All Buildings' : mode === 'AFFECTED' ? 'In Danger Zone' : 'Safe Zone'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((b, idx) => {
          return (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-6 border shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                b.isAffected
                  ? 'border-red-300 ring-1 ring-red-200'
                  : 'border-[#C8D9E6]/70'
              }`}
            >
              <div>
                {/* Building Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        b.isAffected
                          ? 'bg-red-50 text-red-600'
                          : 'bg-[#C8D9E6]/30 text-[#2F4156]'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#2F4156] leading-tight">
                        {b.buildingName}
                      </h3>
                      <p className="text-xs text-[#567C8D] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span>{b.address}</span>
                      </p>
                    </div>
                  </div>

                  {b.isAffected ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-600 text-white flex-shrink-0 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      RED ZONE
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 flex-shrink-0 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      SAFE
                    </span>
                  )}
                </div>

                {/* PROMINENT EXPECTED OCCUPANCY NUMBER */}
                <div className="mt-6 p-5 rounded-2xl bg-[#F5EFEB]/90 border border-[#C8D9E6]/60 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#567C8D]">
                    Expected Occupancy (Staying at Home)
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Home className="w-6 h-6 text-[#2F4156]" />
                    <span className="text-4xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156]">
                      {b.expectedOccupancy}
                    </span>
                    <span className="text-sm font-semibold text-[#567C8D]">
                      / {b.registeredPopulation} registered
                    </span>
                  </div>
                </div>

                {/* Population Demographics */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#C8D9E6]/40">
                    <span className="text-[10px] text-[#567C8D] font-bold uppercase">Adults</span>
                    <p className="font-bold text-[#2F4156] mt-0.5">{b.adults}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#C8D9E6]/40">
                    <span className="text-[10px] text-amber-700 font-bold uppercase">Children</span>
                    <p className="font-bold text-amber-900 mt-0.5">{b.children}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#C8D9E6]/40">
                    <span className="text-[10px] text-purple-700 font-bold uppercase">Elderly</span>
                    <p className="font-bold text-purple-900 mt-0.5">{b.elderly}</p>
                  </div>
                </div>

                {/* Location Plans Breakdown */}
                <div className="mt-4 space-y-1.5 text-xs text-[#567C8D]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Tent className="w-3.5 h-3.5 text-[#059669]" />
                      Shelter Evacuees:
                    </span>
                    <span className="font-bold text-[#059669]">{b.expectedShelter}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#567C8D]" />
                      Other City / Relatives:
                    </span>
                    <span className="font-bold text-[#2F4156]">{b.expectedElsewhere}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Unknown / Unconfirmed:
                    </span>
                    <span className="font-bold text-amber-700">{b.unknown}</span>
                  </div>
                </div>
              </div>

              {/* Footnote */}
              <div className="mt-6 pt-3 border-t border-[#F5EFEB] flex items-center justify-between text-[11px] text-[#567C8D]">
                <span>Zone: {b.zoneName}</span>
                <span className="font-bold text-[#2F4156]">
                  Risk: {b.riskLevel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
