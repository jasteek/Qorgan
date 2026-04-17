// Reusable Kazakh ornament patterns component
// Features: Koshkar-muyiz (ram's horn), Umai pattern, and geometric steppe motifs

interface OrnamentProps {
  variant?: "koshkar" | "umai" | "geometric" | "border";
  size?: number;
  className?: string;
  color?: string;
}

export function KazakhOrnament({
  variant = "koshkar",
  size = 100,
  className = "",
  color = "#DAA520",
}: OrnamentProps) {
  const renderPattern = () => {
    switch (variant) {
      case "koshkar":
        // Koshkar-muyiz (ram's horn) pattern
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={className}
            style={{ filter: "drop-shadow(0 0 8px rgba(218, 165, 32, 0.3))" }}
          >
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Symmetric ram's horn spirals */}
            <path
              d="M 30 50 Q 25 40 20 35 Q 15 30 15 25 Q 15 20 20 18"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 70 50 Q 75 40 80 35 Q 85 30 85 25 Q 85 20 80 18"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 30 50 Q 25 60 20 65 Q 15 70 15 75 Q 15 80 20 82"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 70 50 Q 75 60 80 65 Q 85 70 85 75 Q 85 80 80 82"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="12" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="6" fill="none" stroke="url(#goldGrad)" strokeWidth="1" />
          </svg>
        );

      case "umai":
        // Umai pattern (goddess of fertility and protection)
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={className}
            style={{ filter: "drop-shadow(0 0 8px rgba(218, 165, 32, 0.3))" }}
          >
            <defs>
              <linearGradient id="umaiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Diamond center */}
            <path
              d="M 50 20 L 70 50 L 50 80 L 30 50 Z"
              fill="none"
              stroke="url(#umaiGrad)"
              strokeWidth="2"
            />
            {/* Four-way symmetry */}
            <path d="M 50 10 L 50 30" stroke="url(#umaiGrad)" strokeWidth="2" />
            <path d="M 50 70 L 50 90" stroke="url(#umaiGrad)" strokeWidth="2" />
            <path d="M 10 50 L 30 50" stroke="url(#umaiGrad)" strokeWidth="2" />
            <path d="M 70 50 L 90 50" stroke="url(#umaiGrad)" strokeWidth="2" />
            {/* Inner ornaments */}
            <circle cx="50" cy="35" r="3" fill="url(#umaiGrad)" />
            <circle cx="50" cy="65" r="3" fill="url(#umaiGrad)" />
            <circle cx="35" cy="50" r="3" fill="url(#umaiGrad)" />
            <circle cx="65" cy="50" r="3" fill="url(#umaiGrad)" />
          </svg>
        );

      case "geometric":
        // Geometric steppe pattern
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={className}
            style={{ filter: "drop-shadow(0 0 8px rgba(218, 165, 32, 0.3))" }}
          >
            <defs>
              <linearGradient id="geoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Hexagonal pattern */}
            <path
              d="M 50 10 L 80 30 L 80 70 L 50 90 L 20 70 L 20 30 Z"
              fill="none"
              stroke="url(#geoGrad)"
              strokeWidth="2"
            />
            <path
              d="M 50 25 L 70 37.5 L 70 62.5 L 50 75 L 30 62.5 L 30 37.5 Z"
              fill="none"
              stroke="url(#geoGrad)"
              strokeWidth="1.5"
            />
            <circle cx="50" cy="50" r="8" fill="none" stroke="url(#geoGrad)" strokeWidth="1.5" />
            {/* Corner accents */}
            <circle cx="50" cy="10" r="3" fill="url(#geoGrad)" />
            <circle cx="80" cy="30" r="3" fill="url(#geoGrad)" />
            <circle cx="80" cy="70" r="3" fill="url(#geoGrad)" />
            <circle cx="50" cy="90" r="3" fill="url(#geoGrad)" />
            <circle cx="20" cy="70" r="3" fill="url(#geoGrad)" />
            <circle cx="20" cy="30" r="3" fill="url(#geoGrad)" />
          </svg>
        );

      case "border":
        // Border ornament pattern
        return (
          <svg
            width={size}
            height={size / 4}
            viewBox="0 0 200 50"
            className={className}
            preserveAspectRatio="none"
            style={{ filter: "drop-shadow(0 0 4px rgba(218, 165, 32, 0.3))" }}
          >
            <defs>
              <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="50%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M 0 25 Q 25 10 50 25 Q 75 40 100 25 Q 125 10 150 25 Q 175 40 200 25"
              fill="none"
              stroke="url(#borderGrad)"
              strokeWidth="2"
            />
            <path
              d="M 0 25 Q 25 40 50 25 Q 75 10 100 25 Q 125 40 150 25 Q 175 10 200 25"
              fill="none"
              stroke="url(#borderGrad)"
              strokeWidth="1"
              opacity="0.5"
            />
          </svg>
        );

      default:
        return null;
    }
  };

  return renderPattern();
}
