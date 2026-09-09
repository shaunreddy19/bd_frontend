import React, { useState, useEffect } from 'react';
import { emergencyService, EmergencyRequest } from '../../services/emergencyService.ts';
import { rescueService } from '../../services/rescueService.ts';
import { DisasterEvent } from '../../services/disasterService.ts';
import { User } from '../../services/authService.ts';
import { DuringTab } from '../layout/DashboardLayout.tsx';
import {
  LifeBuoy,
  Users,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  ShieldCheck,
  MapPin,
  ArrowRight,
  HelpCircle,
  X,
} from 'lucide-react';

interface RescueOperationsViewProps {
  user: User;
  activeDisaster: DisasterEvent | null;
  onNavigateTab: (tab: DuringTab) => void;
}

export const RescueOperationsView: React.FC<RescueOperationsViewProps> = ({
  user,
  activeDisaster,
  onNavigateTab,
}) => {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [myRequests, setMyRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Rescuer team assignment modal
  const [assignModalReq, setAssignModalReq] = useState<EmergencyRequest | null>(null);
  const [teamName, setTeamName] = useState('Bravo-4 Urban Water Extraction');
  const [assignNotes, setAssignNotes] = useState('Equipped with inflatable zodiac raft and medical kit.');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, [activeDisaster?.id]);

  const loadRequests = async () => {
    if (!activeDisaster) return;
    try {
      const all = await emergencyService.getEmergencyRequests(activeDisaster.id);
      setRequests(all);

      // Filter for citizen's own household
      const mine = all.filter(
        (r) =>
          r.householdMember?.household?.headOfHouseholdId === user.id ||
          r.householdMember?.name.toLowerCase().includes(user.name.toLowerCase())
      );
      setMyRequests(mine);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalReq || !teamName.trim()) return;
    setAssignLoading(true);
    try {
      await rescueService.assignTeam(
        assignModalReq.id,
        teamName.trim(),
        assignNotes.trim()
      );
      setAssignModalReq(null);
      await loadRequests();
    } catch (err: any) {
      alert('Failed to assign team: ' + err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUpdateStatus = async (
    reqId: string,
    status: 'PENDING' | 'TEAM_ASSIGNED' | 'SAFELY_RESCUED' | 'NOT_FOUND',
    notes?: string
  ) => {
    try {
      await rescueService.updateRescueStatus(reqId, status, notes);
      await loadRequests();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Assignment
          </span>
        );
      case 'TEAM_ASSIGNED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Team Dispatched
          </span>
        );
      case 'SAFELY_RESCUED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Safely Rescued
          </span>
        );
      case 'NOT_FOUND':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-900 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Not Located
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] tracking-tight">
            Rescue Operations & Dispatch Queue
          </h1>
          <p className="text-sm font-medium text-[#567C8D] mt-1">
            Emergency requests ranked dynamically by severity condition algorithms.
          </p>
        </div>

        {user.role === 'CITIZEN' && (
          <button
            type="button"
            onClick={() => onNavigateTab('safe')}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <LifeBuoy className="w-4 h-4 text-white" />
            <span>Request Immediate Rescue</span>
          </button>
        )}
      </div>

      {/* CITIZEN VIEW: If citizen has submitted an active request */}
      {user.role === 'CITIZEN' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#2F4156]">
            Your Household's Active Rescue Tickets
          </h2>

          {myRequests.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-[#C8D9E6] shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C8D9E6]/30 text-[#2F4156] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#2F4156]">
                No Active Rescue Requests Recorded
              </h3>
              <p className="text-xs text-[#567C8D] max-w-md mx-auto">
                Your household has not filed a distress beacon for the ongoing flood incident. If
                water levels rise or you become trapped, click below.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('safe')}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-md"
                >
                  <LifeBuoy className="w-4 h-4 text-white" />
                  <span>File Distress Call</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-6 border border-red-200 shadow-md space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-red-700">
                        Priority Score: {req.priorityScore}
                      </span>
                      <h3 className="text-base font-bold text-[#2F4156] mt-0.5">
                        {req.householdMember?.name}
                      </h3>
                      <p className="text-xs text-[#567C8D]">{req.address}</p>
                    </div>
                    {getStatusBadge(req.rescueStatus)}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5EFEB] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#567C8D] font-medium">Assigned Team:</span>
                      <span className="font-bold text-[#2F4156]">
                        {req.rescueAssignments?.[0]?.teamName || 'Dispatching team...'}
                      </span>
                    </div>
                    {req.rescueAssignments?.[0]?.notes && (
                      <p className="text-[11px] text-[#567C8D] pt-1 border-t border-[#C8D9E6]/40">
                        Instructions: {req.rescueAssignments[0].notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {req.conditions?.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800"
                      >
                        {c.conditionType.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RESCUER VIEW: Prioritized Tactical Queue */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C8D9E6] shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156]">
              All Emergency Distress Calls
            </h3>
            <p className="text-xs text-[#567C8D]">
              Sorted by Priority Score descending (highest severity at top).
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2F4156] text-white">
            {requests.length} Total Distress Tickets
          </span>
        </div>

        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`p-5 sm:p-6 rounded-2xl border transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                req.rescueStatus === 'PENDING'
                  ? 'bg-red-50/40 border-red-200 shadow-sm'
                  : 'bg-white border-[#C8D9E6]/70'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-start gap-4 flex-1">
                {/* Large Priority Score Badge */}
                <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex flex-col items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-red-200">
                    SCORE
                  </span>
                  <span className="text-xl font-bold font-['Space_Grotesk',sans-serif] leading-none">
                    {req.priorityScore}
                  </span>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-[#2F4156]">
                      {req.householdMember?.name || 'Citizen'}
                    </h4>
                    <span className="text-xs text-[#567C8D]">
                      ({req.householdMember?.relationship}, {req.householdMember?.age}y -{' '}
                      {req.householdMember?.category})
                    </span>
                    {getStatusBadge(req.rescueStatus)}
                  </div>

                  <p className="text-xs text-[#567C8D] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#567C8D] flex-shrink-0" />
                    <span>{req.address}</span>
                  </p>

                  {req.description && (
                    <p className="text-xs text-[#2F4156] bg-white/80 p-2 rounded-xl border border-[#C8D9E6]/50 font-medium">
                      "{req.description}"
                    </p>
                  )}

                  {/* Conditions Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {req.conditions?.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-red-800"
                      >
                        {c.conditionType.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>

                  {req.rescueAssignments && req.rescueAssignments.length > 0 && (
                    <div className="pt-2 text-xs text-[#567C8D]">
                      <span className="font-bold text-[#2F4156]">
                        Assigned: {req.rescueAssignments[0].teamName}
                      </span>
                      {req.rescueAssignments[0].notes && (
                        <span className="ml-2 italic text-[#567C8D]">
                          ({req.rescueAssignments[0].notes})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Rescuers */}
              {user.role === 'RESCUER' && (
                <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignModalReq(req);
                      setTeamName('Alpha Recon Unit 1');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#2F4156] hover:bg-[#1F2D3D] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Users className="w-3.5 h-3.5 text-[#C8D9E6]" />
                    <span>Assign Team</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(req.id, 'SAFELY_RESCUED', 'Completed evacuation to shelter.')
                    }
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Rescued</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(req.id, 'NOT_FOUND', 'Sweep completed, location uninhabited.')
                    }
                    className="px-3.5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#2F4156] text-xs font-bold transition"
                  >
                    <span>Not Found</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assign Team Modal */}
      {assignModalReq && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#C8D9E6] shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-[#F5EFEB]">
              <div>
                <h3 className="text-lg font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156]">
                  Dispatch Rescue Team
                </h3>
                <p className="text-xs text-[#567C8D]">
                  Priority Score: {assignModalReq.priorityScore} • {assignModalReq.householdMember?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalReq(null)}
                className="p-1 rounded-lg text-[#567C8D] hover:text-[#2F4156]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTeam} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2F4156] mb-1">
                  Rescue Squad / Unit Name
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Unit 4 - Marine Extraction"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C8D9E6] text-xs font-medium text-[#2F4156] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2F4156] mb-1">
                  Tactical Equipment / Mission Notes
                </label>
                <textarea
                  rows={3}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Deploying with high-water clearance truck and medical supplies."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C8D9E6] text-xs font-medium text-[#2F4156] outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAssignModalReq(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#567C8D] hover:text-[#2F4156]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#2F4156] hover:bg-[#1F2D3D] text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  {assignLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
