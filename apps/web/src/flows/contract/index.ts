import { combine, merge, sample } from "effector"
import { contractEvents as e } from "~/models/contract/events"
import { contractFx as fx } from "~/models/contract/fx"
import { contractStores as $ } from "~/models/contract/stores"
import { contractService } from "~/services/contract"
import { option as O } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import { envStores } from "~/models/environment/stores"
import { getUnixTime } from "date-fns"

export const contractFlows = {
  init() {
    connect()
    fetchTotals()
  },
}

function connect() {
  e.web3ConnectionRequested.watch(fx.connectToContract)
  fx.connectToContract.doneData.watch(e.contractConnected)
}

function fetchTotals() {
  combine({ contract: $.contract, account: $.account }).watch(
    merge([
      sample({ source: envStores.dateFn, clock: e.totalsRequested }).map(
        dateFn => dateFn(),
      ),
      e.totalsAtRequested,
    ]),
    ($, date) => {
      pipe(
        $.contract,
        O.map(contract =>
          pipe(
            $.account,
            O.map(async account => {
              const totals = await contractService.totalsOfAt({
                account,
                contract,
                atUnix: getUnixTime(date.getTime()),
              })
              e.totalsReceived(totals)
            }),
          ),
        ),
      )
    },
  )
  e.totalsRequested.watch(fx.connectToContract)
  fx.connectToContract.doneData.watch(e.contractConnected)
}
