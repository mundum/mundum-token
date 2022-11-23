import { Contract, BigNumber } from "ethers"
import { option as O } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import { Option } from "fp-ts/lib/Option"
import domain from "~/domain"
import { Totals } from "~/services/contract/types"
import { contractEvents as e } from "../events"

const ZERO = BigNumber.from(0)

export const contractStores = {
  contract: domain.core
    .createStore<Option<Contract>>(O.none)
    .on(e.contractConnected, (_, payload) =>
      pipe(
        O.fromNullable(payload),
        O.map(payload => payload.contract),
      ),
    ),

  chainId: domain.core
    .createStore<Option<number>>(O.none)
    .on(e.contractConnected, (_, payload) =>
      pipe(
        O.fromNullable(payload),
        O.map(payload => payload.chainId),
      ),
    ),

  account: domain.core
    .createStore<Option<string>>(O.none)
    .on(e.accountChanged, (_, payload) => O.fromNullable(payload))
    .on(e.contractConnected, (_, payload) =>
      pipe(
        O.fromNullable(payload),
        O.map(payload => payload.signerAddress),
      ),
    ),

  amount: domain.core
    .createStore<Option<string>>(O.none)
    .on(e.amountChanged, (_, payload) => O.fromNullable(payload || null)),

  bonus: domain.core
    .createStore<Option<string>>(O.none)
    .on(e.bonusChanged, (_, payload) => O.fromNullable(payload || null)),

  start: domain.core
    .createStore(new Date())
    .on(e.startChanged, (_, payload) => payload),

  end: domain.core
    .createStore(new Date())
    .on(e.endChanged, (_, payload) => payload),

  totals: domain.core
    .createStore<Totals>([ZERO, ZERO, ZERO, ZERO, ZERO, ZERO])
    .on(e.totalsReceived, (_, payload) => payload),

  txAddClaim: domain.core
    .createStore<Option<string>>(O.none)
    .on(e.addClaimSucceeded, (_, payload) => O.fromNullable(payload.hash))
    .reset(e.addClaimFailed),

  txClaim: domain.core
    .createStore<Option<string>>(O.none)
    .on(e.claimSucceeded, (_, payload) => O.fromNullable(payload.hash))
    .reset(e.claimFailed),
}
