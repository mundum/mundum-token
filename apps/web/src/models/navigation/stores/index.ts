import domain from "~/domain"
import { NavigateFn } from "../types"
import { navigationEvents } from "../events"

export const navigationStores = {
  navigateFn: domain.nav
    .createStore<NavigateFn>(route => {
      throw new Error(
        `Tried to navigation to ${route} before navigateFn was set`,
      )
    })
    .on(navigationEvents.navigateFnProvided, (_, payload) => payload),
}
