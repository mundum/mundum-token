import { merge } from "effector"
import domain from "~/domain"
import { asyncLib } from "~/libs/async"
import { contractEvents } from "~/models/contract/events"
import { contractStores } from "~/models/contract/stores"

const onFetchTotalsAt = domain.ui.createEvent()
const onDateChange = domain.ui.createEvent<Date>()
const date = domain.ui
  .createStore(new Date())
  .on(onDateChange, (_, date) => date)

const totalsUpToDate = domain.ui
  .createStore(false)
  .on(contractEvents.totalsReceived, () => true)
  .reset(onDateChange, contractEvents.accountChanged)

date.watch(onFetchTotalsAt, contractEvents.totalsAtRequested)

const e = {
  onConnectWallet: contractEvents.web3ConnectionRequested,
  onTabChange: domain.ui.createEvent<number>(),
  onAccountChange: contractEvents.accountChanged,
  onAmountChange: contractEvents.amountChanged,
  onBonusChange: contractEvents.bonusChanged,
  onStartChange: contractEvents.startChanged,
  onEndChange: contractEvents.endChanged,
  onDateChange,
  onFetchTotalsAt,
  onAddClaim: contractEvents.addClaimRequested,
  onClaim: contractEvents.claimRequested,
}

export const contractControlState = {
  $: {
    totalsUpToDate,
    contract: contractStores.contract,
    chainId: contractStores.chainId,
    account: contractStores.account,
    amount: contractStores.amount,
    bonus: contractStores.bonus,
    start: contractStores.start,
    end: contractStores.end,
    totals: contractStores.totals,
    txAddClaim: contractStores.txAddClaim,
    txClaim: contractStores.txClaim,
    totalsPending: asyncLib.pendingStore({
      start: merge([
        contractEvents.totalsRequested,
        contractEvents.totalsAtRequested,
      ]),
      end: contractEvents.totalsReceived,
    }),
    addClaimPending: asyncLib.pendingStore({
      start: contractEvents.addClaimRequested,
      end: merge([
        contractEvents.addClaimSucceeded,
        contractEvents.addClaimFailed,
      ]),
    }),
    claimPending: asyncLib.pendingStore({
      start: contractEvents.claimRequested,
      end: merge([contractEvents.claimSucceeded, contractEvents.claimFailed]),
    }),
    date,
    tabIndex: domain.ui
      .createStore<number>(0)
      .on(e.onTabChange, (_, payload) => payload),
  },
  e,
}
