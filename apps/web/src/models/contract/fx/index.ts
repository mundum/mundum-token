import domain from "~/domain"
import { contractService } from "~/services/contract"

export const contractFx = {
  connectToContract: domain.core.createEffect({
    handler: contractService.connect,
  }),
}
