export const InjPassWallet = () => {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      {/* Background circle with gradient */}
      <circle cx="14" cy="14" r="14" fill="url(#injpass-gradient)" />
      
      {/* Lock icon representing passkey security */}
      <g transform="translate(7, 6)">
        {/* Lock body */}
        <rect
          x="2"
          y="7"
          width="10"
          height="7"
          rx="1.5"
          fill="white"
          strokeWidth="0"
        />
        
        {/* Lock shackle */}
        <path
          d="M4 7V5C4 3.34315 5.34315 2 7 2C8.65685 2 10 3.34315 10 5V7"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Fingerprint detail */}
        <circle cx="7" cy="10.5" r="1" fill="#7C3AED" />
      </g>
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="injpass-gradient" x1="0" y1="0" x2="28" y2="28">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
};
