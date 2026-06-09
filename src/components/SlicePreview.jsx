import { useState, useEffect, useMemo } from 'react';
import './SlicePreview.css';

/**
 * Animated preview that shows the original image splitting into individual posts.
 *
 * Each "slice" is rendered as a div with the full image as background, positioned
 * to show only its crop region. They start joined (appearing as one image) and
 * animate apart with tilt + shadow.
 *
 * @param {{
 *   file: File,
 *   format: object,
 *   imageWidth: number,
 *   imageHeight: number,
 *   onComplete: () => void,
 * }} props
 */
export default function SlicePreview({ file, format, imageWidth, imageHeight, onComplete }) {
  const [split, setSplit] = useState(false);

  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  /* ── Compute slice coordinates ────────────────────────────────── */

  const slices = useMemo(() => {
    if (format.mode === 'slice-fixed') {
      return format.slices;
    }
    // slice-dynamic
    const n = imageWidth / format.sliceWidth;
    return Array.from({ length: n }, (_, i) => ({
      x: i * format.sliceWidth,
      y: 0,
    }));
  }, [format, imageWidth]);

  /* ── Scaling ──────────────────────────────────────────────────── */

  const maxDisplayWidth = Math.min(520, window.innerWidth * 0.85);
  const scale = maxDisplayWidth / imageWidth;
  const sliceW = Math.round(format.sliceWidth * scale);
  const sliceH = Math.round((format.sliceHeight || imageHeight) * scale);
  const bgW = Math.round(imageWidth * scale);
  const bgH = Math.round(imageHeight * scale);

  /* ── Timers ───────────────────────────────────────────────────── */

  useEffect(() => {
    // Trigger split after a brief initial pause
    const splitTimer = setTimeout(() => setSplit(true), 350);

    // Fire completion callback after the animation has played
    const completeTimer = setTimeout(() => onComplete(), 2400);

    return () => {
      clearTimeout(splitTimer);
      clearTimeout(completeTimer);
      URL.revokeObjectURL(objectUrl);
    };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Render ───────────────────────────────────────────────────── */

  const containerClass = [
    'slice-preview__container',
    split && 'slice-preview__container--split',
    slices.length === 3 && 'slice-preview__container--three',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="slice-preview">
      <div className={containerClass}>
        {slices.map((slice, i) => (
          <div
            key={i}
            className="slice-preview__slice"
            style={{
              width: sliceW,
              height: sliceH,
              backgroundImage: `url(${objectUrl})`,
              backgroundSize: `${bgW}px ${bgH}px`,
              backgroundPosition: `${-Math.round(slice.x * scale)}px 0`,
            }}
          />
        ))}
      </div>

      <p className="slice-preview__label">
        Splitting into {slices.length} posts…
      </p>
    </div>
  );
}
