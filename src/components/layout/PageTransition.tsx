import { useLocation, useOutlet } from 'react-router-dom'

// Lightweight route-change fade, applied by keying on the pathname so React
// remounts (and thus re-triggers the CSS entrance animation for) the outlet
// content on every navigation — no router changes, no navigation delay.
export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <div key={location.pathname} className="page-transition">
      {outlet}
    </div>
  )
}
