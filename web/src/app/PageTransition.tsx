import { useEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

const EXIT_DURATION = 110

/** Keep the outgoing page mounted only long enough to fade it out. */
export function PageTransition() {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  const latestOutlet = useRef(outlet)
  latestOutlet.current = outlet
  const [displayed, setDisplayed] = useState({ pathname, outlet })
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (pathname === displayed.pathname) {
      setLeaving(false)
      return
    }
    const showPage = () => {
      setDisplayed({ pathname, outlet: latestOutlet.current })
      setLeaving(false)
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showPage()
      return
    }
    setLeaving(true)
    const timer = window.setTimeout(showPage, EXIT_DURATION)
    return () => window.clearTimeout(timer)
  }, [pathname, displayed.pathname])

  return <div key={displayed.pathname} className={`page-transition${leaving ? ' page-transition--leaving' : ''}`} inert={leaving}>
    {displayed.outlet}
  </div>
}
