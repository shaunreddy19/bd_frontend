import React from 'react';
import { StrideLogo } from '../common/StrideLogo.tsx';
import { CalendarClock, AlertTriangle, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface ModeSelectionProps {
  onSelectMode: (mode: 'BEFORE' | 'DURING') => void;
  currentUser: { name: string; role: 'CITIZEN' | 'RESCUER' };
  onLogout: () => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({
  onSelectMode,
  currentUser,
  onLogout,
}) => {
  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#F5EFEB]">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full bg-[#C8D9E6]/25 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-[#567C8D]/15 blur-3xl" />
      </div>

      {/* Top Header with STRIDE Branding */}
      <header className="relative z-10 p-6 md:p-8 flex items-center justify-between">
        <StrideLogo size="md" showSubtitle={true} />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#C8D9E6] text-xs font-semibold text-[#2F4156] shadow-sm">
            {currentUser.role === 'RESCUER' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[#567C8D]" />
            ) : (
              <User className="w-3.5 h-3.5 text-[#567C8D]" />
            )}
            <span>{currentUser.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[#567C8D]/10 text-[#567C8D]">
              {currentUser.role}
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-semibold text-[#567C8D] hover:text-[#2F4156] transition"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Center 2 Mode Choice Cards */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Choice 1: BEFORE DISASTER */}
          <button
            type="button"
            onClick={() => onSelectMode('BEFORE')}
            className="group relative text-left bg-white/95 hover:bg-white p-8 md:p-10 rounded-3xl border border-[#C8D9E6] hover:border-[#567C8D] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C8D9E6]/30 group-hover:bg-[#C8D9E6]/50 flex items-center justify-center text-[#567C8D] group-hover:text-[#2F4156] transition-colors">
                <CalendarClock className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] tracking-tight">
                  BEFORE DISASTER
                </h2>
                <p className="text-sm font-medium text-[#567C8D] mt-2">
                  Prepare, plan and stay informed.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F5EFEB] flex items-center justify-between text-xs font-bold text-[#2F4156]">
              <span className="text-[#567C8D] group-hover:text-[#2F4156] transition">
                Preparedness & Planning Mode
              </span>
              <div className="w-8 h-8 rounded-full bg-[#F5EFEB] group-hover:bg-[#2F4156] group-hover:text-white flex items-center justify-center transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Choice 2: DURING DISASTER */}
          <button
            type="button"
            onClick={() => onSelectMode('DURING')}
            className="group relative text-left bg-white/95 hover:bg-white p-8 md:p-10 rounded-3xl border border-[#C8D9E6] hover:border-[#DC2626] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] tracking-tight">
                  DURING DISASTER
                </h2>
                <p className="text-sm font-medium text-[#567C8D] mt-2">
                  Active response, emergency status and live rescue operations.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F5EFEB] flex items-center justify-between text-xs font-bold text-[#2F4156]">
              <span className="text-red-600">
                Live Incident Command & SOS
              </span>
              <div className="w-8 h-8 rounded-full bg-red-50 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center text-red-600 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#567C8D]/80">
        STRIDE Platform • Sensor Trend Intelligence for Detection & Evaluation
      </footer>
    </div>
  );
};
