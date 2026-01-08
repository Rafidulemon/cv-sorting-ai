export const WaveDivider =() => {
  return (
    <div className="relative -mt-2">
      <svg
        className="block w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <path
          d="M0,140 C220,210 420,30 720,110 C980,180 1150,240 1440,150 L1440,260 L0,260 Z"
          fill="rgba(255,255,255,0.6)"
        />
        <path
          d="M0,180 C260,260 440,120 720,170 C1000,220 1220,260 1440,190 L1440,260 L0,260 Z"
          fill="white"
        />
      </svg>
    </div>
  );
}