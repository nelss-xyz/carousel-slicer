import { useState, useCallback } from 'react';
import './App.css';

import ModeSelector from './components/ModeSelector';
import Dropzone from './components/Dropzone';
import SlicePreview from './components/SlicePreview';
import Toast from './components/Toast';
import BottomSheet from './components/BottomSheet';
import useIsMobile from './hooks/useIsMobile';

import { FORMATS } from './config/formats';
import { loadAndValidate, sliceImage } from './lib/slicer';
import { exportAsZip } from './lib/exporter';

export default function App() {
  const [selectedFormatId, setSelectedFormatId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [toasts, setToasts] = useState([]);
  const isMobile = useIsMobile();

  // Holds the validated image + original file while awaiting user confirmation
  const [pendingFile, setPendingFile] = useState(null);   // { file, img }
  const [verified, setVerified] = useState(false);        // verify-only success
  const [sliceCount, setSliceCount] = useState(null);     // dynamic post count

  const format = selectedFormatId ? FORMATS[selectedFormatId] : null;

  const addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ── Mode selection ───────────────────────────────────────────── */

  const handleSelectMode = useCallback((formatId) => {
    setSelectedFormatId(formatId);
    setPendingFile(null);
    setVerified(false);
    setSliceCount(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedFormatId(null);
    setPendingFile(null);
    setVerified(false);
    setSliceCount(null);
    setAnimating(false);
  }, []);

  /* ── File validation ──────────────────────────────────────────── */

  const handleFileSelected = useCallback(
    async (file) => {
      if (!format) return;

      try {
        const img = await loadAndValidate(file, format);

        if (format.mode === 'verify') {
          setPendingFile({ file, img });
          setVerified(true);
          setSliceCount(null);
        } else {
          let count = null;
          if (format.mode === 'slice-dynamic') {
            count = img.naturalWidth / format.sliceWidth;
          } else if (format.mode === 'slice-fixed') {
            count = format.slices.length;
          }
          setPendingFile({ file, img });
          setVerified(false);
          setSliceCount(count);
        }
      } catch (err) {
        addToast(err.message, 'error');
      }
    },
    [format, addToast]
  );

  /* ── Slice & export (shared logic) ────────────────────────────── */

  const doSliceAndExport = useCallback(async () => {
    if (!pendingFile || !format) return;
    const { file, img } = pendingFile;

    try {
      setProcessing(true);
      const blobs = await sliceImage(img, format);

      const baseName = file.name.replace(/\.[^/.]+$/, '') || 'carousel';
      await exportAsZip(blobs, baseName);

      addToast('Your carousel posts are ready! Check your downloads.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setProcessing(false);
      setAnimating(false);
      setPendingFile(null);
      setSliceCount(null);
    }
  }, [pendingFile, format, addToast]);

  /* ── Confirm → animate or slice directly ──────────────────────── */

  const handleConfirm = useCallback(async () => {
    if (!pendingFile || !format) return;

    const shouldAnimate = format.mode !== 'verify' && sliceCount !== null && sliceCount <= 3;

    if (shouldAnimate) {
      setAnimating(true);
      // SlicePreview will call handleAnimationComplete when done
    } else {
      await doSliceAndExport();
    }
  }, [pendingFile, format, sliceCount, doSliceAndExport]);

  const handleAnimationComplete = useCallback(() => {
    doSliceAndExport();
  }, [doSliceAndExport]);

  /* ── Cancel & Reset ───────────────────────────────────────────── */

  const handleCancel = useCallback(() => {
    setPendingFile(null);
    setVerified(false);
    setSliceCount(null);
  }, []);

  const handleReset = useCallback(() => {
    setPendingFile(null);
    setVerified(false);
    setSliceCount(null);
  }, []);

  /* ── Notification renderer ────────────────────────────────────── */

  const NotificationComponent = isMobile ? BottomSheet : Toast;

  /* ── Derive which screen to show ──────────────────────────────── */

  const showAnimation = animating && pendingFile && format;

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <h1 className="app__logo">Instagram Posting Tools</h1>
        <p className="app__tagline">
          {format
            ? format.label
            : 'Carousel Slicer | Cover Slicer | Post Validator'}
        </p>
      </header>

      {/* Back button (when a mode is selected and not animating) */}
      {format && !showAnimation && (
        <button className="app__back" onClick={handleBack} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
      )}

      {/* Main content */}
      {showAnimation ? (
        <SlicePreview
          file={pendingFile.file}
          format={format}
          imageWidth={pendingFile.img.naturalWidth}
          imageHeight={pendingFile.img.naturalHeight}
          onComplete={handleAnimationComplete}
        />
      ) : !format ? (
        <ModeSelector onSelect={handleSelectMode} />
      ) : (
        <Dropzone
          onFileSelected={handleFileSelected}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onReset={handleReset}
          processing={processing}
          pendingFileName={pendingFile?.file.name ?? null}
          verified={verified}
          sliceCount={sliceCount}
          format={format}
        />
      )}

      {/* Notifications */}
      <div className={isMobile ? 'sheet-layer' : 'toast-layer'} aria-live="polite">
        {toasts.map((t) => (
          <NotificationComponent
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="app__footer">
        Made by Nelson ❤️‍🔥
      </footer>
    </div>
  );
}
