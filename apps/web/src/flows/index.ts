import { contractFlows } from "./contract"
import { navigationFlows } from "./navigation"

export const flows = {
  init() {
    navigationFlows.init()
    contractFlows.init()
  },
}
