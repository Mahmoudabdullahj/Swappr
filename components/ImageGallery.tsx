'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  conditionBadge?: React.ReactNode;
}

export default function ImageGallery({ images, alt, conditionBadge }: ImageGalleryProps) {
  const [active, setActive]       = useState(0);
  const [lightbox, setLightbox]   = useState(false);
  const [lbIndex, setLbIndex]     = useState(0);

  const openLightbox = (i: number) => { setLbIndex(i); setLightbox(true); };
  const closeLightbox = () => setLightbox(false);

  const prev = useCallback(() => setLbIndex(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setLbIndex(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, prev, next]);

  const src = images[active] ?? '';

  return (
    <>
      {/* Main image + thumbnails */}
      <div className={styles['item-detail-image-wrap']}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className={styles['gallery-main-img']}
            onClick={() => openLightbox(active)}
            title="Click to enlarge"
            onError={e => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className={styles['gallery-placeholder']}>📦</div>
        )}
        {conditionBadge}
      </div>

      {images.length > 1 && (
        <div className={styles['gallery-thumbs']}>
          {images.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt={`${alt} ${i + 1}`}
              className={`${styles['gallery-thumb']}${active === i ? ` ${styles.active}` : ''}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className={styles['lightbox-overlay']}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button className={styles['lightbox-close']} onClick={closeLightbox} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {images.length > 1 && (
            <button className={`${styles['lightbox-arrow']} ${styles['lightbox-prev']}`} onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lbIndex]}
            alt={`${alt} ${lbIndex + 1}`}
            className={styles['lightbox-img']}
            onClick={e => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button className={`${styles['lightbox-arrow']} ${styles['lightbox-next']}`} onClick={e => { e.stopPropagation(); next(); }} aria-label="Next image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {images.length > 1 && (
            <div className={styles['lightbox-dots']}>
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`${styles['lightbox-dot']}${i === lbIndex ? ` ${styles.active}` : ''}`}
                  onClick={e => { e.stopPropagation(); setLbIndex(i); }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
