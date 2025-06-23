
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Listener para mudanças
    mql.addEventListener("change", onChange)
    
    // Definir estado inicial
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
