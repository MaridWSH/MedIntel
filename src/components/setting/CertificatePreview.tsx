interface CertificatePreviewProps {
  hours: string;
  track: string;
  name: string;
  source: string;
}

export default function CertificatePreview({
  hours,
  track,
  name,
  source,
}: CertificatePreviewProps) {
  return (
    <svg viewBox="0 0 200 130" className="w-full max-w-[260px]">
      <defs>
        <linearGradient id="certGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6f3ea" />
          <stop offset="100%" stopColor="#ede5d3" />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="192"
        height="122"
        rx="4"
        fill="url(#certGrad)"
        stroke="#0b1d2a"
        strokeWidth="1"
      />
      <rect
        x="12"
        y="12"
        width="176"
        height="106"
        rx="2"
        fill="none"
        stroke="#0b1d2a"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <text
        x="100"
        y="30"
        textAnchor="middle"
        fontFamily="Zodiak, serif"
        fontSize="11"
        fontWeight="500"
        fill="#0b1d2a"
      >
        Certificate of Credit
      </text>
      <line x1="50" y1="38" x2="150" y2="38" stroke="#0b1d2a" strokeWidth="0.5" />
      <text
        x="100"
        y="54"
        textAnchor="middle"
        fontFamily="JetBrains Mono"
        fontSize="5"
        fill="#5a6b78"
        letterSpacing="0.5"
      >
        {hours} HOURS · {track.toUpperCase()} TRACK
      </text>
      <text x="100" y="68" textAnchor="middle" fontFamily="Zodiak, serif" fontSize="8" fill="#0b1d2a">
        {name}
      </text>
      <text x="100" y="78" textAnchor="middle" fontFamily="Inter" fontSize="4" fill="#5a6b78">
        {source}
      </text>
      <circle cx="100" cy="100" r="10" fill="#0d9488" />
      <path
        d="M95 100 L98.5 103 L105 96"
        stroke="#0b1d2a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="30" cy="100" r="6" fill="none" stroke="#0b1d2a" strokeWidth="0.8" />
      <circle cx="170" cy="100" r="6" fill="none" stroke="#0b1d2a" strokeWidth="0.8" />
      <text x="30" y="103" textAnchor="middle" fontFamily="Inter" fontSize="3.5" fill="#5a6b78">
        EG-MS
      </text>
      <text x="170" y="103" textAnchor="middle" fontFamily="Inter" fontSize="3.5" fill="#5a6b78">
        AB-2938
      </text>
    </svg>
  );
}
