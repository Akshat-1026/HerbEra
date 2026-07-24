import { useState, useRef } from "react";

export default function ImageZoom({ src, alt, className = "" }) {
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imgRef.current || !zoomed) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden cursor-crosshair ${className}`}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        style={
          zoomed
            ? {
                transform: "scale(2)",
                transformOrigin: `${position.x}% ${position.y}%`,
                transition: "transform 0.05s ease-out",
              }
            : {}
        }
      />
    </div>
  );
}
