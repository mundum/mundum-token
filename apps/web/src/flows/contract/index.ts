import { combine, merge, sample } from "effector"
import { BigNumber, ethers } from "ethers"
import { contractEvents as e } from "~/models/contract/events"
import { contractFx as fx } from "~/models/contract/fx"
import { contractStores as $ } from "~/models/contract/stores"
import { contractService } from "~/services/contract"
import { option as O } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import { envStores } from "~/models/environment/stores"
import { getUnixTime, differenceInSeconds } from "date-fns"

export const contractFlows = {
  init() {
    connect()
    fetchTotals()
    addClaim()
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

function addClaim() {
  combine({
    contract: $.contract,
    account: $.account,
    amount: $.amount,
    bonus: $.bonus,
    start: $.start,
    end: $.end,
  }).watch(e.addClaimRequested, $ => {
    pipe(
      $.contract,
      O.map(contract =>
        pipe(
          $.account,
          O.map(benificiary =>
            pipe(
              $.amount,
              O.map(amount =>
                pipe(
                  $.bonus,
                  O.map(async bonus => {
                    const tx = await contractService.addClaim({
                      benificiary,
                      contract,
                      amount: ethers.utils.parseEther(amount),
                      bonusAmount: ethers.utils.parseEther(bonus),
                      startUnix: getUnixTime($.start),
                      durationSeconds: differenceInSeconds($.end, $.start),
                    })
                    e.addClaimSucceeded(tx)
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
    )
  })
  e.totalsRequested.watch(fx.connectToContract)
  fx.connectToContract.doneData.watch(e.contractConnected)
}
