import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 640;

/**
 * Returns true when the viewport width is at or below the mobile breakpoint.
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const onChange = (e) => setIsMobile(e.matches);

    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
