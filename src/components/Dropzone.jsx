import { useRef, useState, useCallback } from 'react';
import './Dropzone.css';

/**
 * Drag-and-drop file upload area with confirmation and verify-only support.
 *
 * States:
 *  - idle          → waiting for a file
 *  - drag-active   → user is dragging over the zone
 *  - verified      → verify-only format passed (no slicing)
 *  - ready         → sliceable format validated, awaiting confirmation
 *  - processing    → slicing in progress
 *
 * @param {{
 *   onFileSelected: (file: File) => void,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 *   onReset: () => void,
 *   processing: boolean,
 *   pendingFileName: string | null,
 *   verified: boolean,
 *   sliceCount: number | null,
 *   format: object,
 * }} props
 */
export default function Dropzone({
  onFileSelected,
  onConfirm,
  onCancel,
  onReset,
  processing,
  pendingFileName,
  verified,
  sliceCount,
  format,
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const isReady = !!pendingFileName && !processing && !verified;
  const isVerified = verified && !processing;
  const isBusy = isReady || isVerified || processing;

  const handleFile = useCallback(
    (file) => {
      if (!file || isBusy) return;
      if (!file.type.startsWith('image/')) return;
      onFileSelected(file);
    },
    [onFileSelected, isBusy]
  );

  /* ── Drag events ──────────────────────────────────────────────── */

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBusy) setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  };

  /* ── Click-to-browse ──────────────────────────────────────────── */

  const handleClick = () => {
    if (!isBusy) inputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = '';
  };

  /* ── Helpers ──────────────────────────────────────────────────── */

  const dimensionsLabel = format.mode === 'slice-dynamic'
    ? `${format.sliceWidth}×n × ${format.inputHeight}`
    : `${format.inputWidth}×${format.inputHeight}`;

  /* ── Render ───────────────────────────────────────────────────── */

  const stateClass = processing
    ? 'dropzone--processing'
    : isVerified
      ? 'dropzone--verified'
      : isReady
        ? 'dropzone--ready'
        : dragActive
          ? 'dropzone--active'
          : '';

  return (
    <div
      id="dropzone"
      className={`dropzone ${stateClass}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Upload your design"
    >
      {processing ? (
        /* ── Processing ─────────────────────────────────────────── */
        <>
          <div className="dropzone__spinner" />
          <p className="dropzone__processing-text">Slicing your design…</p>
        </>
      ) : isVerified ? (
        /* ── Verify-only success ────────────────────────────────── */
        <>
          <div className="dropzone__icon dropzone__icon--check">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <p className="dropzone__title">You're good to go!</p>

          <p className="dropzone__filename">{pendingFileName}</p>

          <p className="dropzone__subtitle">
            Dimensions are correct at {format.inputWidth}×{format.inputHeight}px.
          </p>

          <div className="dropzone__actions">
            <button
              className="dropzone__btn dropzone__btn--ghost"
              onClick={(e) => { e.stopPropagation(); onReset(); }}
            >
              Upload Another
            </button>
          </div>
        </>
      ) : isReady ? (
        /* ── Slice confirmation ─────────────────────────────────── */
        <>
          <div className="dropzone__icon dropzone__icon--check">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <p className="dropzone__title">Dimensions verified!</p>

          <p className="dropzone__filename">{pendingFileName}</p>

          <p className="dropzone__subtitle">
            {sliceCount
              ? `Ready to slice into ${sliceCount} posts.`
              : `Ready to slice into ${format.label.toLowerCase()} posts.`}
          </p>

          <div className="dropzone__actions">
            <button
              className="dropzone__btn dropzone__btn--primary"
              onClick={(e) => { e.stopPropagation(); onConfirm(); }}
            >
              Continue
            </button>
            <button
              className="dropzone__btn dropzone__btn--ghost"
              onClick={(e) => { e.stopPropagation(); onCancel(); }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        /* ── Idle / Drag ────────────────────────────────────────── */
        <>
          <div className="dropzone__icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          <p className="dropzone__title">
            {dragActive ? 'Drop it here!' : 'Drop your design here or click to browse'}
          </p>

          <p className="dropzone__subtitle">
            {format.mode === 'verify'
              ? 'Your image dimensions will be checked instantly.'
              : 'Your image will be validated, then you can confirm to slice & download.'}
          </p>

          <span className="dropzone__format">
            {format.label} · {dimensionsLabel}
          </span>
        </>
      )}

      <input
        ref={inputRef}
        className="dropzone__input"
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        aria-hidden="true"
      />
    </div>
  );
}
