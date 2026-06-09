import { useEffect, useState } from 'react';
import './BottomSheet.css';

const ICONS = {
  error: '⚠',
  success: '✓',
};

const AUTO_DISMISS_MS = 5000;

/**
 * Mobile-friendly bottom sheet notification.
 *
 * @param {{ message: string, type: 'error' | 'success', onClose: () => void }} props
 */
export default function BottomSheet({ message, type = 'error', onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationEnd = () => {
    if (exiting) onClose();
  };

  const handleDismiss = () => {
    setExiting(true);
  };

  return (
    <>
      {/* Scrim overlay */}
      <div
        className={`bottomsheet-overlay ${exiting ? 'bottomsheet-overlay--exit' : ''}`}
        onClick={handleDismiss}
      />

      {/* Sheet */}
      <div
        className={`bottomsheet bottomsheet--${type} ${exiting ? 'bottomsheet--exit' : ''}`}
        onAnimationEnd={handleAnimationEnd}
        role="alert"
      >
        <div className="bottomsheet__handle" />

        <div className="bottomsheet__icon">{ICONS[type]}</div>

        <p className="bottomsheet__message">{message}</p>

        <button className="bottomsheet__dismiss" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </>
  );
}
