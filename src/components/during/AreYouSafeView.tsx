import React, { useState, useEffect } from 'react';
import { emergencyService, EmergencyRequest } from '../../services/emergencyService.ts';
import { householdService, Household } from '../../services/householdService.ts';
import { DisasterEvent } from '../../services/disasterService.ts';
import { User } from '../../services/authService.ts';
import { DuringTab } from '../layout/DashboardLayout.tsx';
import {
  CheckCircle2,
  AlertTriangle,
  LifeBuoy,
  Flame,
  Activity,
  Droplets,
  Users,
  Accessibility,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Loader2,
  Send,
} from 'lucide-react';

interface AreYouSafeViewProps {
  user: User;
  activeDisaster: DisasterEvent | null;
  onNavigateTab: (tab: DuringTab) => void;
}

const EMERGENCY_CONDITIONS = [
  { id: 'TRAPPED', label: 'Trapped', icon: AlertTriangle },
  { id: 'HEAVILY_INJURED', label: 'Heavily Injured', icon: Activity },
  { id: 'WATER_RISING', label: 'Water Rising', icon: Droplets },
  { id: 'FIRE', label: 'Fire', icon: Flame },
  { id: 'PHYSICALLY_DISABLED', label: 'Physically Disabled', icon: Accessibility },
  { id: 'CHILDREN_INFANTS_PRESENT', label: 'Children / Infants Present', icon: Users },
  { id: 'SERIOUSLY_UNWELL', label: 'Seriously Unwell', icon: Activity },
  { id: 'NEED_RESCUE', label: 'Need Rescue', icon: LifeBuoy },
  { id: 'OTHER', label: 'Other Urgent Assistance', icon: AlertTriangle },
];

