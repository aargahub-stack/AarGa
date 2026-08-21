export default function AargaLogo({ className = "h-8 w-8" }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AarGa logo"
    >
      <rect width="40" height="40" rx="11" fill="#0D1912" />
      <path
        d="M20 8L30 30H25.2L23.4 25.6H16.6L14.8 30H10L20 8Z"
        fill="url(#aarga-grad)"
      />
      <path d="M18.2 21.2H21.8L20 16.8L18.2 21.2Z" fill="#0D1912" />
      <defs>
        <linearGradient id="aarga-grad" x1="10" y1="8" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6EE7B7" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}
