// Image Primitive (Next.js Wrapper with Enforced Alt Text)
// This wraps Next.js Image for web, can be replaced with React Native Image

import NextImage from 'next/image';

export interface ImageProps {
  src: string;
  alt: string; // Required for accessibility
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
}

export function Image({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  objectFit = 'cover',
}: ImageProps) {
  if (fill) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        style={{ objectFit }}
      />
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      priority={priority}
      className={className}
      style={{ objectFit }}
    />
  );
}
