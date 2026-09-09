import React, { useState } from 'react';
import { StrideLogo } from '../common/StrideLogo.tsx';
import { authService, User } from '../../services/authService.ts';
import { ShieldCheck, UserCheck, ArrowRight, Loader2, Sparkles, User as UserIcon, Phone, CreditCard } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'CITIZEN' | 'RESCUER'>('CITIZEN');
  const [aadharNumber, setAadharNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format Aadhaar with spaces (xxxx xxxx xxxx) as user types
  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    // Format into groups of 4: "1234 5678 9012"
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadharNumber(formatted);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(raw);
  };

  // Prefill sample details without auto-submitting so user can review and edit
  const handlePrefillSample = (role: 'CITIZEN' | 'RESCUER') => {
    setError(null);
    if (role === 'CITIZEN') {
      setSelectedRole('CITIZEN');
      setAadharNumber('5432 8901 2345');
      setFullName('Arun Kumar');
      setMobileNumber('9840112345');
    } else {
      setSelectedRole('RESCUER');
      setAadharNumber('RES-88210');
      setFullName('Capt. Vikram Rathore');
      setMobileNumber('9880011223');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = aadharNumber.replace(/\s+/g, '').trim();
    const cleanPhone = mobileNumber.replace(/\s+/g, '').trim();
    const cleanName = fullName.trim();

    if (!cleanId) {
      setError(selectedRole === 'CITIZEN' ? 'Please enter your 12-digit Aadhaar number.' : 'Please enter your Rescuer ID.');
      return;
    }

    if (selectedRole === 'CITIZEN' && cleanId.length < 4) {
      setError('Please enter a valid Aadhaar number.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First attempt login
      try {
        const res = await authService.login({
          testIdentityNumber: cleanId,
          mobileNumber: cleanPhone,
          name: cleanName || (selectedRole === 'CITIZEN' ? 'STRIDE Citizen' : 'Rescuer Officer'),
          role: selectedRole,
          password: 'stride123',
        });
        localStorage.setItem('stride_token', res.token);
        localStorage.setItem('stride_user', JSON.stringify(res.user));
        if (selectedRole === 'CITIZEN') {
          localStorage.setItem('stride_saved_citizen', JSON.stringify(res.user));
        }
        onLoginSuccess(res.user);
        return;
      } catch (loginErr: any) {
        // If user doesn't exist, auto-signup with the entered details
        if (loginErr.statusCode === 401 || loginErr.message?.includes('not found') || loginErr.message?.includes('Invalid credentials')) {
          const signupRes = await authService.signup({
            name: cleanName || (selectedRole === 'CITIZEN' ? 'STRIDE Citizen' : 'Rescuer Officer'),
            testIdentityNumber: cleanId,
            mobileNumber: cleanPhone,
            role: selectedRole,
            password: 'stride123',
          });
          localStorage.setItem('stride_token', signupRes.token);
          localStorage.setItem('stride_user', JSON.stringify(signupRes.user));
          if (selectedRole === 'CITIZEN') {
            localStorage.setItem('stride_saved_citizen', JSON.stringify(signupRes.user));
          }
          onLoginSuccess(signupRes.user);
          return;
        }
        throw loginErr;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#F5EFEB]">
      {/* Subtle Animated Background Elements: Gentle moving shapes & sensor waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#C8D9E6]/30 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#567C8D]/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-[#C8D9E6]/25 blur-2xl" />

        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="sensorGrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="#567C8D"
                strokeWidth="0.75"
                strokeDasharray="4 4"
              />
              <circle cx="80" cy="80" r="1.5" fill="#567C8D" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sensorGrid)" />
          <circle cx="20%" cy="30%" r="240" fill="none" stroke="#567C8D" strokeWidth="0.75" strokeDasharray="3 6" opacity="0.4" />
          <circle cx="85%" cy="75%" r="320" fill="none" stroke="#2F4156" strokeWidth="0.75" opacity="0.3" />
        </svg>
      </div>

      {/* Top Header with STRIDE Branding */}
      <header className="relative z-10 p-6 md:p-8 flex items-center justify-between">
        <StrideLogo size="md" showSubtitle={true} />
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-[#C8D9E6]/60 text-xs font-semibold text-[#567C8D] backdrop-blur-sm">
          <ShieldCheck className="w-4 h-4 text-[#567C8D]" />
          <span>Disaster Intelligence Protocol Active</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-[#2F4156]/8 border border-[#C8D9E6]/60 p-7 sm:p-9 transition-all">
          {/* Header Typography */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk',sans-serif] text-[#2F4156] tracking-tight">
              Welcome to STRIDE
            </h1>
            <p className="text-sm font-medium text-[#567C8D] mt-1.5">
              Sensor Trend Intelligence for Detection & Evaluation
            </p>
          </div>

          {/* Role selector tab: Clicking switches mode and allows typing details */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#F5EFEB] rounded-2xl text-xs font-bold mb-6">
            <button
              id="role-tab-citizen"
              type="button"
              onClick={() => {
                setSelectedRole('CITIZEN');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'CITIZEN'
                  ? 'bg-white text-[#2F4156] shadow-sm font-bold border border-[#C8D9E6]/60'
                  : 'text-[#567C8D] hover:text-[#2F4156]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Citizen Portal</span>
            </button>
            <button
              id="role-tab-rescuer"
              type="button"
              onClick={() => {
                setSelectedRole('RESCUER');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'RESCUER'
                  ? 'bg-[#2F4156] text-white shadow-sm font-bold'
                  : 'text-[#567C8D] hover:text-[#2F4156]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Rescuer Command</span>
            </button>
          </div>

          {/* Context Banner */}
          <div className="mb-5 p-3 rounded-xl bg-[#F5EFEB]/60 border border-[#C8D9E6]/50 flex items-center justify-between">
            <div className="text-xs text-[#567C8D]">
              <span className="font-semibold text-[#2F4156] block">
                {selectedRole === 'CITIZEN' ? 'Citizen Sign In / Registration' : 'Rescuer Command Access'}
              </span>
              <span>
                {selectedRole === 'CITIZEN'
                  ? 'Enter your Aadhaar, Name, and Mobile number below'
                  : 'Enter responder badge ID and mobile number'}
              </span>
            </div>
            <button
              id="btn-prefill-sample"
              type="button"
              onClick={() => handlePrefillSample(selectedRole)}
              className="text-[11px] font-bold text-[#567C8D] hover:text-[#2F4156] bg-white px-2.5 py-1.5 rounded-lg border border-[#C8D9E6] shadow-xs hover:bg-[#F5EFEB] transition flex items-center gap-1 cursor-pointer"
              title="Click to fill sample details for testing"
            >
              <Sparkles className="w-3 h-3 text-[#567C8D]" />
              <span>Autofill Sample</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Input Form for Details */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Aadhaar Number (or Rescuer ID) */}
            <div>
              <label
                htmlFor="citizen-aadhaar-input"
                className="block text-xs font-bold text-[#2F4156] mb-1.5 flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#567C8D]" />
                <span>{selectedRole === 'CITIZEN' ? 'Aadhaar Number' : 'Responder Badge / ID'}</span>
                <span className="text-[10px] font-normal text-[#567C8D]">
                  {selectedRole === 'CITIZEN' ? '(12-digit UID)' : '(Service ID)'}
                </span>
              </label>
              <input
                id="citizen-aadhaar-input"
                type="text"
                value={aadharNumber}
                onChange={selectedRole === 'CITIZEN' ? handleAadharChange : (e) => setAadharNumber(e.target.value)}
                placeholder={selectedRole === 'CITIZEN' ? 'e.g. 5432 8901 2345' : 'e.g. RES-88210'}
                className="w-full px-4 py-2.5 rounded-xl border border-[#C8D9E6] focus:border-[#567C8D] focus:ring-2 focus:ring-[#567C8D]/20 outline-none text-sm font-medium text-[#2F4156] placeholder-[#567C8D]/50 bg-white transition"
                required
              />
              <span className="text-[11px] text-[#567C8D] mt-1 block">
                {selectedRole === 'CITIZEN'
                  ? 'Used to link household members, verify shelter bookings & safety status.'
                  : 'Official disaster response agency identifier.'}
              </span>
            </div>

            {/* Field 2: Full Name */}
            <div>
              <label
                htmlFor="citizen-name-input"
                className="block text-xs font-bold text-[#2F4156] mb-1.5 flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#567C8D]" />
                <span>Full Name</span>
              </label>
              <input
                id="citizen-name-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={selectedRole === 'CITIZEN' ? 'e.g. Shaun Reddy' : 'e.g. Capt. Vikram Rathore'}
                className="w-full px-4 py-2.5 rounded-xl border border-[#C8D9E6] focus:border-[#567C8D] focus:ring-2 focus:ring-[#567C8D]/20 outline-none text-sm font-medium text-[#2F4156] placeholder-[#567C8D]/50 bg-white transition"
                required
              />
            </div>

            {/* Field 3: Mobile Number */}
            <div>
              <label
                htmlFor="citizen-mobile-input"
                className="block text-xs font-bold text-[#2F4156] mb-1.5 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#567C8D]" />
                <span>Mobile Number</span>
                <span className="text-[10px] font-normal text-[#567C8D]">(10 digits)</span>
              </label>
              <input
                id="citizen-mobile-input"
                type="tel"
                value={mobileNumber}
                onChange={handleMobileChange}
                placeholder="e.g. 9840112345"
                className="w-full px-4 py-2.5 rounded-xl border border-[#C8D9E6] focus:border-[#567C8D] focus:ring-2 focus:ring-[#567C8D]/20 outline-none text-sm font-medium text-[#2F4156] placeholder-[#567C8D]/50 bg-white transition"
                required
              />
              <span className="text-[11px] text-[#567C8D] mt-1 block">
                Primary contact for early warning alerts and evacuation broadcast notifications.
              </span>
            </div>

            {/* Primary Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-6 rounded-xl bg-[#2F4156] hover:bg-[#1F2D3D] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#2F4156]/15 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C8D9E6]" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedRole === 'CITIZEN' ? 'Enter Citizen Portal' : 'Access Rescuer Command'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#C8D9E6]" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Footnote */}
          <p className="text-center text-xs text-[#567C8D] mt-6 leading-relaxed">
            STRIDE encrypts your identity credentials for emergency preparedness and live rescue coordination.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#567C8D]/80">
        STRIDE Platform • Sensor Trend Intelligence for Detection & Evaluation • National Disaster Protocol
      </footer>
    </div>
  );
};
