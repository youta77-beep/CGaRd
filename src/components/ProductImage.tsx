import React from 'react';

/**
 * <img> for product photos from the Sheets DB. Renders an empty placeholder box
 * (same className) instead of a broken image when there is no URL yet.
 */
export const ProductImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ src, alt, className, ...rest }) => {
  if (!src) {
    return <div role="img" aria-label={alt} className={`${className ?? ''} bg-white/5`} />;
  }
  return <img src={src} alt={alt} className={className} referrerPolicy="no-referrer" {...rest} />;
};
