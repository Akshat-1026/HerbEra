export default function Picture({ src, alt = "", className = "", ...props }) {
  if (!src) return null;

  const webpSrc = src.replace(/\.(jpe?g)$/i, ".webp");

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={src} alt={alt} className={className} loading="lazy" decoding="async" {...props} />
    </picture>
  );
}
