import { navigationConstants } from "~/models/navigation/constants"
import { navigationEvents } from "~/models/navigation/events"
import { NavigateFn } from "~/models/navigation/types"

export const routerNavigation = {
  c: {
    paths: navigationConstants.paths,
  },
  spi: {
    onNavigateFn(fn: NavigateFn) {
      navigationEvents.navigateFnProvided(fn)
    },
  },
}
