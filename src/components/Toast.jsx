import { useEffect, useState } from 'react';
import './Toast.css';

const ICONS = {
  error: '⚠',
  success: '✓',
};

const AUTO_DISMISS_MS = 5000;

/**
 * Animated toast notification.
 *
 * @param {{ message: string, type: 'error' | 'success', onClose: () => void }} props
 */
export default function Toast({ message, type = 'error', onClose }) {
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

  const handleClose = () => {
    setExiting(true);
  };

  return (
    <div
      className={`toast toast--${type} ${exiting ? 'toast-exit' : ''}`}
      onAnimationEnd={handleAnimationEnd}
      role="alert"
    >
      <span className="toast__icon">{ICONS[type]}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={handleClose} aria-label="Dismiss">
        ✕
      </button>
      <div
        className="toast__progress"
        style={{ animationDuration: `${AUTO_DISMISS_MS}ms` }}
      />
    </div>
  );
}
