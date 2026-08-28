import Image from "next/image";

export default function AargaLogo({ className = "h-8 w-8", alt = "AarGa Logo" }) {
  return (
    <Image
      src="/aarga-logo.png"
      alt={alt}
      width={120}
      height={120}
      className={`object-contain shrink-0 ${className}`}
      priority
    />
  );
}
