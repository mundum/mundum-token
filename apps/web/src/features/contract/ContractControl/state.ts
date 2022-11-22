import { merge } from "effector"
import domain from "~/domain"
import { asyncLib } from "~/libs/async"
import { contractEvents } from "~/models/contract/events"
import { contractStores } from "~/models/contract/stores"

const onFetchTotalsAt = domain.ui.createEvent()
const date = domain.ui.createStore(new Date())

date.watch(onFetchTotalsAt, contractEvents.totalsAtRequested)

const e = {
  onConnectWallet: contractEvents.web3ConnectionRequested,
  onTabChange: domain.ui.createEvent<number>(),
  onAccountChange: contractEvents.accountChanged,
  onAmountChange: contractEvents.amountChanged,
  onBonusChange: contractEvents.bonusChanged,
  onStartChange: contractEvents.startChanged,
  onEndChange: contractEvents.endChanged,
  onDateChange: domain.ui.createEvent<Date>(),
  onFetchTotalsAt,
  onAddclaim: contractEvents.addClaimRequested,
}

export const contractControlState = {
  $: {
    contract: contractStores.contract,
    chainId: contractStores.chainId,
    account: contractStores.account,
    amount: contractStores.amount,
    bonus: contractStores.bonus,
    start: contractStores.start,
    end: contractStores.end,
    totals: contractStores.totals,
    totalsPending: asyncLib.pendingStore({
      start: merge([
        contractEvents.totalsRequested,
        contractEvents.totalsAtRequested,
      ]),
      end: contractEvents.totalsReceived,
    }),
    date,
    tabIndex: domain.ui
      .createStore<number>(0)
      .on(e.onTabChange, (_, payload) => payload),
  },
  e,
}
