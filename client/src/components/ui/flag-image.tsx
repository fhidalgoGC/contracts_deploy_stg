import React, { useState, useEffect } from 'react';
const colombiaFlag = '/assets/colombia_1753044330762.png';
const guatemalaFlag = '/assets/guatemala_1753044330764.png';

interface FlagImageProps {
  src?: string;
  alt: string;
  countrySlug?: string;
  className?: string;
  onError?: () => void;
}

// Fallback flags for specific countries
const FALLBACK_FLAGS: Record<string, string> = {
  'COL': colombiaFlag,
  'GTM': guatemalaFlag,
  'colombia': colombiaFlag,
  'guatemala': guatemalaFlag,
};

export function FlagImage({ src, alt, countrySlug, className, onError }: FlagImageProps) {
  // Validate if the source is a valid image URL or base64
  const isValidImageSrc = (imageSrc: string | undefined): boolean => {
    if (!imageSrc || imageSrc.trim() === '') return false;
    
    // Check for base64 images
    if (imageSrc.startsWith('data:image/')) return true;
    
    // Check for valid URL patterns
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://') || imageSrc.startsWith('/')) {
      return true;
    }
    
    // Check if it's an imported asset (should be a blob URL or file path)
    if (imageSrc.includes('blob:') || imageSrc.startsWith('/@') || imageSrc.includes('/assets/')) {
      return true;
    }
    
    return false;
  };

  // Get the best source to use (with immediate fallback if needed)
  const getBestSrc = (): string | undefined => {
    // If we have a valid source, use it
    if (isValidImageSrc(src)) {
      return src;
    }
    
    // If invalid or empty, try fallback by slug
    if (countrySlug && FALLBACK_FLAGS[countrySlug]) {
      console.log(`FlagImage: Using immediate fallback for slug ${countrySlug}`);
      return FALLBACK_FLAGS[countrySlug];
    }
    
    // Try fallback by country name
    const countryName = alt.toLowerCase();
    for (const [key, fallbackSrc] of Object.entries(FALLBACK_FLAGS)) {
      if (countryName.includes(key.toLowerCase())) {
        console.log(`FlagImage: Using immediate fallback for country name: ${countryName} -> ${key}`);
        return fallbackSrc;
      }
    }
    
    return src;
  };

  const [currentSrc, setCurrentSrc] = useState<string | undefined>(getBestSrc);
  const [hasError, setHasError] = useState(false);

  // Update source when props change
  useEffect(() => {
    const newSrc = getBestSrc();
    if (newSrc !== currentSrc) {
      console.log(`FlagImage: Source updated from "${currentSrc}" to "${newSrc}" for ${alt}`);
      setCurrentSrc(newSrc);
      setHasError(false);
    }
  }, [src, alt, countrySlug]);

  const handleImageError = () => {
    console.warn(`FlagImage: Image failed to load - "${currentSrc}" for ${alt} (${countrySlug})`);
    
    setHasError(true);
    
    // Try fallback flag if available and not already using it
    if (countrySlug && FALLBACK_FLAGS[countrySlug] && currentSrc !== FALLBACK_FLAGS[countrySlug]) {
      console.log(`FlagImage: Using fallback flag for slug ${countrySlug}`);
      setCurrentSrc(FALLBACK_FLAGS[countrySlug]);
      setHasError(false);
      return;
    }

    // Try fallback by country name in alt text
    const countryName = alt.toLowerCase();
    for (const [key, fallbackSrc] of Object.entries(FALLBACK_FLAGS)) {
      if (countryName.includes(key.toLowerCase()) && currentSrc !== fallbackSrc) {
        console.log(`FlagImage: Using fallback flag for country name: ${countryName} -> ${key}`);
        setCurrentSrc(fallbackSrc);
        setHasError(false);
        return;
      }
    }

    console.warn(`FlagImage: No fallback available for ${alt} (${countrySlug})`);
    
    if (onError) {
      onError();
    }
  };

  // Don't render if no valid source and has error
  if (!isValidImageSrc(currentSrc) && hasError) {
    return null;
  }

  // Don't render if source is completely invalid from the start and no fallback
  if (!isValidImageSrc(currentSrc)) {
    return null;
  }

  return (
    <img
      src={currentSrc!}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
}