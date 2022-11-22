import { Event, guard, merge } from "effector"
import { navigationConstants } from "~/models/navigation/constants"
import { navigationEvents as e } from "~/models/navigation/events"
import { navigationStores as $ } from "~/models/navigation/stores"

export const navigationFlows = {
  init() {
    navigate()
    rules()
  },
}

function navigate() {
  const $nav = $.navigateFn
  $nav.watch(
    merge([e.routeRequested, e.routeTriggered]),
    (navigateFn, { to, options }) => {
      navigateFn(to, options)
    },
  )
}

// Just a helper for triggering a route on an event.
function _navTo(to: string) {
  return {
    on(event: Event<any>) {
      event.map(() => ({ to })).watch(e.routeTriggered)
    },
  }
}

function rules() {
  const { paths } = navigationConstants
}
