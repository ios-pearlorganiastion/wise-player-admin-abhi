import React from "react";

let _uid = 0;

const WisePlayerLogo = ({
  size = 40,
  animate = false,
  bg = "#141215",
  className = "",
}) => {
  const [uid] = React.useState(() => `wpl${++_uid}`);
  const gid = `${uid}g`;

  const BARS = [
    { x: 2, y: 32, h: 36, fill: "#c0272d", delay: "0.00s", px: 6.5 },
    { x: 12.5, y: 23, h: 54, fill: "#991c22", delay: "0.13s", px: 17 },
    { x: 23, y: 16, h: 68, fill: "#6e1216", delay: "0.26s", px: 27.5 },
    { x: 33.5, y: 10, h: 80, fill: "#4a0c10", delay: "0.39s", px: 38 },
    { x: 57.5, y: 10, h: 80, fill: "#4a0c10", delay: "0.52s", px: 62 },
    { x: 68, y: 16, h: 68, fill: "#6e1216", delay: "0.65s", px: 72.5 },
    { x: 78.5, y: 23, h: 54, fill: "#991c22", delay: "0.78s", px: 83 },
    { x: 89, y: 32, h: 36, fill: "#c0272d", delay: "0.91s", px: 93.5 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="WisePlayer"
      role="img"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#c0272d" />
          <stop offset="100%" stopColor="#800000" />
        </linearGradient>
      </defs>

      {animate && (
        <style>{`
          @keyframes ${uid}w {
            0%  { transform: scaleY(1)   }
            25% { transform: scaleY(.3)  }
            55% { transform: scaleY(.75) }
            80% { transform: scaleY(.15) }
            100%{ transform: scaleY(1)   }
          }
          @keyframes ${uid}t {
            0%,100% { opacity: 1   }
            50%     { opacity: .82 }
          }
        `}</style>
      )}

      {BARS.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={9}
          height={b.h}
          rx={4.5}
          fill={b.fill}
          style={
            animate
              ? {
                  animation: `${uid}w 1.1s ease-in-out infinite ${b.delay}`,
                  transformOrigin: `${b.px}px 50px`,
                }
              : undefined
          }
        />
      ))}

      <polygon points="34,16 34,84 93,50" fill={bg} />

      <polygon
        points="38,20 38,80 89,50"
        fill={`url(#${gid})`}
        style={animate ? { animation: `${uid}t 2.4s ease-in-out infinite` } : undefined}
      />

      <polygon points="41,23 41,50 65,37" fill="rgba(255,255,255,0.20)" />
    </svg>
  );
};

export default WisePlayerLogo;