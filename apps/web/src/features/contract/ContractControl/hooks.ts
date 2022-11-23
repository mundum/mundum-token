import { useStore } from "effector-react"
import { contractControlState } from "./state"

export function useContractControl() {
  const { $, e } = contractControlState

  return {
    $: {
      contract: useStore($.contract),
      chainId: useStore($.chainId),
      tabIndex: useStore($.tabIndex),
      account: useStore($.account),
      amount: useStore($.amount),
      bonus: useStore($.bonus),
      start: useStore($.start),
      end: useStore($.end),
      date: useStore($.date),
      totals: useStore($.totals),
      totalsUpToDate: useStore($.totalsUpToDate),
      txAddClaim: useStore($.txAddClaim),
      txClaim: useStore($.txClaim),
      totalsPending: useStore($.totalsPending),
      addClaimPending: useStore($.addClaimPending),
      claimPending: useStore($.claimPending),
    },
    e,
  }
}
