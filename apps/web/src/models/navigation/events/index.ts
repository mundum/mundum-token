import domain from "~/domain"
import { NavigateFn, NavigationRequest } from "../types"

export const navigationEvents = {
  navigateFnProvided: domain.nav.createEvent<NavigateFn>(),
  routeTriggered: domain.nav.createEvent<NavigationRequest>(),
  routeRequested: domain.nav.createEvent<NavigationRequest>(),
}