export const AreYouSafeView: React.FC<AreYouSafeViewProps> = ({
  user,
  activeDisaster,
  onNavigateTab,
}) => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'SAFE' | 'IN_DISTRESS' | 'UNACCOUNTED' | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDistressForm, setShowDistressForm] = useState(false);

  // Distress form state
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [situationDesc, setSituationDesc] = useState<string>('');
  const [submittedRequest, setSubmittedRequest] = useState<EmergencyRequest | null>(null);

  useEffect(() => {
    loadData();
  }, [activeDisaster?.id]);

  const loadData = async () => {
    if (!activeDisaster) return;
    setLoading(true);
    try {
      const [hh, myStat] = await Promise.all([
        householdService.getMyHousehold().catch(() => null),
        emergencyService.getMyStatus(activeDisaster.id).catch(() => null),
      ]);

      if (hh) {
        setHousehold(hh);
        if (hh.members?.length > 0) {
          setSelectedMemberId(hh.members[0].id);
        }
        setLocationAddress(hh.address || '');
      }

      if (myStat && myStat.length > 0) {
        setCurrentStatus(myStat[0].status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImSafe = async () => {
    if (!activeDisaster) return;
    setActionLoading(true);
    try {
      await emergencyService.updateStatus(activeDisaster.id, 'SAFE');
      setCurrentStatus('SAFE');
      setShowDistressForm(false);
      setSubmittedRequest(null);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCondition = (id: string) => {
    setSelectedConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmitDistress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDisaster || !selectedMemberId) return;
    if (selectedConditions.length === 0) {
      alert('Please select at least one emergency condition.');
      return;
    }

    setActionLoading(true);
    try {
      const req = await emergencyService.createEmergencyRequest(activeDisaster.id, {
        householdMemberId: selectedMemberId,
        address: locationAddress.trim(),
        description: situationDesc.trim(),
        conditions: selectedConditions,
        latitude: household?.latitude || 13.0827,
        longitude: household?.longitude || 80.2707,
      });

      setSubmittedRequest(req);
      setCurrentStatus('IN_DISTRESS');
      setShowDistressForm(false);
    } catch (err: any) {
      alert('Failed to submit emergency request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center">
        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-red-100 text-red-700 tracking-wider">
          Immediate Safety Check-in
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] tracking-tight mt-2">
          ARE YOU SAFE?
        </h1>
        <p className="text-sm font-medium text-[#567C8D] mt-1.5 max-w-lg mx-auto">
          Your response directly guides emergency dispatch and search & rescue teams in real time.
        </p>
      </div>

      {/* Confirmation State if already submitted */}
      {currentStatus === 'SAFE' && !showDistressForm && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-emerald-900">
            You Are Marked as Confirmed Safe
          </h2>
          <p className="text-xs text-emerald-700 max-w-md mx-auto">
            Your status is shared with disaster headquarters. If your situation changes or water
            levels rise, click below immediately.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowDistressForm(true)}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Situation changed? Report emergency distress →
            </button>
          </div>
        </div>
      )}

      {submittedRequest && (
        <div className="p-6 rounded-3xl bg-red-50 border border-red-200 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-200 text-red-900">
                  SOS DISPATCH ACTIVE
                </span>
                <h3 className="text-lg font-bold text-red-900 mt-0.5">
                  Emergency Request Registered
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-red-700">Priority Score</span>
              <p className="text-3xl font-bold font-['Space_Grotesk',sans-serif] text-red-600">
                {submittedRequest.priorityScore}
              </p>
            </div>
          </div>

          <p className="text-xs text-red-800 leading-relaxed">
            Your distress request has been calculated and inserted into the tactical queue with priority
            score <strong>{submittedRequest.priorityScore}</strong>. Rescuers have received your beacon.
          </p>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('rescue')}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:bg-red-700"
            >
              <span>View Live Rescue Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TWO LARGE SOFTLY ROUNDED BUTTONS */}
      {!showDistressForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Choice 1: I'M SAFE */}
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleImSafe}
            className="p-8 sm:p-10 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition duration-200 flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk',sans-serif] tracking-tight">
                I'M SAFE
              </h2>
              <p className="text-xs font-medium text-emerald-100 mt-1">
                No immediate danger. Family is safe.
              </p>
            </div>
          </button>

          {/* Choice 2: I NEED HELP */}
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => setShowDistressForm(true)}
            className="p-8 sm:p-10 rounded-3xl bg-[#DC2626] hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition duration-200 flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk',sans-serif] tracking-tight">
                I NEED HELP
              </h2>
              <p className="text-xs font-medium text-red-100 mt-1">
                Emergency extraction, water rising, injuries, or fire.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* EMERGENCY DISTRESS FORM (Condition Selectors) */}
      {showDistressForm && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-red-300 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F5EFEB]">
            <div>
              <h3 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-red-600">
                Specify Emergency Conditions
              </h3>
              <p className="text-xs text-[#567C8D] mt-0.5">
                Select all conditions that apply. Each condition dynamically calculates priority score.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDistressForm(false)}
              className="text-xs font-bold text-[#567C8D] hover:text-[#2F4156]"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitDistress} className="space-y-6">
            {/* Person in distress */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2F4156] mb-1.5">
                Family Member Needing Rescue
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#C8D9E6] text-xs font-semibold text-[#2F4156] outline-none"
              >
                {household?.members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship}, {m.age}y - {m.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2F4156] mb-2.5">
                Select Applicable Emergency Conditions (Multiple allowed):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {EMERGENCY_CONDITIONS.map((cond) => {
                  const Icon = cond.icon;
                  const isSelected = selectedConditions.includes(cond.id);

                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => toggleCondition(cond.id)}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-[#F5EFEB]/70 text-[#2F4156] border-[#C8D9E6] hover:bg-[#F5EFEB]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isSelected ? 'text-white' : 'text-red-600'
                        }`}
                      />
                      <span className="text-xs font-bold">{cond.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2F4156] mb-1.5">
                Exact Location / Floor / Landmark
              </label>
              <input
                type="text"
                required
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="e.g. Building A-182, 1st floor lobby, stairs trapped by water"
                className="w-full px-4 py-2.5 rounded-xl border border-[#C8D9E6] text-xs font-medium text-[#2F4156] outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2F4156] mb-1.5">
                Situation Details (Optional)
              </label>
              <textarea
                rows={2}
                value={situationDesc}
                onChange={(e) => setSituationDesc(e.target.value)}
                placeholder="Water rising at 2 feet/hour, elderly person has mobility difficulty."
                className="w-full px-4 py-2.5 rounded-xl border border-[#C8D9E6] text-xs font-medium text-[#2F4156] outline-none resize-none"
              />
            </div>

            {/* Submit SOS Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDistressForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#567C8D] hover:text-[#2F4156]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
                <span>Submit SOS Emergency Request</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
