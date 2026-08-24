import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition — wraps page content with a smooth entrance animation.
 * Replays animation on every route change.
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Remove and re-add the animation class to retrigger on route change
    el.classList.remove('animate-page-enter');
    // Force reflow
    void el.offsetWidth;
    el.classList.add('animate-page-enter');
  }, [location.pathname]);

  return (
    <div ref={ref} className="animate-page-enter">
      {children}
    </div>
  );
}
