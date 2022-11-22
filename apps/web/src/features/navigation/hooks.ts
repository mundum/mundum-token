import * as React from "react"
import { useNavigate } from "react-router"
import { routerNavigation } from "./state"

export function useRouterNavigation() {
  const { c, spi } = routerNavigation
  const navigate = useNavigate()
  React.useEffect(() => {
    spi.onNavigateFn(navigate)
    window.scrollTo(0,0);
  }, [spi, navigate])

  return {
    $: c,
    spi,
  }
}
