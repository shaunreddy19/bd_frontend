import React from 'react';

interface StrideLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  light?: boolean;
}

export const StrideLogo: React.FC<StrideLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  light = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Dynamic S Logo Emblem */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="stride-teal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#567C8D" />
              <stop offset="100%" stopColor="#3B5968" />
            </linearGradient>
            <linearGradient id="stride-navy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2F4156" />
              <stop offset="100%" stopColor="#1B2836" />
            </linearGradient>
          </defs>

          {/* Top-right sensor waves */}
          <path
            d="M 310 130 A 40 40 0 0 1 340 160"
            stroke="#567C8D"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M 320 100 A 75 75 0 0 1 375 155"
            stroke="#567C8D"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 330 70 A 110 110 0 0 1 410 150"
            stroke="#567C8D"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Bottom-left sensor waves */}
          <path
            d="M 190 290 A 40 40 0 0 1 160 260"
            stroke="#567C8D"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M 180 320 A 75 75 0 0 1 125 265"
            stroke="#567C8D"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 170 350 A 110 110 0 0 1 90 270"
            stroke="#567C8D"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* S curve ribbons */}
          <path
            d="M 330 190 C 315 130, 250 110, 195 130 C 145 148, 130 195, 145 240 C 160 280, 205 290, 255 305 C 325 325, 345 370, 330 420 C 310 470, 230 480, 175 445 C 145 425, 135 390, 140 360"
            stroke="url(#stride-navy-grad)"
            strokeWidth="42"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 160 215 C 180 150, 240 125, 305 145 C 330 155, 335 175, 320 205 C 300 240, 235 255, 185 275 C 150 295, 140 330, 150 365"
            stroke="url(#stride-teal-grad)"
            strokeWidth="30"
            strokeLinecap="round"
          />

          {/* Central sensor trend line */}
          <line x1="200" y1="240" x2="245" y2="210" stroke="#2F4156" strokeWidth="8" strokeLinecap="round" />
          <line x1="245" y1="210" x2="280" y2="230" stroke="#2F4156" strokeWidth="8" strokeLinecap="round" />
          <circle cx="200" cy="240" r="9" fill="#2F4156" />
          <circle cx="245" cy="210" r="9" fill="#2F4156" />
          <circle cx="280" cy="230" r="9" fill="#2F4156" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-['Space_Grotesk',sans-serif] font-bold tracking-[0.25em] ${titleSizes[size]} ${
              light ? 'text-white' : 'text-[#2F4156]'
            }`}
          >
            STRIDE
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[10px] tracking-tight leading-tight font-medium ${
              light ? 'text-[#C8D9E6]' : 'text-[#567C8D]'
            }`}
          >
            Sensor Trend Intelligence for Detection & Evaluation
          </span>
        )}
      </div>
    </div>
  );
};
