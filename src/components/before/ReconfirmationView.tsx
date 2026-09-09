import React, { useState, useEffect } from 'react';
import { disasterService, DisasterEvent } from '../../services/disasterService.ts';
import { User } from '../../services/authService.ts';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Check,
  Loader2,
  HelpCircle,
  Building,
} from 'lucide-react';

interface ReconfirmationViewProps {
  user: User;
  activeDisaster: DisasterEvent | null;
}

export const ReconfirmationView: React.FC<ReconfirmationViewProps> = ({
  user,
  activeDisaster,
}) => {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadReconfirmation();
  }, [activeDisaster?.id]);

  const loadReconfirmation = async () => {
    if (!activeDisaster) return;
    setLoading(true);
    try {
      const res = await disasterService.getReconfirmationStatus(activeDisaster.id);
      setStatusData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choice: 'SAME_PLAN' | 'CHANGE_LOCATION' | 'NOT_SURE') => {
    if (!activeDisaster) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await disasterService.submitReconfirmation(activeDisaster.id, choice);
      setMessage(res.message || 'Reconfirmation updated successfully.');
      await loadReconfirmation();
    } catch (err: any) {
      alert('Failed to submit reconfirmation: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const hoursRemaining = statusData?.hoursUntilPredictedDisaster ?? 18;
  const isWindowActive = statusData?.isWindowActive ?? true;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] tracking-tight">
          30-Hour Location Reconfirmation
        </h1>
        <p className="text-sm font-medium text-[#567C8D] mt-1">
          Disaster trajectories shift. Validate your household's plan before the disaster onset window closes.
        </p>
      </div>

      {/* Countdown Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C8D9E6] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C8D9E6]/30 flex items-center justify-center text-[#2F4156] flex-shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900">
                {isWindowActive ? 'Reconfirmation Window Active' : 'Window Pending'}
              </span>
              <span className="text-xs text-[#567C8D] font-semibold">
                Event: {activeDisaster?.title}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#2F4156] mt-1">
              {hoursRemaining} Hours Until Predicted Impact
            </h2>
            <p className="text-xs text-[#567C8D] mt-0.5">
              Target Time: {new Date(activeDisaster?.predictedStartTime || Date.now()).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="text-center md:text-right p-4 rounded-2xl bg-[#F5EFEB] border border-[#C8D9E6]/60">
          <span className="text-[10px] font-bold uppercase text-[#567C8D]">
            Community Verification Rate
          </span>
          <p className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] mt-0.5">
            {statusData?.responseRatePercentage || 78}%
          </p>
          <span className="text-[11px] text-[#567C8D]">
            {statusData?.respondedCount || 14} of {statusData?.totalExpected || 18} Verified
          </span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Citizen Action Section: Has anything changed? */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C8D9E6] shadow-sm">
        <div className="max-w-2xl">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#567C8D]/15 text-[#2F4156]">
            Household Plan Verification
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] mt-3">
            "Your disaster plan was recorded as 'Home.' Has anything changed?"
          </h2>
          <p className="text-xs text-[#567C8D] mt-2 leading-relaxed">
            Due to the predicted severity of the oncoming flash flood, low-lying ground floor areas
            may experience water logging. Please confirm if your family intends to remain at home or
            evacuate to a designated safe shelter.
          </p>
        </div>

        {/* 3 Large Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {/* Option 1: Same Plan */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleChoice('SAME_PLAN')}
            className="group p-6 rounded-2xl bg-[#F5EFEB]/70 hover:bg-[#2F4156] border border-[#C8D9E6] hover:border-[#2F4156] text-left transition duration-200 flex flex-col justify-between shadow-sm cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-white/10 flex items-center justify-center text-[#2F4156] group-hover:text-white transition">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 group-hover:text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-[#2F4156] group-hover:text-white mt-4">
                Same Plan
              </h3>
              <p className="text-xs text-[#567C8D] group-hover:text-[#C8D9E6] mt-1">
                We are sticking to our recorded location.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-[#C8D9E6]/50 group-hover:border-white/20 flex items-center justify-between text-xs font-bold text-[#2F4156] group-hover:text-white">
              <span>Confirm Same</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Option 2: Change Location */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleChoice('CHANGE_LOCATION')}
            className="group p-6 rounded-2xl bg-[#F5EFEB]/70 hover:bg-[#567C8D] border border-[#C8D9E6] hover:border-[#567C8D] text-left transition duration-200 flex flex-col justify-between shadow-sm cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-white/10 flex items-center justify-center text-[#567C8D] group-hover:text-white transition">
                <RotateCcw className="w-5 h-5 text-blue-600 group-hover:text-blue-300" />
              </div>
              <h3 className="text-sm font-bold text-[#2F4156] group-hover:text-white mt-4">
                Change Location
              </h3>
              <p className="text-xs text-[#567C8D] group-hover:text-[#C8D9E6] mt-1">
                We are moving to a safe shelter or higher ground.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-[#C8D9E6]/50 group-hover:border-white/20 flex items-center justify-between text-xs font-bold text-[#2F4156] group-hover:text-white">
              <span>Update Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Option 3: Not Sure */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleChoice('NOT_SURE')}
            className="group p-6 rounded-2xl bg-[#F5EFEB]/70 hover:bg-amber-600 border border-[#C8D9E6] hover:border-amber-600 text-left transition duration-200 flex flex-col justify-between shadow-sm cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-white/10 flex items-center justify-center text-amber-600 group-hover:text-white transition">
                <HelpCircle className="w-5 h-5 text-amber-600 group-hover:text-amber-300" />
              </div>
              <h3 className="text-sm font-bold text-[#2F4156] group-hover:text-white mt-4">
                Not Sure
              </h3>
              <p className="text-xs text-[#567C8D] group-hover:text-amber-100 mt-1">
                Evaluating conditions as weather evolves.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-[#C8D9E6]/50 group-hover:border-white/20 flex items-center justify-between text-xs font-bold text-[#2F4156] group-hover:text-white">
              <span>Flag as Unsure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Rescuer Analytics Breakdown */}
      {user.role === 'RESCUER' && statusData?.summary && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C8D9E6] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156]">
              Rescuer Command Reconfirmation Summary
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#2F4156] text-white">
              Tactical Feed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#F5EFEB] text-center">
              <span className="text-xs font-bold text-[#567C8D]">Same Plan</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {statusData.summary.samePlan}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F5EFEB] text-center">
              <span className="text-xs font-bold text-[#567C8D]">Change Location</span>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {statusData.summary.changeLocation}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F5EFEB] text-center">
              <span className="text-xs font-bold text-[#567C8D]">Not Sure</span>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                {statusData.summary.notSure}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F5EFEB] text-center">
              <span className="text-xs font-bold text-[#567C8D]">Pending Response</span>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {statusData.summary.unconfirmed}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
